import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    Play,
    Music2,
} from "lucide-react";

import { albums } from "@/data/albums";
import { songs } from "@/data/songs";
import SongRow from "@/components/music/SongRow";
import { usePlayer } from "@/context/PlayerContext";

export default function AlbumDetail() {
    const { albumId } = useParams();
    const navigate = useNavigate();

    const { playSong } = usePlayer();

    // ==========================================
    // FIND ALBUM
    // ==========================================

    const album = useMemo(() => {
        return albums.find(
            (item) => String(item.id) === String(albumId)
        );
    }, [albumId]);

    // ==========================================
    // FIND ALBUM SONGS
    // ==========================================

    const albumSongs = useMemo(() => {
        if (!album) return [];

        return songs.filter((song) =>
            album.songIds?.some(
                (songId) =>
                    String(songId) === String(song.id)
            )
        );
    }, [album]);

    // ==========================================
    // PLAY ALBUM
    // ==========================================

    const handlePlayAll = async () => {
        if (!albumSongs.length) return;

        await playSong(albumSongs[0]);
    };

    // ==========================================
    // ALBUM NOT FOUND
    // ==========================================

    if (!album) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div
                    className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        bg-[#182126]
                        text-[#68747a]
                    "
                >
                    <Music2 size={28} />
                </div>

                <h1 className="mt-5 text-xl font-semibold text-white">
                    Album not found
                </h1>

                <p className="mt-2 text-[12px] text-[#7f8a90]">
                    The album you're looking for doesn't
                    exist.
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        mt-5
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-[4px]
                        bg-[#182126]
                        px-4
                        text-[12px]
                        font-medium
                        text-white
                        transition
                        hover:bg-[#10aaa9]/10
                        hover:text-[#10aaa9]
                    "
                >
                    <ArrowLeft size={15} />
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="py-7 sm:py-9 lg:py-10">

            {/* ======================================
                BACK BUTTON
            ====================================== */}

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                    mb-6
                    flex
                    h-9
                    items-center
                    gap-2
                    rounded-[4px]
                    px-2.5
                    text-[12px]
                    font-medium
                    text-[#8b969d]
                    transition
                    hover:bg-white/[0.04]
                    hover:text-white
                "
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {/* ======================================
                ALBUM HERO
            ====================================== */}

            <section
                className="
                    relative
                    overflow-hidden
                    rounded-[6px]
                    border
                    border-white/[0.06]
                    bg-[#11181d]
                "
            >
                {/* Background blur */}
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        opacity-[0.10]
                        blur-3xl
                    "
                >
                    <img
                        src={album.image}
                        alt=""
                        className="
                            h-full
                            w-full
                            scale-110
                            object-cover
                        "
                    />
                </div>

                <div
                    className="
                        relative
                        flex
                        flex-col
                        gap-6
                        p-5
                        sm:p-7
                        md:flex-row
                        md:items-end
                        md:gap-8
                        lg:p-8
                    "
                >
                    {/* Album Cover */}

                    <div
                        className="
                            h-40
                            w-40
                            shrink-0
                            overflow-hidden
                            rounded-[5px]
                            shadow-[0_20px_50px_rgba(0,0,0,0.45)]
                            sm:h-48
                            sm:w-48
                            lg:h-52
                            lg:w-52
                        "
                    >
                        <img
                            src={album.image}
                            alt={album.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Album Info */}

                    <div className="min-w-0 flex-1 pb-1">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#10aaa9]">
                            Album
                        </p>

                        <h1
                            className="
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-white
                                sm:text-4xl
                                lg:text-5xl
                            "
                        >
                            {album.title}
                        </h1>

                        <p className="mt-3 text-[13px] font-medium text-[#c0c8cc]">
                            {album.artist}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-[#7f8a90]">
                            <span>
                                {albumSongs.length}{" "}
                                {albumSongs.length === 1
                                    ? "song"
                                    : "songs"}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-[#68747a]" />

                            <span>2026</span>
                        </div>

                        {/* Actions */}

                        <div className="mt-6 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePlayAll}
                                disabled={
                                    albumSongs.length === 0
                                }
                                className="
                                    flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-[4px]
                                    bg-[#10aaa9]
                                    px-5
                                    text-[12px]
                                    font-semibold
                                    text-white
                                    shadow-[0_8px_25px_rgba(16,170,169,0.18)]
                                    transition
                                    hover:bg-[#12c1bf]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                <Play
                                    size={15}
                                    fill="currentColor"
                                />
                                Play All
                            </button>

                            <button
                                type="button"
                                aria-label="Favorite album"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white/[0.08]
                                    bg-white/[0.03]
                                    text-[#8b969d]
                                    transition
                                    hover:border-[#10aaa9]/30
                                    hover:bg-[#10aaa9]/10
                                    hover:text-[#10aaa9]
                                "
                            >
                                <Heart
                                    size={17}
                                    strokeWidth={1.7}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================================
                SONGS
            ====================================== */}

            <section className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[17px] font-semibold text-white">
                            Songs
                        </h2>

                        <p className="mt-1 text-[11px] text-[#68747a]">
                            Songs from {album.title}
                        </p>
                    </div>
                </div>

                {albumSongs.length === 0 ? (
                    <div
                        className="
                            flex
                            min-h-[240px]
                            flex-col
                            items-center
                            justify-center
                            rounded-[6px]
                            border
                            border-white/[0.06]
                            bg-[#11181d]
                            text-center
                        "
                    >
                        <Music2
                            size={28}
                            className="text-[#68747a]"
                        />

                        <p className="mt-4 text-[13px] font-medium text-white">
                            No songs in this album
                        </p>

                        <p className="mt-1 text-[11px] text-[#68747a]">
                            Songs will appear here when
                            available.
                        </p>
                    </div>
                ) : (
                    <div
                        className="
                            overflow-x-auto
                            rounded-[6px]
                            border
                            border-white/[0.06]
                            bg-[#11181d]
                        "
                    >
                        {/* Table Header */}

                        <div
                            className="
                                grid
                                min-w-[700px]
                                grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_40px]
                                items-center
                                gap-4
                                border-b
                                border-white/[0.06]
                                px-4
                                py-3
                            "
                        >
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                #
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                Song
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                Album
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                Duration
                            </span>

                            <span />
                        </div>

                        {/* Songs */}

                        <div className="min-w-[700px]">
                            {albumSongs.map(
                                (song, index) => (
                                    <SongRow
                                        key={song.id}
                                        song={song}
                                        number={String(
                                            index + 1
                                        ).padStart(2, "0")}
                                        image={song.image}
                                        title={song.title}
                                        artist={song.artist}
                                        album={song.album}
                                        duration={
                                            song.duration
                                        }
                                        audio={song.audio}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}