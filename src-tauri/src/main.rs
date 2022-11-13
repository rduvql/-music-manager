#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use tauri::Manager;

mod internals;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MusicFileEntry {
    pub path: String,
    pub directory: String,
    pub filename: String,
    pub title: Option<String>,
    pub artist: Option<String>,
}

#[tauri::command]
fn t_list_dirs(path: &str) -> Result<Vec<String>, String> {
    let res = internals::list_dirs(&path.into());
    Ok(res.unwrap())
}

#[tauri::command]
fn t_list_dirs_mp3s(path: &str) -> Result<Vec<MusicFileEntry>, String> {
    let res = internals::list_dir_mp3s(&path.into());
    Ok(res.unwrap())
}

#[tauri::command]
fn t_get_base64_cover(path: &str) -> Result<String, String> {
    let res = internals::get_base64_cover(path);
    Ok(res.unwrap())
}

#[tauri::command]
fn t_update_base64_cover(entry: MusicFileEntry, base64: &str) -> Result<String, String> {
    let _ = internals::update_base64_cover(&entry.path, base64);
    Ok(String::from(""))
}

#[tauri::command]
fn t_update_file(entry: MusicFileEntry, updated: MusicFileEntry) -> Result<String, String> {
    let _ = internals::update_file(&entry.path, updated);
    Ok(String::from(""))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            t_list_dirs,
            t_list_dirs_mp3s,
            t_get_base64_cover,
            t_update_base64_cover,
            t_update_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
