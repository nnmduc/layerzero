#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.cargo/bin:$PATH"

# Set APPLE_SIGNING_IDENTITY in your environment for Developer ID signing,
# or leave unset to default to ad-hoc signing ("-") for local/community builds.
SIGN_ID="${APPLE_SIGNING_IDENTITY:--}"
ENTITLEMENTS="$DIR/frontend/src-tauri/entitlements.plist"
DMG_OUT_DIR="$DIR/frontend/src-tauri/target/release/bundle/dmg"
mkdir -p "$DIR/frontend/src-tauri/binaries" "$DMG_OUT_DIR"

SIGN_FLAGS=(--force --entitlements "$ENTITLEMENTS")
if [ "$SIGN_ID" != "-" ]; then
  SIGN_FLAGS+=(--options runtime --timestamp)
fi

# ==============================================================================
# Helper: Build & Sign Python Sidecar for a given target triple
# ==============================================================================
build_sidecar() {
  local TARGET="$1"
  local VENV_DIR="$2"
  local ARCH_PREFIX="$3"
  local BIN_PATH="$DIR/frontend/src-tauri/binaries/layerzero-backend-$TARGET"

  if [ ! -f "$BIN_PATH" ] || [ "$REBUILD_BACKEND" = "1" ]; then
    echo "------------------------------------------------------------"
    echo "Building Python FastAPI Sidecar for $TARGET..."
    echo "------------------------------------------------------------"
    (
      cd "$DIR/backend"
      $ARCH_PREFIX "$VENV_DIR/bin/pyinstaller" --noconfirm --clean --onefile \
        --name "layerzero-backend-$TARGET" \
        --distpath "$DIR/frontend/src-tauri/binaries" \
        --workpath "$DIR/backend/build_pyinstaller_$TARGET" \
        --specpath "$DIR/backend/build_pyinstaller_$TARGET" \
        --add-data "$DIR/backend/schemas:schemas" \
        --hidden-import "uvicorn.logging" \
        --hidden-import "uvicorn.loops" \
        --hidden-import "uvicorn.loops.auto" \
        --hidden-import "uvicorn.protocols" \
        --hidden-import "uvicorn.protocols.http" \
        --hidden-import "uvicorn.protocols.http.auto" \
        --hidden-import "uvicorn.protocols.websockets" \
        --hidden-import "uvicorn.protocols.websockets.auto" \
        --hidden-import "uvicorn.lifespan" \
        --hidden-import "uvicorn.lifespan.on" \
        --hidden-import "multipart" \
        main.py
    )
    rm -rf "$DIR/backend/build_pyinstaller_$TARGET"
  fi

  echo "Signing Sidecar ($TARGET) with identity '$SIGN_ID'..."
  codesign "${SIGN_FLAGS[@]}" --sign "$SIGN_ID" "$BIN_PATH"
}

# ==============================================================================
# Helper: Build Tauri .app, Sign, Verify & Package into Signed .dmg
# ==============================================================================
build_tauri_dmg() {
  local TARGET="$1"
  local DMG_NAME="$2"
  local VOL_NAME="$3"

  echo "============================================================"
  echo "Building Tauri v2 App for $TARGET -> $DMG_NAME"
  echo "============================================================"
  (
    cd "$DIR/frontend"
    npx tauri build --target "$TARGET" --bundles app
  )

  local APP_PATH="$DIR/frontend/src-tauri/target/$TARGET/release/bundle/macos/LayerZero.app"

  # Re-sign embedded sidecar and outer .app with PyInstaller Hardened Runtime entitlements
  codesign "${SIGN_FLAGS[@]}" --sign "$SIGN_ID" \
    "$APP_PATH/Contents/MacOS/layerzero-backend"
  codesign "${SIGN_FLAGS[@]}" --sign "$SIGN_ID" \
    "$APP_PATH"

  echo "Verifying $APP_PATH ($TARGET)..."
  codesign --verify --deep --strict --verbose=2 "$APP_PATH"
  file "$APP_PATH/Contents/MacOS/layerzero"
  file "$APP_PATH/Contents/MacOS/layerzero-backend"

  local STAGING="$DMG_OUT_DIR/staging_$TARGET"
  local DMG_PATH="$DMG_OUT_DIR/$DMG_NAME"

  rm -rf "$STAGING" "$DMG_PATH"
  mkdir -p "$STAGING"
  cp -R "$APP_PATH" "$STAGING/LayerZero.app"
  ln -s /Applications "$STAGING/Applications"

  hdiutil create -volname "$VOL_NAME" \
    -srcfolder "$STAGING" \
    -ov -format UDZO \
    "$DMG_PATH"

  rm -rf "$STAGING"

  if [ "$SIGN_ID" != "-" ]; then
    echo "Signing $DMG_NAME with $SIGN_ID..."
    codesign --force --timestamp --sign "$SIGN_ID" "$DMG_PATH"
    codesign --verify --verbose=2 "$DMG_PATH"
  fi
}

if [ "$1" = "--rebuild-backend" ]; then
  REBUILD_BACKEND="1"
fi

# 1. Build Apple Silicon (aarch64-apple-darwin)
build_sidecar "aarch64-apple-darwin" "$DIR/backend/.venv" ""
build_tauri_dmg "aarch64-apple-darwin" "LayerZero_2.0.0_Apple_Silicon_arm64.dmg" "LayerZero (Apple Silicon)"

# 2. Optionally build Intel (x86_64-apple-darwin) if .venv-x86_64 is present
if [ -d "$DIR/backend/.venv-x86_64" ]; then
  build_sidecar "x86_64-apple-darwin" "$DIR/backend/.venv-x86_64" "arch -x86_64"
  build_tauri_dmg "x86_64-apple-darwin" "LayerZero_2.0.0_Intel_x64.dmg" "LayerZero (Intel)"
fi

echo ""
echo "✅ macOS Build Complete!"
echo "   • Signing Identity : $SIGN_ID"
echo "   • Output Directory : $DMG_OUT_DIR"
