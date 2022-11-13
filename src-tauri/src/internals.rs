use id3::{
    frame::{Picture, PictureType},
    Tag, TagLike,
};
use std::{
    error::Error,
    fs::{self},
    path::PathBuf,
};

use crate::MusicFileEntry;

pub static EXTENSIONS: [&'static str; 1] = [".mp3"];

/**
 *
 */
// fn list_dir_internal(path: impl AsRef<Path>) -> Result<Vec<String>, Box<dyn Error>> {
pub fn list_dirs(path: &PathBuf) -> Result<Vec<String>, Box<dyn Error>> {
    let mut out = vec![];
    for e in fs::read_dir(path)? {
        if let Ok(e) = e {
            if let Some(entry) = filter_dir(&e.path()) {
                out.push(entry)
            }
        }
    }
    out.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()));
    Ok(out)
}

/**
 *
 */
fn filter_dir(path: &PathBuf) -> Option<String> {
    if !path.is_dir() {
        return None;
    }
    let dirname = path.file_name()?.to_str()?.to_owned();
    if dirname.starts_with(".") {
        return None;
    }
    Some(path.file_name().unwrap().to_str()?.to_string())
}

/**
 *
 */
pub fn list_dir_mp3s(parent_path: &PathBuf) -> Result<Vec<MusicFileEntry>, Box<dyn Error>> {
    let mut out = vec![];
    for e in fs::read_dir(parent_path)? {
        if let Ok(e) = e {
            if let Some(path) = filter_mp3s(&e.path()) {
                let mut music = MusicFileEntry {
                    path: path.to_str().unwrap().to_string(),
                    directory: parent_path.to_str().unwrap().to_string(),
                    filename: path.file_name().unwrap().to_str().unwrap().to_string(),
                    title: None,
                    artist: None,
                };

                let tag = Tag::read_from_path(path)?;
                if let Some(title) = tag.title() {
                    music.title = Some(title.into());
                }
                if let Some(artist) = tag.artist() {
                    music.artist = Some(artist.into())
                }

                out.push(music);
            }
        }
    }
    out.sort_by(|a, b| a.path.to_lowercase().cmp(&b.path.to_lowercase()));

    Ok(out)
}

/**
 *
 */
fn filter_mp3s(path: &PathBuf) -> Option<&PathBuf> {
    let filename = path.file_name()?.to_str()?.to_owned();

    if !path.is_dir() {
        let extension = path.extension()?.to_str()?.to_lowercase();
        if !EXTENSIONS.iter().any(|e| e[1..] == extension) {
            return None;
        }
    }
    if filename.starts_with('.') {
        return None;
    }

    Some(path)
}

/**
 *
 */
pub fn get_base64_cover(path: &str) -> Result<String, String> {
    let tags = Tag::read_from_path(path);
    let mut base64: String = String::from("");

    if let Some(picture) = tags.unwrap().pictures().next() {
        base64 = base64::encode(picture.to_owned().data);
    }
    Ok(base64)
}

/**
 *
 */
pub fn update_base64_cover(path: &str, base64: &str) -> Result<String, Box<dyn Error>> {
    let mut tags = Tag::read_from_path(path).unwrap();
    tags.remove_all_pictures();
    tags.add_frame(Picture {
        mime_type: "image/png".to_string(),
        picture_type: PictureType::CoverFront,
        description: "".to_string(),
        data: base64::decode(base64).unwrap(),
    });
    Tag::write_to_path(&tags, path, id3::Version::Id3v23).expect("error writing cover");
    Ok(String::from(""))
}

pub fn update_file(path: &str, updated: MusicFileEntry) -> Result<String, Box<dyn Error>> {
    // println!("{}", entry.filename);
    // println!("{}", updated.filename);

    let mut tag = Tag::read_from_path(path).unwrap();
    tag.set_title(updated.title.unwrap());
    tag.set_artist(updated.artist.unwrap());

    tag.remove_year();
    tag.remove_date_recorded();
    tag.remove_date_released();
    // tag.remove_artist();
    tag.remove_album_artist();
    tag.remove_album();
    // tag.remove_title();
    // tag.remove_duration();
    // tag.remove_genre();
    tag.remove_disc();
    tag.remove_total_discs();
    tag.remove_track();
    tag.remove_total_tracks();
    // tag.remove_extended_text();
    // tag.remove_picture_by_type();
    // tag.remove_all_pictures();
    // tag.remove_comment();
    // tag.remove_encapsulated_object();
    tag.remove_all_lyrics();
    tag.remove_all_synchronised_lyrics();
    tag.remove_all_chapters();

    Tag::write_to_path(&tag, path, id3::Version::Id3v23).expect("error writing targs");
    fs::rename(path, updated.path).expect("error renaming file");
    Ok(String::from(""))
}
