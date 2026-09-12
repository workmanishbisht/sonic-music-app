import agarTumSaathHo from "@/assets/songs/Agar Tum Saath Ho Tamasha.mp3";
import apnaBanaLe from "@/assets/songs/Apna Bana Le.mp3";
import heeriye from "@/assets/songs/Heeriye Arijit Singh.mp3";
import kesariya from "@/assets/songs/Kesariya.mp3";
import oMaahi from "@/assets/songs/O Maahi.mp3";
import sajni from "@/assets/songs/Sajni.mp3";

import tamashaCover from "@/assets/albums/Tamasha.jpg";
import bhediyaCover from "@/assets/albums/Bhediya.jpg";
import heeriyeCover from "@/assets/albums/Heeriye.jpg";
import kesariyaCover from "@/assets/albums/Kesariya.jpg";
import dunkiCover from "@/assets/albums/dunki.jpg";
import sajniCover from "@/assets/albums/Sajni.jpg";

export const songs = [
    {
        id: 1,
        title: "Agar Tum Saath Ho",
        artist: "Alka Yagnik, Arijit Singh",
        artistId: ["alka-yagnik", "arijit-singh"],
        album: "Tamasha",
        image: tamashaCover,
        audio: agarTumSaathHo,
        genre: "Romantic",
        language: "Hindi",
    },

    {
        id: 2,
        title: "Apna Bana Le",
        artist: "Arijit Singh",
        artistId: ["arijit-singh"],
        album: "Bhediya",
        image: bhediyaCover,
        audio: apnaBanaLe,
        genre: "Romantic",
        language: "Hindi",
    },

    {
        id: 3,
        title: "Heeriye",
        artist: "Jasleen Royal, Arijit Singh",
        artistId: ["jasleen-royal", "arijit-singh"],
        album: "Heeriye",
        image: heeriyeCover,
        audio: heeriye,
        genre: "Romantic",
        language: "Punjabi",
    },

    {
        id: 4,
        title: "Kesariya",
        artist: "Arijit Singh",
        artistId: ["arijit-singh"],
        album: "Brahmāstra",
        image: kesariyaCover,
        audio: kesariya,
        genre: "Romantic",
        language: "Hindi",
    },

    {
        id: 5,
        title: "O Maahi",
        artist: "Arijit Singh",
        artistId: ["arijit-singh"],
        album: "Dunki",
        image: dunkiCover,
        audio: oMaahi,
        genre: "Romantic",
        language: "Hindi",
    },

    {
        id: 6,
        title: "Sajni",
        artist: "Arijit Singh",
        artistId: ["arijit-singh"],
        album: "Laapataa Ladies",
        image: sajniCover,
        audio: sajni,
        genre: "Romantic",
        language: "Hindi",
    },
];

export default songs;