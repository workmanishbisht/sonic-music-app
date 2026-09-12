import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Search, UserRound, Users, X } from "lucide-react";

import { artists } from "@/data/artists";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Artists() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const [selectedArtists, setSelectedArtists] = useState([]);
    const [preferencesLoading, setPreferencesLoading] = useState(true);

    // =====================================================
    // LOAD USER ARTIST PREFERENCES
    // =====================================================

    useEffect(() => {
        let isMounted = true;

        const loadArtistPreferences = async () => {
            if (!user) {
                if (isMounted) {
                    setSelectedArtists([]);
                    setPreferencesLoading(false);
                }

                return;
            }

            setPreferencesLoading(true);

            try {
                const userSnap = await getDoc(
                    doc(db, "users", user.uid)
                );

                if (!isMounted) return;

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    setSelectedArtists(
                        Array.isArray(data.artists)
                            ? data.artists
                            : []
                    );
                } else {
                    setSelectedArtists([]);
                }
            } catch (error) {
                console.error(
                    "Artists preferences error:",
                    error
                );

                if (isMounted) {
                    setSelectedArtists([]);
                }
            } finally {
                if (isMounted) {
                    setPreferencesLoading(false);
                }
            }
        };

        loadArtistPreferences();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // =====================================================
    // SELECTED ARTISTS
    // =====================================================

    const preferredArtists = useMemo(() => {
        return artists.filter((artist) =>
            selectedArtists.includes(artist.id)
        );
    }, [selectedArtists]);

    // =====================================================
    // FILTER + SEARCH
    // =====================================================

    const filteredArtists = useMemo(() => {
        let result = artists;

        if (activeFilter === "preferred") {
            result = preferredArtists;
        }

        const query = search.trim().toLowerCase();

        if (!query) {
            return result;
        }

        return result.filter((artist) => {
            return (
                artist.name?.toLowerCase().includes(query) ||
                artist.followers
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [
        activeFilter,
        preferredArtists,
        search,
    ]);

    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const clearSearch = () => {
        setSearch("");
    };

    // =====================================================
    // RESET
    // =====================================================

    const resetFilters = () => {
        setSearch("");
        setActiveFilter("all");
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="py-8 sm:py-10">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-7">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                    Your Music
                </p>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Artists
                        </h1>

                        <p className="mt-2 text-[13px] text-[#7f8a90]">
                            Discover artists and their music.
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
                            placeholder="Search artists..."
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

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="mb-7 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`
                        h-8
                        shrink-0
                        rounded-[4px]
                        border
                        px-3
                        text-[11px]
                        font-medium
                        transition
                        ${activeFilter === "all"
                            ? "border-[#10aaa9]/50 bg-[#10aaa9]/10 text-[#10aaa9]"
                            : "border-white/[0.07] bg-[#11181d] text-[#7f8a90] hover:border-white/[0.14] hover:text-white"
                        }
                    `}
                >
                    All Artists
                </button>

                {user && (
                    <button
                        type="button"
                        onClick={() =>
                            setActiveFilter("preferred")
                        }
                        className={`
                            h-8
                            shrink-0
                            rounded-[4px]
                            border
                            px-3
                            text-[11px]
                            font-medium
                            transition
                            ${activeFilter === "preferred"
                                ? "border-[#10aaa9]/50 bg-[#10aaa9]/10 text-[#10aaa9]"
                                : "border-white/[0.07] bg-[#11181d] text-[#7f8a90] hover:border-white/[0.14] hover:text-white"
                            }
                        `}
                    >
                        Your Artists
                        {selectedArtists.length > 0 && (
                            <span className="ml-1.5 opacity-70">
                                {selectedArtists.length}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* =================================================
                PREFERENCE INFO
            ================================================= */}

            {user &&
                !preferencesLoading &&
                selectedArtists.length > 0 && (
                    <div className="mb-6 rounded-[5px] border border-[#10aaa9]/10 bg-[#10aaa9]/[0.04] px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Check
                                size={14}
                                className="shrink-0 text-[#10aaa9]"
                            />

                            <p className="text-[11px] leading-5 text-[#7f8a90]">
                                Your selected artists are highlighted
                                below based on your onboarding
                                preferences.
                            </p>
                        </div>
                    </div>
                )}

            {/* =================================================
                COUNT
            ================================================= */}

            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-medium text-white">
                        {activeFilter === "preferred"
                            ? "Your Artists"
                            : "All Artists"}
                    </p>

                    <p className="mt-1 text-[11px] text-[#68747a]">
                        {filteredArtists.length}{" "}
                        {filteredArtists.length === 1
                            ? "artist"
                            : "artists"}

                        {search && (
                            <span>
                                {" "}
                                matching "{search}"
                            </span>
                        )}
                    </p>
                </div>

                {(activeFilter !== "all" || search) && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="
                            text-[11px]
                            font-medium
                            text-[#10aaa9]
                            transition
                            hover:text-[#14c8c5]
                        "
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredArtists.length === 0 ? (
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
                        {activeFilter === "preferred"
                            ? "No preferred artists"
                            : "No artists found"}
                    </h2>

                    <p className="mt-2 max-w-[350px] text-[12px] leading-5 text-[#7f8a90]">
                        {activeFilter === "preferred"
                            ? "Your selected artists will appear here."
                            : "Try searching with a different artist name."}
                    </p>

                    <button
                        type="button"
                        onClick={resetFilters}
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
                        View All Artists
                    </button>
                </div>
            ) : (
                /* =================================================
                   ARTISTS GRID
                ================================================= */

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
                    {filteredArtists.map((artist) => {
                        const isPreferred =
                            selectedArtists.includes(
                                artist.id
                            );

                        return (
                            <button
                                key={artist.id}
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/artist/${artist.id}`
                                    )
                                }
                                className="
                                    group
                                    min-w-0
                                    text-center
                                "
                            >
                                {/* ARTIST IMAGE */}

                                <div
                                    className={`
                                        relative
                                        mx-auto
                                        aspect-square
                                        w-full
                                        overflow-hidden
                                        rounded-full
                                        border
                                        bg-[#11181d]
                                        transition-all
                                        duration-300
                                        ${isPreferred
                                            ? "border-[#10aaa9]/50 shadow-[0_0_0_3px_rgba(16,170,169,0.08)]"
                                            : "border-white/[0.06]"
                                        }
                                        group-hover:border-[#10aaa9]/40
                                        group-hover:bg-[#10aaa9]/[0.06]
                                    `}
                                >
                                    {artist.image ? (
                                        <img
                                            src={artist.image}
                                            alt={artist.name}
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.style.display =
                                                    "none";

                                                event.currentTarget.nextElementSibling?.classList.remove(
                                                    "hidden"
                                                );
                                            }}
                                            className="
                                                h-full
                                                w-full
                                                object-cover
                                                transition-transform
                                                duration-300
                                                group-hover:scale-105
                                            "
                                        />
                                    ) : null}

                                    {/* FALLBACK ICON */}

                                    <div
                                        className={`${artist.image
                                                ? "hidden"
                                                : "flex"
                                            }
                                        h-full
                                        w-full
                                        items-center
                                        justify-center
                                    `}
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

                                    {/* PREFERRED BADGE */}

                                    {user && isPreferred && (
                                        <div
                                            className="
                                                absolute
                                                right-2
                                                top-2
                                                flex
                                                h-7
                                                w-7
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-[#10aaa9]/30
                                                bg-[#071012]/90
                                                text-[#10aaa9]
                                                backdrop-blur-sm
                                            "
                                        >
                                            <Check
                                                size={14}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ARTIST NAME */}

                                <h3
                                    className={`
                                        mt-4
                                        truncate
                                        text-[13px]
                                        font-medium
                                        transition-colors
                                        ${isPreferred
                                            ? "text-[#10aaa9]"
                                            : "text-white"
                                        }
                                        group-hover:text-[#10aaa9]
                                    `}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}
