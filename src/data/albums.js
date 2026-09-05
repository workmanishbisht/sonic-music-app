import tamashaCover from "@/assets/albums/Tamasha.jpg";
import bhediyaCover from "@/assets/albums/Bhediya.jpg";
import heeriyeCover from "@/assets/albums/Heeriye.jpg";
import kesariyaCover from "@/assets/albums/Kesariya.jpg";
import dunkiCover from "@/assets/albums/dunki.jpg";
import sajniCover from "@/assets/albums/Sajni.jpg";

export const albums = [
    {
        id: "tamasha",
        title: "Tamasha",
        artist: "A.R. Rahman",
        image: tamashaCover,
        songIds: [1],
    },

    {
        id: "bhediya",
        title: "Bhediya",
        artist: "Sachin-Jigar",
        image: bhediyaCover,
        songIds: [2],
    },

    {
        id: "heeriye",
        title: "Heeriye",
        artist: "Jasleen Royal",
        image: heeriyeCover,
        songIds: [3],
    },

    {
        id: "brahmastra",
        title: "Brahmāstra",
        artist: "Pritam",
        image: kesariyaCover,
        songIds: [4],
    },

    {
        id: "dunki",
        title: "Dunki",
        artist: "Pritam",
        image: dunkiCover,
        songIds: [5],
    },

    {
        id: "laapataa-ladies",
        title: "Laapataa Ladies",
        artist: "Ram Sampath",
        image: sajniCover,
        songIds: [6],
    },
];

export default albums;