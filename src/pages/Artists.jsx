import { useNavigate } from "react-router-dom";
import { Users, UserRound } from "lucide-react";

import { artists } from "@/data/artists";

export default function Artists() {
    const navigate = useNavigate();

    return (
        <div className="py-8 sm:py-10">
            {/* PAGE HEADER */}

            <div className="mb-8">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                    Your Music
                </p>

                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                    Artists
                </h1>

                <p className="mt-2 text-[13px] text-[#7f8a90]">
                    Discover artists and their music.
                </p>
            </div>

            {/* EMPTY STATE */}

            {artists.length === 0 ? (
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
                        <Users
                            size={30}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h2 className="mt-4 text-[15px] font-semibold text-white">
                        No artists available
                    </h2>

                    <p className="mt-2 text-[12px] text-[#7f8a90]">
                        Artists will appear here when they are available.
                    </p>
                </div>
            ) : (
                /* ARTISTS GRID */

                <div
                    className="
                        grid
                        grid-cols-2
                        gap-x-4
                        gap-y-8
                        sm:grid-cols-3
                        md:grid-cols-4
                        xl:grid-cols-5
                    "
                >
                    {artists.map((artist) => (
                        <button
                            key={artist.id}
                            type="button"
                            onClick={() =>
                                navigate(`/artist/${artist.id}`)
                            }
                            className="
                                group
                                min-w-0
                                text-center
                            "
                        >
                            {/* ARTIST IMAGE / ICON */}

                            <div
                                className="
                                    mx-auto
                                    aspect-square
                                    w-full
                                    overflow-hidden
                                    rounded-full
                                    border
                                    border-white/[0.06]
                                    bg-[#11181d]
                                    transition-all
                                    duration-300
                                    group-hover:border-[#10aaa9]/40
                                    group-hover:bg-[#10aaa9]/[0.06]
                                "
                            >
                                <div
                                    className="
                                        flex
                                        h-full
                                        w-full
                                        items-center
                                        justify-center
                                    "
                                >
                                    <UserRound
                                        size={48}
                                        strokeWidth={1.35}
                                        className="
                                            text-[#68747a]
                                            transition-all
                                            duration-300
                                            group-hover:scale-110
                                            group-hover:text-[#10aaa9]
                                        "
                                    />
                                </div>
                            </div>

                            {/* ARTIST NAME */}

                            <h3
                                className="
                                    mt-4
                                    truncate
                                    text-[13px]
                                    font-medium
                                    text-white
                                    transition-colors
                                    group-hover:text-[#10aaa9]
                                "
                            >
                                {artist.name}
                            </h3>

                            {/* FOLLOWERS */}

                            <p
                                className="
                                    mt-1
                                    truncate
                                    text-[11px]
                                    text-[#7f8a90]
                                "
                            >
                                {artist.followers}
                            </p>

                            {/* SONG COUNT */}

                            <p
                                className="
                                    mt-1
                                    text-[10px]
                                    text-[#68747a]
                                "
                            >
                                {artist.songIds?.length || 0}{" "}
                                {artist.songIds?.length === 1
                                    ? "song"
                                    : "songs"}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}