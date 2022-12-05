#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[macro_use]
extern crate log;

use indexer::IndexEntry;
use serde::{Deserialize, Serialize};
use tauri::Manager;

mod indexer;
mod internals;

// macro_rules! fnname {
//     () => {{
//         fn f() {}
//         fn type_name_of<T>(_: T) -> &'static str {
//             std::any::type_name::<T>()
//         }
//         let name = type_name_of(f);
//         let funcname = &name[..name.len() - 3];
//         funcname.split("::").last().unwrap()
//     }};
// }

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
    debug!("[t_list_dirs] path: {path}");

    match internals::list_dirs(&path.into()) {
        Ok(res) => Ok(res),
        Err(err) => Err(format!("[t_list_dirs] error: {err}")),
    }
}

#[tauri::command]
fn t_list_dirs_mp3s(path: &str) -> Result<Vec<MusicFileEntry>, String> {
    debug!("[t_list_dirs_mp3s] path: {path}");

    match internals::list_dir_mp3s(&path.into()) {
        Ok(res) => Ok(res),
        Err(err) => Err(format!("[t_list_dirs_mp3s] error: {err}")),
    }
}

#[tauri::command]
fn t_get_base64_cover(path: &str) -> Result<String, String> {
    debug!("[t_get_base64_cover] path: {path}");

    match internals::get_base64_cover(path) {
        Ok(res) => Ok(res),
        Err(err) => Err(format!("[t_get_base64_cover] error: {err}")),
    }
}

#[tauri::command]
fn t_update_base64_cover(entry: MusicFileEntry, base64: &str) -> Result<String, String> {
    debug!(
        "[t_update_base64_cover] entry: {}, base64: {}...",
        serde_json::to_string(&entry).unwrap(),
        &base64.to_string()[..10]
    );

    match internals::update_base64_cover(&entry.path, base64) {
        Ok(res) => Ok(res),
        Err(err) => Err(format!("[t_update_base64_cover] error: {err}")),
    }
}

#[tauri::command]
fn t_update_file(entry: MusicFileEntry, updated: MusicFileEntry) -> Result<String, String> {
    debug!(
        "[t_update_file] entry: {}, updated: {}...",
        serde_json::to_string(&entry).unwrap(),
        serde_json::to_string(&updated).unwrap()
    );

    match internals::update_file(&entry.path, updated) {
        Ok(res) => Ok(res),
        Err(err) => Err(format!("[t_update_file] error: {err}")),
    }
}

#[tauri::command]
fn t_build_index(indexes: Vec<&str>, path: &str) -> Result<String, String> {
    debug!(
        "[t_build_index] directory: {}, path: {path}",
        indexes
            .to_owned()
            .into_iter()
            .collect::<String>()
            .to_string()
    );

    match indexer::build_index_for_path(indexes, path) {
        Ok(()) => Ok(format!("")),
        Err(err) => Err(format!("[t_update_file] error: {err}")),
    }
}

#[tauri::command]
fn t_query_index(query: &str, limit: u8) -> Result<Vec<IndexEntry>, String> {
    debug!("[t_query_index] query: '{query}'");

    match indexer::query_index(query, limit) {
        Ok(res) => Ok(res),
        Err(err) => Err(format!("[t_query_index] error: {err}")),
    }
}

fn main() {
    // env_logger::Builder::new()
    //     .format(|buf, record| {
    //         writeln!(buf, "[{}] - {}",
    //             // Local::now().format("%Y-%m-%dT%H:%M:%S"),
    //             record.level(),
    //             record.args()
    //         )
    //     })
    //     // .filter(None, LevelFilter::Info)
    //     .init();

    env_logger::init();

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
            t_update_file,
            t_build_index,
            t_query_index
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
