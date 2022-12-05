import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SpotifyPlaylistRespItem } from './services/responses/spotify.playlist.resp';
import { SpotifyPlaylistTracksRespItem } from './services/responses/spotify.playlistTracks.resp';
import { SpotifyService } from './services/spotify.service';
import { TauriService } from './services/tauri.service';

export interface MusicFileEntry {
    path: string,
    directory: string,
    filename: string,
    title?: string,
    artist?: String,
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

    directories: string[] = []
    spotifyPlaylists: SpotifyPlaylistRespItem[] = []

    entries: MusicFileEntry[] = []
    spotifyEntries: SpotifyPlaylistTracksRespItem[] = []

    selectedDir: string = ""
    selectedSpotifyPlaylist: string = "";

    constructor(
        private readonly tauriSvc: TauriService,
        private readonly spotifyService: SpotifyService
    ) { }

    ngOnInit(): void {

        this.fetchDirsAndSelectFirst();
        this.fetchSpotifyUserPlaylist();
    }

    /**
     *
     */
    async fetchDirsAndSelectFirst() {

        try {
            this.directories = await this.tauriSvc.fetchDirs({ path: environment.basePath })
            this.selectedDir = this.directories[0];

            this.entries = await this.tauriSvc.fetchMp3s({ path: `${environment.basePath}/${this.selectedDir}` })
        } catch (err) {
            console.error(`err`, err)
        }
    }

    /**
     *
     */
    async fetchSpotifyUserPlaylist() {

        this.spotifyService.fetchUserPlaylists().then(resp => {
            this.spotifyPlaylists = resp.items
        })
    }

    /**
     *
     */
    async fetchDirMp3s(dir: string) {

        this.tauriSvc.fetchMp3s({ path: `${environment.basePath}/${dir}` }).then(entries => {
            this.selectedDir = dir;
            this.entries = entries;
            this.spotifyEntries = [];
            this.selectedSpotifyPlaylist = "";
        }).catch(e => {
            console.error(e)
        })
    }

    /**
     *
     */
    async loadSpotifyPlaylist(playlist: SpotifyPlaylistRespItem) {
        this.spotifyEntries = await (await this.spotifyService.fetchPlaylistTrack(playlist.id)).items;
        this.selectedSpotifyPlaylist = playlist.name;
        this.entries = [];
        this.selectedDir = "";
    }

    /**
     *
     */
    async doBuildIndex() {
        await this.tauriSvc.buildIndex({ indexes: this.directories, path: `${environment.basePath}` }).then(() => console.log("ok"))
    }

    async doQueryIndex(value: string) {

        // let [index, query] = value.split(":");
        // let matchingIndex = this.directories.find(e => e.toLocaleLowerCase() === index)

        // let resp = await this.tauriSvc.queryIndex({ query: "inna", limit: 10 })
        // console.log(resp)

        // console.log(resp)
        // if (matchingIndex) {
        // } else {
        //     console.error("no index with this name")
        // }
    }
}
