import { Injectable } from '@angular/core';

/**
 * order matters, executed first to last
 */
const DEFAULT_REPLACE: [string | RegExp, string?][] = [

    [/^[0-9]*\.?\ ?/],
    [/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi],
    ["_", " "],
    ["&amp"],
    ["original mix"],
    ["official"],
    ["myzuka"],

    ["extended mix", "extended"],
    [/feat\.?\ ?| ft\.?\ ?|vs |,| x | & /g, "; "],
    [" ;", "; "],

    // remove direct duplicate
    [/\(([a-zA-Z0-9 _]*)\) (\(\1\))/i, "$2"], // here $2 is special and means 'replace by capture group $2'

    [/\( ?\)/],

    [/\ {2,}/g, " "],
];

const POST_CLEAN_REPLACE: [string, string][] = [
    ["w&w", "W&W"]
]

function replacerizer(str: string, arr: [string | RegExp, string?]) {
    let pattern = typeof arr[0] === "string" ? new RegExp(arr[0], "gi") : arr[0];
    let replace = (arr[1] || "");
    return str.replace(pattern, replace);
}

function sanitizer(str: string, replacements = DEFAULT_REPLACE) {
    replacements.forEach(replacement => str = replacerizer(str, replacement))
    return str.trim();
}

function artistTitleSwapper(str: string) {
    let [artist, name] = str.split(" - ");

    if (artist && name) {
        return `${name} ~ ${artist}`;
    }
    return str;
}

function capitalizer(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map((s) => {
            let i = s.indexOf('(') + 1;
            return s.substring(0, i) + s.charAt(i).toUpperCase() + s.substring(i + 1)
        })
        .join(' ');
}

@Injectable({
    providedIn: 'root'
})
export class RenamerService {

    constructor() {}

    rename(str: string) {

        let sanitized = sanitizer(str)
        let swapped = artistTitleSwapper(sanitized)
        let capitalized = capitalizer(swapped)
        POST_CLEAN_REPLACE.forEach(artistFix => capitalized = replacerizer(capitalized, artistFix));

        return capitalized;
    }
}
