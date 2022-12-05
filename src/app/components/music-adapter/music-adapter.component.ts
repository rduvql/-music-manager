import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MusicFileEntry } from '../../app.component';
import { SpotifySearchResponse, SpotifyTrackItem } from '../../services/responses/spotify.search.resp';
import { SpotifyService } from '../../services/spotify.service';
import { TauriService } from '../../services/tauri.service';

@Component({
    selector: 'app-music-adapter',
    templateUrl: './music-adapter.component.html',
    styleUrls: ['./music-adapter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MusicAdapterComponent implements OnInit, AfterViewInit {

    @Input()
    entry!: MusicFileEntry

    base64CovertArt?: string = undefined

    spotifyResult?: SpotifySearchResponse = undefined

    @ViewChild("cover_img")
    imageRef: ElementRef | undefined

    constructor(
        private readonly cd: ChangeDetectorRef,
        private readonly spotifySvc: SpotifyService,
        private readonly tauriSvc: TauriService
    ) { }


    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.lazyLoadImage();
    }

    /**
     *
     */
    async lazyLoadImage() {

        new IntersectionObserver((entries, observer) => {
            // there is only 1 <img>  (from this.imageRef)
            if (entries[0]?.intersectionRatio > 0) {

                this.tauriSvc.fetchBase64Cover({ path: this.entry.path })
                    .then(data => {
                        this.base64CovertArt = `data:image/jpg;base64,${data}`;
                        this.cd.markForCheck();
                    })
                    .catch(e => {
                        console.log(e);
                    })

                observer.disconnect();
            }
        }).observe(this.imageRef?.nativeElement);
    }

    /**
     *
     */
    async updateFilenameFromInput(newFileName: string) {

        let [, title, artist] = /(.*) ~ (.*)\..*/.exec(newFileName) || ["", "", ""];

        let updatedEntry: MusicFileEntry = {
            path: `${this.entry?.directory}/${newFileName}`,
            filename: newFileName,
            directory: this.entry?.directory as string,
            title: title,
            artist: artist,
        }

        this.updateFilenameAngTags(updatedEntry)
    }

    /**
     *
     */
    async updateTagsFromInput(tags: { title?: string, artists?: string }) {

        let title = tags.title || this.entry?.title
        let artists = tags.artists || this.entry?.artist

        let filename = `${title} ~ ${artists}.mp3`

        let updatedEntry: MusicFileEntry = {
            path: `${this.entry?.directory}/${filename}`,
            filename: filename,
            directory: this.entry?.directory as string,
            title: title,
            artist: artists
        }

        this.updateFilenameAngTags(updatedEntry)
    }

    /**
     * 
     */
    async updateFilenameAndTagsFromSpotify(entry: SpotifyTrackItem) {

        let title = entry.name
        let artists = entry.artists.map(a => a.name).join("; ")

        let filename = `${title} ~ ${artists}.mp3`

        let updatedEntry: MusicFileEntry = {
            path: `${this.entry?.directory}/${filename}`,
            filename: filename,
            directory: this.entry?.directory as string,
            title: title,
            artist: artists
        }

        this.updateFilenameAngTags(updatedEntry)
    }

    /**
     *
     */
    async updateFilenameAngTags(updatedEntry: MusicFileEntry) {

        this.tauriSvc.updateFile({ entry: this.entry, updated: updatedEntry })
            .then(() => {
                console.log("done")
                this.entry = updatedEntry
                this.cd.markForCheck()
            })
            .catch((err) => {
                console.log(`err`, err)
            })
    }

    /**
     *
     */
    async fetchImageToBase64(url: string) {

        const getBase64StringFromDataURL = (dataURL: string) =>
            dataURL.replace('data:', '').replace(/^.+,/, '');

        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        // console.log(reader.result);
                        const base64Data = getBase64StringFromDataURL(reader.result as string);
                        // console.log(base64);
                        resolve(base64Data)
                    };
                    reader.readAsDataURL(blob);
                })
            })
            .then((base64Data) => {
                return this.tauriSvc.updateBase64Cover({ entry: this.entry, base64: base64Data })
                    .then(() => {
                        console.log("update covert done")
                        this.base64CovertArt = `data:image/jpg;base64,${base64Data}`;
                        this.cd.markForCheck();
                    })
            })
            .catch(e => {
                console.log(e)
            })
    }

    /**
     *
     */
    async spotifySearch() {

        this.spotifySvc.fetchSearchTrack(`${this.entry.artist?.split(";")[0] || ""} ${this.entry?.title}`)
            .then(r => {
                this.spotifyResult = r;
                this.cd.markForCheck();
            })
    }


    //
    //
    //
    //
    //

    html_get_spotify_music_href(item: SpotifyTrackItem): string {
        return item.album.external_urls.spotify
    }

    html_get_spotify_album_covert_url(item: SpotifyTrackItem): string {
        return item.album.images.find(i => i.height === 300)?.url || item.album.images[0].url || ""
    }

    html_get_song_name(item: SpotifyTrackItem): string {
        return `${item.name} - ${item.artists.map(a => a.name).join(',')}`
    }

    html_get_spotify_preview_url(item: SpotifyTrackItem): string {
        return item.preview_url
    }
}
