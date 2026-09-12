import { useEffect, useMemo, useState } from "react";
import { Music2, Search, X, SlidersHorizontal } from "lucide-react";

import { songs } from "@/data/songs";
import { artists as artistData } from "@/data/artists";
import SongRow from "@/components/music/SongRow";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Songs() {
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const [userPreferences, setUserPreferences] = useState({
        genres: [],
        artists: [],
        languages: [],
    });

    const [preferencesLoading, setPreferencesLoading] = useState(true);

    // =====================================================
    // LOAD FIRESTORE USER PREFERENCES
    // =====================================================

    useEffect(() => {
        let isMounted = true;

        const loadUserPreferences = async () => {
            if (!user) {
                if (isMounted) {
                    setUserPreferences({
                        genres: [],
                        artists: [],
                        languages: [],
                    });
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

                    setUserPreferences({
                        genres: Array.isArray(data.genres)
                            ? data.genres
                            : [],

                        artists: Array.isArray(data.artists)
                            ? data.artists
                            : [],

                        languages: Array.isArray(data.languages)
                            ? data.languages
                            : data.language
                                ? [data.language]
                                : [],
                    });
                } else {
                    setUserPreferences({
                        genres: [],
                        artists: [],
                        languages: [],
                    });
                }
            } catch (error) {
                console.error(
                    "Songs preferences error:",
                    error
                );

                if (isMounted) {
                    setUserPreferences({
                        genres: [],
                        artists: [],
                        languages: [],
                    });
                }
            } finally {
                if (isMounted) {
                    setPreferencesLoading(false);
                }
            }
        };

        loadUserPreferences();

        return () => {
            isMounted = false;
        };
    }, [user]);

    // =====================================================
    // SELECTED ARTIST IDS
    // =====================================================

    const selectedArtistIds = userPreferences.artists;

    // =====================================================
    // PERSONALIZED SONGS
    //
    // Artist   = 5 points
    // Genre    = 3 points
    // Language = 2 points
    // =====================================================

    const personalizedSongs = useMemo(() => {
        const hasPreferences =
            userPreferences.artists.length > 0 ||
            userPreferences.genres.length > 0 ||
            userPreferences.languages.length > 0;

        if (!hasPreferences) {
            return songs;
        }

        return songs
            .map((song) => {
                let score = 0;

                const songArtistIds = Array.isArray(song.artistId)
                    ? song.artistId
                    : [];

                const artistMatch = songArtistIds.some((artistId) =>
                    selectedArtistIds.includes(artistId)
                );

                const genreMatch = userPreferences.genres.some(
                    (genre) =>
                        String(song.genre || "").toLowerCase() ===
                        String(genre).toLowerCase()
                );

                const languageMatch = userPreferences.languages.some(
                    (language) =>
                        String(song.language || "").toLowerCase() ===
                        String(language).toLowerCase()
                );

                if (artistMatch) score += 5;
                if (genreMatch) score += 3;
                if (languageMatch) score += 2;

                return {
                    ...song,
                    recommendationScore: score,
                };
            })
            .filter((song) => song.recommendationScore > 0)
            .sort(
                (a, b) =>
                    b.recommendationScore -
                    a.recommendationScore
            );
    }, [
        selectedArtistIds,
        userPreferences.genres,
        userPreferences.languages,
    ]);

    // =====================================================
    // AVAILABLE PERSONALIZED FILTERS
    // =====================================================

    const preferenceFilters = useMemo(() => {
        const filters = [];

        userPreferences.genres.forEach((genre) => {
            filters.push({
                id: `genre-${genre}`,
                label: genre,
                type: "genre",
                value: genre,
            });
        });

        userPreferences.languages.forEach((language) => {
            filters.push({
                id: `language-${language}`,
                label: language,
                type: "language",
                value: language,
            });
        });

        return filters;
    }, [
        userPreferences.genres,
        userPreferences.languages,
    ]);

    // =====================================================
    // FILTER + SEARCH
    // =====================================================

    const filteredSongs = useMemo(() => {
        let result = songs;

        // ---------------------------------------------
        // MAIN FILTER
        // ---------------------------------------------

        if (activeFilter === "for-you") {
            result = personalizedSongs;
        }

        // ---------------------------------------------
        // GENRE / LANGUAGE FILTER
        // ---------------------------------------------

        if (activeFilter.startsWith("genre:")) {
            const genre = activeFilter.replace("genre:", "");

            result = songs.filter(
                (song) =>
                    String(song.genre || "").toLowerCase() ===
                    genre.toLowerCase()
            );
        }

        if (activeFilter.startsWith("language:")) {
            const language = activeFilter.replace(
                "language:",
                ""
            );

            result = songs.filter(
                (song) =>
                    String(song.language || "").toLowerCase() ===
                    language.toLowerCase()
            );
        }

        // ---------------------------------------------
        // SEARCH
        // ---------------------------------------------

        const query = search.trim().toLowerCase();

        if (!query) {
            return result;
        }

        return result.filter((song) => {
            return (
                song.title?.toLowerCase().includes(query) ||
                song.artist?.toLowerCase().includes(query) ||
                song.album?.toLowerCase().includes(query) ||
                song.genre?.toLowerCase().includes(query) ||
                song.language?.toLowerCase().includes(query)
            );
        });
    }, [
        search,
        activeFilter,
        personalizedSongs,
    ]);

    // =====================================================
    // SELECTED ARTIST NAMES
    // =====================================================

    const selectedArtistNames = useMemo(() => {
        return artistData
            .filter((artist) =>
                userPreferences.artists.includes(artist.id)
            )
            .map((artist) => artist.name);
    }, [userPreferences.artists]);

    // =====================================================
    // FILTER LABEL
    // =====================================================

    const activeFilterLabel = useMemo(() => {
        if (activeFilter === "all") return "All Songs";

        if (activeFilter === "for-you") return "For You";

        if (activeFilter.startsWith("genre:")) {
            return activeFilter.replace("genre:", "");
        }

        if (activeFilter.startsWith("language:")) {
            return activeFilter.replace(
                "language:",
                ""
            );
        }

        return "Songs";
    }, [activeFilter]);

    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const clearSearch = () => {
        setSearch("");
    };

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {
        setActiveFilter("all");
        setSearch("");
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

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max items-center gap-2">

                    <div className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-white/[0.07] bg-[#11181d] text-[#68747a]">
                        <SlidersHorizontal size={14} />
                    </div>

                    {/* ALL */}

                    <button
                        type="button"
                        onClick={() => setActiveFilter("all")}
                        className={`
                            h-8
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
                        All Songs
                    </button>

                    {/* FOR YOU */}

                    {user && (
                        <button
                            type="button"
                            onClick={() =>
                                setActiveFilter("for-you")
                            }
                            className={`
                                h-8
                                rounded-[4px]
                                border
                                px-3
                                text-[11px]
                                font-medium
                                transition
                                ${activeFilter === "for-you"
                                    ? "border-[#10aaa9]/50 bg-[#10aaa9]/10 text-[#10aaa9]"
                                    : "border-white/[0.07] bg-[#11181d] text-[#7f8a90] hover:border-white/[0.14] hover:text-white"
                                }
                            `}
                        >
                            For You
                        </button>
                    )}

                    {/* USER GENRES */}

                    {user &&
                        userPreferences.genres.map((genre) => (
                            <button
                                key={`genre-${genre}`}
                                type="button"
                                onClick={() =>
                                    setActiveFilter(
                                        `genre:${genre}`
                                    )
                                }
                                className={`
                                    h-8
                                    rounded-[4px]
                                    border
                                    px-3
                                    text-[11px]
                                    font-medium
                                    transition
                                    ${activeFilter ===
                                        `genre:${genre}`
                                        ? "border-[#10aaa9]/50 bg-[#10aaa9]/10 text-[#10aaa9]"
                                        : "border-white/[0.07] bg-[#11181d] text-[#7f8a90] hover:border-white/[0.14] hover:text-white"
                                    }
                                `}
                            >
                                {genre}
                            </button>
                        ))}

                    {/* USER LANGUAGES */}

                    {user &&
                        userPreferences.languages.map(
                            (language) => (
                                <button
                                    key={`language-${language}`}
                                    type="button"
                                    onClick={() =>
                                        setActiveFilter(
                                            `language:${language}`
                                        )
                                    }
                                    className={`
                                        h-8
                                        rounded-[4px]
                                        border
                                        px-3
                                        text-[11px]
                                        font-medium
                                        transition
                                        ${activeFilter ===
                                            `language:${language}`
                                            ? "border-[#10aaa9]/50 bg-[#10aaa9]/10 text-[#10aaa9]"
                                            : "border-white/[0.07] bg-[#11181d] text-[#7f8a90] hover:border-white/[0.14] hover:text-white"
                                        }
                                    `}
                                >
                                    {language}
                                </button>
                            )
                        )}
                </div>
            </div>

            {/* =================================================
                CURRENT FILTER / COUNT
            ================================================= */}

            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[12px] font-medium text-white">
                        {activeFilterLabel}
                    </p>

                    <p className="mt-1 text-[11px] text-[#68747a]">
                        {filteredSongs.length}{" "}
                        {filteredSongs.length === 1
                            ? "song"
                            : "songs"}

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
                PERSONALIZATION INFO
            ================================================= */}

            {user &&
                !preferencesLoading &&
                activeFilter === "for-you" && (
                    <div className="mb-5 rounded-[5px] border border-[#10aaa9]/10 bg-[#10aaa9]/[0.04] px-4 py-3">
                        <p className="text-[11px] leading-5 text-[#7f8a90]">
                            {selectedArtistNames.length > 0 ? (
                                <>
                                    Recommendations based on{" "}
                                    <span className="font-medium text-[#10aaa9]">
                                        {selectedArtistNames
                                            .slice(0, 3)
                                            .join(", ")}
                                    </span>
                                    .
                                </>
                            ) : userPreferences.genres.length >
                                0 ? (
                                <>
                                    Recommendations based on your{" "}
                                    <span className="font-medium text-[#10aaa9]">
                                        {userPreferences.genres
                                            .slice(0, 3)
                                            .join(", ")}
                                    </span>{" "}
                                    taste.
                                </>
                            ) : userPreferences.languages.length >
                                0 ? (
                                <>
                                    Recommendations based on your{" "}
                                    <span className="font-medium text-[#10aaa9]">
                                        {userPreferences.languages
                                            .slice(0, 3)
                                            .join(", ")}
                                    </span>{" "}
                                    music preferences.
                                </>
                            ) : (
                                "Complete your music preferences to get better recommendations."
                            )}
                        </p>
                    </div>
                )}

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredSongs.length === 0 ? (
                <div
                    className="
                        flex
                        min-h-[320px]
                        flex-col
                        items-center
                        justify-center
                        rounded-[6px]
                        border
                        border-white/[0.06]
                        bg-[#11181d]
                        px-5
                        text-center
                    "
                >
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
                        <Music2
                            size={30}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h2 className="mt-4 text-[15px] font-semibold text-white">
                        No songs found
                    </h2>

                    <p className="mt-2 max-w-[350px] text-[12px] leading-5 text-[#7f8a90]">
                        {activeFilter === "for-you"
                            ? "We couldn't find songs matching your current preferences."
                            : "Try searching with a different song, artist or album name."}
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
                            border
                            border-white/[0.08]
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
                        Clear Filters
                    </button>
                </div>
            ) : (
                /* =================================================
                   SONG LIST
                ================================================= */

                <div
                    className="
                        overflow-x-auto
                        rounded-[6px]
                        border
                        border-white/[0.06]
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
