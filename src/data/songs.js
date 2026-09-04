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
        album: "Tamasha",
        image: tamashaCover,
        audio: agarTumSaathHo,
    },
    {
        id: 2,
        title: "Apna Bana Le",
        artist: "Arijit Singh",
        album: "Bhediya",
        image: bhediyaCover,
        audio: apnaBanaLe,
    },
    {
        id: 3,
        title: "Heeriye",
        artist: "Jasleen Royal, Arijit Singh",
        album: "Heeriye",
        image: heeriyeCover,
        audio: heeriye,
    },
    {
        id: 4,
        title: "Kesariya",
        artist: "Arijit Singh",
        album: "Brahmāstra",
        image: kesariyaCover,
        audio: kesariya,
    },
    {
        id: 5,
        title: "O Maahi",
        artist: "Arijit Singh",
        album: "Dunki",
        image: dunkiCover,
        audio: oMaahi,
    },
    {
        id: 6,
        title: "Sajni",
        artist: "Arijit Singh",
        album: "Laapataa Ladies",
        image: sajniCover,
        audio: sajni,
    },
];

export default songs;