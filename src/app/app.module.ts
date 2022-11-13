import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MusicAdapterComponent } from './music-adapter/music-adapter.component';
import { RenamerService } from './services/renamer.service';
import { SpotifyService } from './services/spotify.service';
import { TauriService } from './services/tauri.service';

@NgModule({
    declarations: [
        AppComponent,
        MusicAdapterComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [
        RenamerService,
        SpotifyService,
        TauriService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
