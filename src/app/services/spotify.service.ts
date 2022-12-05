import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.env';
import { SpotifyPlaylistResp } from './responses/spotify.playlist.resp';
import { SpotifyPlaylistTracksResp } from './responses/spotify.playlistTracks.resp';
import { SpotifySearchResponse } from './responses/spotify.search.resp';
import { SpotifyTokenResponse } from './responses/spotify.token.resp';

const SPOTIFY_URL = "https://api.spotify.com"

const SPOTIFY_USER_ID = environment.spotify.userId;
const SPOTIFY_CLIENT_ID = environment.spotify.clientId;
const SPOTIFY_CLIENT_SECRET = environment.spotify.clientSecret;

@Injectable({
    providedIn: 'root'
})
export class SpotifyService {

    private token = ""
    private tokenExpirationMillis = -1

    constructor() { }

    /**
     *
     */
    async fetchSearchTrack(query: string): Promise<SpotifySearchResponse> {

        await this.fetchToken();

        let params = [
            ["q", query],
            ["type", "track"],
            ["limit", 5]
        ]
            .map(param => param.join("="))
            .join("&")

        console.log(`[spotifySearchTrack] params:`, params)

        return fetch(`https://api.spotify.com/v1/search?${params}`, {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/json"
            },
            method: "GET"
        })
            .then(resp => resp.json())
            .then((resp: SpotifySearchResponse) => {
                return resp;
            })
    }

    /**
     * playlists needs to be public (edit in spotify profile)
     */
    async fetchUserPlaylists(): Promise<SpotifyPlaylistResp> {

        await this.fetchToken()

        return fetch(`https://api.spotify.com/v1/users/${SPOTIFY_USER_ID}/playlists`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                "Content-Type": "application/json"
            },
            method: "GET"
        })
            .then(resp => resp.json())
            .then((resp: SpotifyPlaylistResp) => {
                return resp
            })
    }

    /**
     *
     */
    async fetchPlaylistTrack(playlistId: string): Promise<SpotifyPlaylistTracksResp> {

        await this.fetchToken()

        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                "Content-Type": "application/json"
            },
            method: "GET"
        })
            .then(resp => resp.json())
            .then((resp: SpotifyPlaylistTracksResp) => {
                return resp
            })
    }


    /**
     *
     */
    private async fetchToken() {

        // TODO: localStorage
        // window.localStorage.setItem("spotify.token", "");
        // window.localStorage.setItem("spotify.token.expires_in", "");

        if (this.token === "" || new Date().getTime() > this.tokenExpirationMillis) {

            console.log(`[checkAndRefreshToken] {}`, "refreshing spotify token");

            // let formData = new FormData();
            // formData.append("grant_type", "client_credentials");
            // let data = { grant_type: 'client_credentials' };

            await fetch("https://accounts.spotify.com/api/token", {
                headers: {
                    'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                body: "grant_type=client_credentials"
            })
                .then(resp => resp.json())
                .then((resp: SpotifyTokenResponse) => {
                    console.log(resp)
                    this.token = resp.access_token
                    this.tokenExpirationMillis = new Date().getTime() + resp.expires_in * 1000 // default: 3600 in seconds
                })
        }
    }
}
