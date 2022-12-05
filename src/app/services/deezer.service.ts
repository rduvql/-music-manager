import { Injectable } from '@angular/core';
import { fetch } from '@tauri-apps/api/http';
import { DeezerSearchResp } from './responses/deezer.search.resp';

@Injectable({
    providedIn: 'root'
})
export class DeezerService {

    constructor() { }

    /**
     * 
     */
    async fetchSearchTrack(query: string): Promise<DeezerSearchResp> {

        let resp = await fetch<DeezerSearchResp>(`https://api.deezer.com/search?q=${query}`, {
            headers: {
                "Content-Type": "application/json"
            },
            method: "GET"
        })
        return resp.data
    }
}
