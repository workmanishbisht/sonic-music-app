import { useState } from "react";
import { Music2, Search, X } from "lucide-react";

import { songs } from "@/data/songs";
import SongRow from "@/components/music/SongRow";

export default function Songs() {
    const [search, setSearch] = useState("");

    const filteredSongs = songs.filter((song) => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            song.title?.toLowerCase().includes(query) ||
            song.artist?.toLowerCase().includes(query) ||
            song.album?.toLowerCase().includes(query)
        );
    });

    const clearSearch = () => {
        setSearch("");
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

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Songs
                        </h1>

                        <p className="mt-2 text-[13px] text-[#7f8a90]">
                            Browse all songs available in Sonic.
                        </p>
                    </div>

                    {/* SEARCH */}

                    <div className="relative w-full lg:w-[280px]">
                        <Search
                            size={16}
                            strokeWidth={1.8}
                            className="
                                pointer-events-none
                                absolute left-3 top-1/2
                                -translate-y-1/2
                                text-[#68747a]
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search songs..."
                            className="
                                h-10
                                w-full
                                rounded-[4px]
                                border border-white/[0.08]
                                bg-[#11181d]
                                pl-9
                                pr-9
                                text-[12px]
                                text-white
                                outline-none
                                placeholder:text-[#566168]
                                transition
                                focus:border-[#10aaa9]/50
                            "
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    flex
                                    h-6
                                    w-6
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-[3px]
                                    text-[#68747a]
                                    transition
                                    hover:bg-white/[0.05]
                                    hover:text-white
                                "
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ==========================================
                SONG COUNT
            ========================================== */}

            <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] text-[#68747a]">
                    {filteredSongs.length}{" "}
                    {filteredSongs.length === 1 ? "song" : "songs"}
                    {search && (
                        <span>
                            {" "}
                            matching "{search}"
                        </span>
                    )}
                </p>
            </div>

            {/* ==========================================
                EMPTY STATE
            ========================================== */}

            {filteredSongs.length === 0 ? (
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
                        <Music2
                            size={30}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h2 className="mt-4 text-[15px] font-semibold text-white">
                        No songs found
                    </h2>

                    <p className="mt-2 max-w-[350px] text-[12px] leading-5 text-[#7f8a90]">
                        Try searching with a different song, artist or album
                        name.
                    </p>

                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="
                                mt-5
                                inline-flex
                                h-9
                                items-center
                                rounded-[4px]
                                border border-white/[0.08]
                                bg-[#182126]
                                px-4
                                text-[11px]
                                font-medium
                                text-white
                                transition
                                hover:border-[#10aaa9]/40
                                hover:bg-[#10aaa9]/10
                                hover:text-[#10aaa9]
                            "
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                /* ==========================================
                   SONG LIST
                ========================================== */

                <div
                    className="
                        overflow-x-auto
                        rounded-[6px]
                        border border-white/[0.06]
                        bg-[#11181d]
                    "
                >
                    <div className="min-w-[700px]">
                        {/* TABLE HEADER */}

                        <div
                            className="
                                grid
                                grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_40px]
                                items-center
                                gap-4
                                border-b border-white/[0.06]
                                px-4
                                py-3
                            "
                        >
                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-wider
                                    text-[#68747a]
                                "
                            >
                                #
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-wider
                                    text-[#68747a]
                                "
                            >
                                Song
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-wider
                                    text-[#68747a]
                                "
                            >
                                Album
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    font-medium
                                    uppercase
                                    tracking-wider
                                    text-[#68747a]
                                "
                            >
                                Duration
                            </span>

                            <span />
                        </div>

                        {/* SONG ROWS */}

                        {filteredSongs.map((song, index) => (
                            <SongRow
                                key={song.id}
                                song={song}
                                number={String(index + 1).padStart(
                                    2,
                                    "0"
                                )}
                                image={song.image}
                                title={song.title}
                                artist={song.artist}
                                album={song.album}
                                duration={song.duration}
                                audio={song.audio}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}