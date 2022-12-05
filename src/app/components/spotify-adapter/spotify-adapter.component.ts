import { Component, Input, OnInit } from '@angular/core';
import { DeezerService } from 'src/app/services/deezer.service';
import { RenamerService, RN_FUNCS } from 'src/app/services/renamer.service';
import { DeezerSearchSearchRespItem } from 'src/app/services/responses/deezer.search.resp';
import { SpotifyPlaylistTracksRespItem } from 'src/app/services/responses/spotify.playlistTracks.resp';
import { TauriService } from 'src/app/services/tauri.service';
import * as stringSimilarity from "string-similarity";

@Component({
    selector: 'app-spotify-adapter',
    templateUrl: './spotify-adapter.component.html',
    styleUrls: ['./spotify-adapter.component.scss']
})
export class SpotifyAdapterComponent implements OnInit {

    @Input()
    entry!: SpotifyPlaylistTracksRespItem

    deezerResults?: DeezerSearchSearchRespItem[] = []

    alreadyOwned = false;

    constructor(
        private readonly deezerSvc: DeezerService,
        private readonly tauriSvc: TauriService,
        private readonly renamerSvc: RenamerService
    ) { }

    ngOnInit(): void {
        this.queryLocalDiskForSpotifyEntry();
    }

    async queryLocalDiskForSpotifyEntry() {

        let spotifyName = `${this.entry.track?.name} ~ ${this.entry.track?.artists[0].name}`;
        spotifyName = this.renamerSvc.rename(spotifyName.normalize("NFD"),
            RN_FUNCS.sanitize(),
            RN_FUNCS.sanitize([[/\p{Diacritic}/gu, ""], [/[^a-zA-Z]/g, " "], [/\s{2,}/gi, " "]]),
            RN_FUNCS.capitalize,
        )
        // console.log(spotifyName)
        
        let res = await this.tauriSvc.queryIndex({ query: spotifyName, limit: 5 })
        // console.log(res)

        let filename = res[0]?.filename
        if (filename) {

            let soloArtists = this.entry.track?.artists.map(a => `${this.entry.track?.name} ~ ${a.name}`) || []
            let searchResults = [
                ...soloArtists,
                `${this.entry.track?.name} ~ ${this.entry.track?.artists.map(a => a.name).join(", ")}`
            ]
                // .map(s => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-zA-Z]/gu, " "))
                .filter(stfName => {
                    stfName = this.renamerSvc.rename(stfName.normalize("NFD"),
                        RN_FUNCS.sanitize(),
                        RN_FUNCS.sanitize([[/\p{Diacritic}/gu, ""], [/[^a-zA-Z]/g, " "], [/\s{2,}/gi, " "]]),
                        RN_FUNCS.capitalize,
                    );
                    let fName = this.renamerSvc.rename(filename.normalize("NFD"),
                        RN_FUNCS.sanitize(),
                        RN_FUNCS.sanitize([[/\p{Diacritic}/gu, ""], [/[^a-zA-Z]/g, " "], [/\%\w+/g, ""] ,[/\s{2,}/gi, " "]]),
                        RN_FUNCS.capitalize,
                    );
                    return stringSimilarity.compareTwoStrings(stfName, fName) > 0.7;
                })

            this.alreadyOwned = searchResults.length > 0;
        }
    }

    async deezerSearch() {
        let artists = this.entry.track?.artists[0].name || ""
        let title = this.entry.track?.name
        let res = await this.deezerSvc.fetchSearchTrack(`${artists} ${title}`)
        this.deezerResults = res.data
    }


    //
    //
    //
    //
    //

    html_get_spotify_title(): string {
        let ms_as_seconds = Math.floor(this.entry.track?.duration_ms! / 1000)
        let minutes = Math.floor(ms_as_seconds / 60)
        let seconds = ms_as_seconds - minutes * 60
        let secondsToFixed = `0${seconds}`.substr(-2)

        let artists = this.entry.track?.artists.map(a => a.name).join(", ") || ""

        return `${this.entry.track?.name} ~ ${artists} [${minutes}:${secondsToFixed}]` || ""
    }

    html_get_spotify_track_url(): string {
        return this.entry.track?.external_urls.spotify || "";
    }

    html_get_spotify_image_url(): string {
        let image300 = this.entry.track?.album.images.filter(a => a.height === 300)[0]?.url
        return image300 ? image300 : this.entry.track?.album.images[0].url || ""
    }

    html_get_spotify_preview_url(): string {
        return this.entry.track?.preview_url || "";
    }

    //
    //

    html_get_deezer_href_to_mymp3(item: DeezerSearchSearchRespItem): string {
        return `https://free-mp3-download.net?my_id=${item.id}`
    }

    html_get_deezer_name(item: DeezerSearchSearchRespItem): string {
        let minutes = Math.floor(item.duration / 60);
        let seconds = item.duration - minutes * 60;
        let secondsToFixed = `0${seconds}`.substr(-2)
        return `${item.title} ${item.artist.name} [${minutes}:${secondsToFixed}]`;
    }

    html_get_deezer_album_cover_url(item: DeezerSearchSearchRespItem): string {
        return item.album.cover_medium
    }
}
