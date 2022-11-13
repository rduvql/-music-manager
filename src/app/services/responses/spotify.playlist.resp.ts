
export interface SpotifyPlaylistResp {
    href:     string;
    items:    SpotifyPlaylistRespItem[];
    limit:    number;
    next:     null;
    offset:   number;
    previous: null;
    total:    number;
}

export interface SpotifyPlaylistRespItem {
    collaborative: boolean;
    description:   string;
    external_urls: ExternalUrls;
    href:          string;
    id:            string;
    images:        Image[];
    name:          string;
    owner:         Owner;
    primary_color: null;
    public:        boolean;
    snapshot_id:   string;
    tracks:        Tracks;
    type:          string;
    uri:           string;
}

interface ExternalUrls {
    spotify: string;
}

interface Image {
    height: number;
    url:    string;
    width:  number;
}

interface Owner {
    display_name:  string;
    external_urls: ExternalUrls;
    href:          string;
    id:            string;
    type:          string;
    uri:           string;
}

interface Tracks {
    href:  string;
    total: number;
}
