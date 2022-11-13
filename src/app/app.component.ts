import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SpotifyPlaylistRespItem } from './services/responses/spotify.playlist.resp';
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
    entries: MusicFileEntry[] = []
    spotifyPlaylists: SpotifyPlaylistRespItem[] = []

    selectedDir: string = ""

    constructor(
        // private readonly cd: ChangeDetectorRef,
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
        }).catch(e => {
            console.error(e)
        })
    }
}
