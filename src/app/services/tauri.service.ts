import { Injectable } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { MusicFileEntry } from '../app.component';

type tauriFunc = "fetch_dirs" | "fetch_mp3s" | "fetch_base64_cover" | "update_base64_cover" | "update_file"

// function invokee<T>(cmd: tauriFunc, args?: InvokeArgs): Promise<T> {
//     return invoke.call(cmd, args) as Promise<T>;
// }

export interface IndexEntry {
    filename: string,
    score: number
}

@Injectable({
    providedIn: 'root'
})
export class TauriService {

    constructor() { }

    async fetchDirs({ path }: { path: string }): Promise<string[]> {
        return invoke<string[]>("t_list_dirs", { path: path });
    }

    async fetchMp3s({ path }: { path: string }): Promise<MusicFileEntry[]> {
        return invoke<MusicFileEntry[]>("t_list_dirs_mp3s", { path: path });
    }

    async fetchBase64Cover({ path }: { path: string }): Promise<string> {
        return invoke<string>("t_get_base64_cover", { path: path });
    }

    async updateBase64Cover({ entry, base64 }: { entry: MusicFileEntry, base64: string }): Promise<void> {
        return invoke<void>("t_update_base64_cover", { entry: entry, base64: base64 });
    }

    async updateFile({ entry, updated }: { entry: MusicFileEntry, updated: MusicFileEntry }): Promise<void> {
        return invoke<void>("t_update_file", { entry: entry, updated: updated });
    }

    async buildIndex({ indexes, path }: { indexes: string[], path: string }): Promise<string> {
        return invoke<string>("t_build_index", { indexes: indexes, path: path });
    }

    async queryIndex({ query, limit }: { query: string, limit: number }): Promise<IndexEntry[]> {
        return invoke<IndexEntry[]>("t_query_index", { query: query, limit: limit });
    }
}
