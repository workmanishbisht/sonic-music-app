import { useNavigate } from "react-router-dom";
import { Disc3, Play } from "lucide-react";

import { albums } from "@/data/albums";
import { songs } from "@/data/songs";
import { usePlayer } from "@/context/PlayerContext";

export default function Albums() {
    const navigate = useNavigate();
    const { playSong } = usePlayer();

    const handlePlayAlbum = (album) => {
        const firstSongId = album.songIds?.[0];

        const firstSong = songs.find(
            (song) => String(song.id) === String(firstSongId)
        );

        if (!firstSong) {
            return;
        }

        playSong(firstSong);
    };

    const handleAlbumClick = (albumId) => {
        navigate(`/album/${albumId}`);
    };

    return (
        <div className="py-8 sm:py-10">
            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="mb-8">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                    Your Music
                </p>

                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                    Albums
                </h1>

                <p className="mt-2 text-[13px] text-[#7f8a90]">
                    Explore albums available in Sonic.
                </p>
            </div>

            {/* ==========================================
                EMPTY STATE
            ========================================== */}

            {albums.length === 0 ? (
                <div
                    className="
                        flex min-h-[320px]
                        flex-col items-center justify-center
                        rounded-[6px]
                        border border-white/[0.06]
                        bg-[#11181d]
                        px-5
                        text-center
                    "
                >
                    <div
                        className="
                            flex h-16 w-16
                            items-center justify-center
                            rounded-full
                            bg-[#182126]
                            text-[#68747a]
                        "
                    >
                        <Disc3
                            size={30}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h2 className="mt-4 text-[15px] font-semibold text-white">
                        No albums available
                    </h2>

                    <p className="mt-2 text-[12px] text-[#7f8a90]">
                        Albums will appear here when they are available.
                    </p>
                </div>
            ) : (
                /* ==========================================
                   ALBUM GRID
                ========================================== */

                <div
                    className="
                        grid
                        grid-cols-2
                        gap-x-4
                        gap-y-7
                        sm:grid-cols-3
                        md:grid-cols-4
                        xl:grid-cols-5
                    "
                >
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="group min-w-0"
                        >
                            {/* ALBUM COVER */}

                            <div
                                className="
                                    relative
                                    aspect-square
                                    overflow-hidden
                                    rounded-[6px]
                                    bg-[#11181d]
                                "
                            >
                                {album.image ? (
                                    <img
                                        src={album.image}
                                        alt={album.title}
                                        className="
                                            h-full
                                            w-full
                                            object-cover
                                            transition-transform
                                            duration-300
                                            group-hover:scale-105
                                        "
                                    />
                                ) : (
                                    <div
                                        className="
                                            flex h-full w-full
                                            items-center justify-center
                                            bg-[#182126]
                                            text-[#68747a]
                                        "
                                    >
                                        <Disc3
                                            size={45}
                                            strokeWidth={1.3}
                                        />
                                    </div>
                                )}

                                {/* HOVER OVERLAY */}

                                <div
                                    className="
                                        absolute inset-0
                                        bg-black/35
                                        opacity-0
                                        transition-opacity
                                        duration-300
                                        group-hover:opacity-100
                                    "
                                />

                                {/* PLAY BUTTON */}

                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handlePlayAlbum(album);
                                    }}
                                    aria-label={`Play ${album.title}`}
                                    className="
                                        absolute
                                        bottom-3
                                        right-3
                                        flex h-10 w-10
                                        translate-y-2
                                        items-center justify-center
                                        rounded-full
                                        bg-[#10aaa9]
                                        text-white
                                        opacity-0
                                        shadow-[0_8px_24px_rgba(0,0,0,0.35)]
                                        transition-all
                                        duration-300
                                        hover:bg-[#12c1bf]
                                        hover:scale-105
                                        group-hover:translate-y-0
                                        group-hover:opacity-100
                                    "
                                >
                                    <Play
                                        size={17}
                                        fill="currentColor"
                                        strokeWidth={1.5}
                                    />
                                </button>
                            </div>

                            {/* ALBUM INFORMATION */}

                            <button
                                type="button"
                                onClick={() =>
                                    handleAlbumClick(album.id)
                                }
                                className="
                                    mt-3
                                    block
                                    w-full
                                    text-left
                                "
                            >
                                <h3
                                    className="
                                        truncate
                                        text-[13px]
                                        font-medium
                                        text-white
                                        transition-colors
                                        group-hover:text-[#10aaa9]
                                    "
                                >
                                    {album.title}
                                </h3>

                                <p
                                    className="
                                        mt-1
                                        truncate
                                        text-[11px]
                                        text-[#7f8a90]
                                    "
                                >
                                    {album.artist}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-[10px]
                                        text-[#68747a]
                                    "
                                >
                                    {album.songIds?.length || 0}{" "}
                                    {album.songIds?.length === 1
                                        ? "song"
                                        : "songs"}
                                </p>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}