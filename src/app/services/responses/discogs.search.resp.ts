
export interface DiscogsSearchResp {
    pagination: Pagination;
    results:    DiscogsSearchItemResp[];
}

interface Pagination {
    page:     number;
    pages:    number;
    per_page: number;
    items:    number;
    urls:     Urls;
}

interface Urls {
}

export interface DiscogsSearchItemResp {
    country:         string;
    year:            string;
    format:          string[];
    label:           string[];
    type:            Type;
    genre:           Genre[];
    style:           string[];
    id:              number;
    barcode:         string[];
    user_data:       UserData;
    master_id:       number;
    master_url:      string;
    uri:             string;
    catno:           string;
    title:           string;
    thumb:           string;
    cover_image:     string;
    resource_url:    string;
    community:       Community;
    format_quantity: number;
    formats:         Format[];
}

interface Community {
    want: number;
    have: number;
}

interface Format {
    name:         string;
    qty:          string;
    descriptions: string[];
    text?:        string;
}

enum Genre {
    Electronic = "Electronic",
    HipHop = "Hip Hop",
    Pop = "Pop",
}

enum Type {
    Release = "release",
}

interface UserData {
    in_wantlist:   boolean;
    in_collection: boolean;
}
