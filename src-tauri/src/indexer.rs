use std::error::Error;
use std::path::Path;
use std::path::PathBuf;

use serde::Deserialize;
use serde::Serialize;
use std::env::current_dir;
use std::fs::{self};
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::schema::*;
use tantivy::Index;
use tantivy::IndexWriter;
use tantivy::ReloadPolicy;

const FILENAME_FIELD: &str = "filename";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexEntry {
    pub filename: String,
    pub score: f32,
}

fn get_index_path() -> PathBuf {
    Path::new(current_dir().unwrap().to_str().unwrap())
        .join("..")
        .join("index_dir")
}

fn get_schema() -> Schema {
    let mut schema_builder = Schema::builder();
    schema_builder.add_text_field(FILENAME_FIELD, TEXT | STORED);
    schema_builder.build()
}

fn get_index() -> Result<(Index, IndexWriter), Box<dyn Error>> {
    let index_path = get_index_path();
    let schema = get_schema();
    let index: Index;

    if !index_path.exists() {
        fs::create_dir(&index_path)?;
    }
    if !index_path.join("meta.json").exists() {
        index = Index::create_in_dir(&index_path, schema.clone())?;
    } else {
        index = Index::open_in_dir(&index_path)?;
    }

    let index_writer = index.writer(50_000_000)?;

    Ok((index, index_writer))
}

pub fn build_index_for_path(indexes: Vec<&str>, path: &str) -> Result<(), Box<dyn Error>> {
    debug!(
        "[build_index_for_path] indexes:{}, path: {path}",
        indexes
            .to_owned()
            .into_iter()
            .collect::<String>()
            .to_string()
    );

    // let index_path = get_index_path(index_name);
    let filename_field = get_schema().get_field(FILENAME_FIELD).unwrap();
    let (_, mut index_writer) = get_index()?;

    index_writer.delete_all_documents()?;
    index_writer.commit()?;

    for index in indexes {
        let p = Path::new(path).join(index);
        info!("indexing {}", p.to_str().unwrap().to_string());

        let mut cpt = 0;
        for e in fs::read_dir(p)? {
            if let Ok(e) = e {
                index_writer.add_document(tantivy::doc!(
                    filename_field => e.file_name().to_str().unwrap()
                ))?;
            }
            cpt = cpt + 1;
        }
        info!("added {cpt} entries to index");
    }

    // thread::sleep(time::Duration::from_millis(500));
    match index_writer.commit() {
        Ok(_) => info!("commit ok"),
        Err(e) => error!("commit err {e}"),
    }

    Ok(())
}

pub fn query_index(query: &str, limit: u8) -> Result<Vec<IndexEntry>, Box<dyn Error>> {
    debug!("[query_index] query: '{query}', limit: {limit}");

    let schema = get_schema();
    let filename_field = schema.get_field(FILENAME_FIELD).unwrap();
    let (index, _) = get_index()?;

    let query_parser = QueryParser::for_index(&index, vec![filename_field]);
    let query = query_parser.parse_query(query)?;

    let searcher = index
        .reader_builder()
        .reload_policy(ReloadPolicy::OnCommit)
        .try_into()?
        .searcher();

    let top_docs = searcher.search(&query, &TopDocs::with_limit(limit.into()))?;
    info!("docs found in index: {}", top_docs.len());

    let mut out = vec![];

    for (_score, doc_address) in top_docs {
        let retrieved_doc = searcher.doc(doc_address)?;
        out.push(IndexEntry {
            filename: retrieved_doc.field_values()[0]
                .value
                .as_text()
                .unwrap()
                .to_string(),
            score: _score,
        });
        println!("{}, {}", schema.to_json(&retrieved_doc), _score);
    }
    Ok(out)
}
