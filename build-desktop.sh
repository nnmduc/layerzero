#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.cargo/bin:$PATH"

# Set APPLE_SIGNING_IDENTITY in your environment for Developer ID signing,
# or leave unset to default to ad-hoc signing ("-") for local/community builds.
SIGN_ID="${APPLE_SIGNING_IDENTITY:--}"
# Set APPLE_NOTARY_PROFILE (defaults to "layerzero-notary" if available) to notarize and staple DMGs.
# Set SKIP_NOTARIZATION=1 to bypass.
NOTARY_PROFILE="${APPLE_NOTARY_PROFILE:-layerzero-notary}"
# DMG file version: the app version from tauri.conf.json, or RELEASE_VERSION for a pre-release
# (e.g. RELEASE_VERSION=2.3.0-beta.1 names files LayerZero_2.3.0-beta.1_*.dmg; the app stays 2.3.0
# because Windows MSI versions must be numeric).
APP_VERSION="$(sed -n 's/^  "version": "\(.*\)",$/\1/p' "$DIR/frontend/src-tauri/tauri.conf.json")"
RELEASE_VERSION="${RELEASE_VERSION:-$APP_VERSION}"
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
        --add-data "$DIR/backend/vendor_profiles:vendor_profiles" \
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
        --hidden-import "ai_runner" \
        --hidden-import "agy_runner" \
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

    if [ "$SKIP_NOTARIZATION" != "1" ] && [ -n "$NOTARY_PROFILE" ]; then
      echo "------------------------------------------------------------"
      echo "Notarizing $DMG_NAME via Apple Notary (profile: $NOTARY_PROFILE)..."
      echo "------------------------------------------------------------"
      if xcrun notarytool submit "$DMG_PATH" --keychain-profile "$NOTARY_PROFILE" --wait; then
        echo "Stapling notarization ticket to $DMG_NAME..."
        xcrun stapler staple "$DMG_PATH"
        echo "Validating Gatekeeper assessment..."
        spctl -a -vvv -t install "$DMG_PATH" || true
      else
        echo "⚠️ Notarization failed or timed out. Please check logs."
      fi
    fi
  fi
}

if [ "$1" = "--rebuild-backend" ]; then
  REBUILD_BACKEND="1"
fi

OS_NAME="$(uname -s)"

if [ "$OS_NAME" = "Linux" ]; then
  TARGET_TRIPLE="$(rustc -vV | sed -n 's|host: ||p')"
  VENV_DIR="$DIR/backend/.venv"
  if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
  fi
  "$VENV_DIR/bin/pip" install --upgrade pip pyinstaller -r "$DIR/backend/requirements.txt"

  echo "------------------------------------------------------------"
  echo "Building Python FastAPI Sidecar for Linux ($TARGET_TRIPLE)..."
  echo "------------------------------------------------------------"
  (
    cd "$DIR/backend"
    "$VENV_DIR/bin/pyinstaller" --noconfirm --clean --onefile \
      --name "layerzero-backend-$TARGET_TRIPLE" \
      --distpath "$DIR/frontend/src-tauri/binaries" \
      --workpath "$DIR/backend/build_pyinstaller_$TARGET_TRIPLE" \
      --specpath "$DIR/backend/build_pyinstaller_$TARGET_TRIPLE" \
      --add-data "$DIR/backend/schemas:schemas" \
      --add-data "$DIR/backend/vendor_profiles:vendor_profiles" \
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
  rm -rf "$DIR/backend/build_pyinstaller_$TARGET_TRIPLE"
  chmod +x "$DIR/frontend/src-tauri/binaries/layerzero-backend-$TARGET_TRIPLE"

  echo "============================================================"
  echo "Building Tauri v2 Linux Bundles (.deb & .AppImage)..."
  echo "============================================================"
  (
    cd "$DIR/frontend"
    npm install
    npx tauri build --bundles deb,appimage
  )

  echo ""
  echo "✅ Linux Build Complete!"
  echo "   • DEB      : $DIR/frontend/src-tauri/target/release/bundle/deb/"
  echo "   • AppImage : $DIR/frontend/src-tauri/target/release/bundle/appimage/"
  exit 0
fi

# 1. Build Apple Silicon (aarch64-apple-darwin)
build_sidecar "aarch64-apple-darwin" "$DIR/backend/.venv" ""
build_tauri_dmg "aarch64-apple-darwin" "LayerZero_${RELEASE_VERSION}_Apple_Silicon_arm64.dmg" "LayerZero (Apple Silicon)"

# 2. Optionally build Intel (x86_64-apple-darwin) if .venv-x86_64 is present
if [ -d "$DIR/backend/.venv-x86_64" ]; then
  build_sidecar "x86_64-apple-darwin" "$DIR/backend/.venv-x86_64" "arch -x86_64"
  build_tauri_dmg "x86_64-apple-darwin" "LayerZero_${RELEASE_VERSION}_Intel_x64.dmg" "LayerZero (Intel)"
fi

echo ""
echo "✅ macOS Build Complete!"
echo "   • Signing Identity : $SIGN_ID"
echo "   • Output Directory : $DMG_OUT_DIR"
