#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{Manager, RunEvent};

#[cfg(unix)]
use std::os::unix::process::CommandExt;

struct SidecarState(Mutex<Option<Child>>);

fn is_port_in_use(port: u16) -> bool {
    TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        Duration::from_millis(250),
    )
    .is_ok()
}

fn find_sidecar_binary() -> Option<PathBuf> {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            // 1. Inside macOS .app bundle (Contents/MacOS/layerzero-backend)
            let bundled = exe_dir.join("layerzero-backend");
            if bundled.exists() {
                return Some(bundled);
            }
            // 2. Next to binary with target triple suffix
            let with_triple = exe_dir.join(format!(
                "layerzero-backend-{}-{}",
                std::env::consts::ARCH,
                if cfg!(target_os = "macos") {
                    "apple-darwin"
                } else {
                    std::env::consts::OS
                }
            ));
            if with_triple.exists() {
                return Some(with_triple);
            }
        }
    }

    // 3. Fallback for `tauri dev`
    let target_os = if cfg!(target_os = "macos") {
        "apple-darwin"
    } else {
        std::env::consts::OS
    };
    let binaries_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("binaries");
    let dev_bin = binaries_dir.join(format!(
        "layerzero-backend-{}-{}",
        std::env::consts::ARCH,
        target_os
    ));
    if dev_bin.exists() {
        return Some(dev_bin);
    }

    let fallback_arm = binaries_dir.join("layerzero-backend-aarch64-apple-darwin");
    if fallback_arm.exists() {
        return Some(fallback_arm);
    }

    None
}

fn build_enriched_path() -> String {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let current = std::env::var("PATH").unwrap_or_default();
    format!(
        "{}/.local/bin:{}/.cargo/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:{}",
        home, home, current
    )
}

fn kill_sidecar(state: &SidecarState) {
    if let Ok(mut guard) = state.0.lock() {
        if let Some(mut child) = guard.take() {
            #[cfg(unix)]
            {
                let pid = child.id() as i32;
                // Terminate entire process group (PyInstaller bootloader + Uvicorn child worker)
                let _ = Command::new("kill")
                    .args(["-TERM", &format!("-{}", pid)])
                    .status();
            }
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

fn main() {
    tauri::Builder::default()
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            if !is_port_in_use(8000) {
                if let Some(bin_path) = find_sidecar_binary() {
                    let mut cmd = Command::new(&bin_path);
                    cmd.env("LAYERZERO_PORT", "8000")
                        .env("PATH", build_enriched_path())
                        .stdout(Stdio::null())
                        .stderr(Stdio::null());

                    #[cfg(unix)]
                    cmd.process_group(0);

                    if let Ok(child) = cmd.spawn() {
                        let state = app.state::<SidecarState>();
                        if let Ok(mut guard) = state.0.lock() {
                            *guard = Some(child);
                        };
                    }
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building LayerZero Tauri application")
        .run(|app_handle, event| {
            if let RunEvent::Exit = event {
                let state = app_handle.state::<SidecarState>();
                kill_sidecar(&state);
            }
        });
}
