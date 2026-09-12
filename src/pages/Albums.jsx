import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Disc3,
    Play,
    Search,
    X,
    Check,
} from "lucide-react";

import { albums } from "@/data/albums";
import { songs } from "@/data/songs";
import { artists as artistData } from "@/data/artists";

import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Albums() {
    const navigate = useNavigate();
    const { playSong } = usePlayer();
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
                    "Albums preferences error:",
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
    // PLAY ALBUM
    // =====================================================

    const handlePlayAlbum = (album) => {
        const firstSongId = album.songIds?.[0];

        const firstSong = songs.find(
            (song) =>
                String(song.id) === String(firstSongId)
        );

        if (!firstSong) {
            return;
        }

        playSong(firstSong);
    };

    // =====================================================
    // OPEN ALBUM
    // =====================================================

    const handleAlbumClick = (albumId) => {
        navigate(`/album/${albumId}`);
    };

    // =====================================================
    // GET PREFERRED ARTIST NAMES
    // =====================================================

    const preferredArtistNames = useMemo(() => {
        return artistData
            .filter((artist) =>
                userPreferences.artists.includes(artist.id)
            )
            .map((artist) => artist.name);
    }, [userPreferences.artists]);

    // =====================================================
    // SCORE ALBUMS
    //
    // Artist   = 5
    // Genre    = 3
    // Language = 2
    // =====================================================

    const personalizedAlbums = useMemo(() => {
        const hasPreferences =
            userPreferences.artists.length > 0 ||
            userPreferences.genres.length > 0 ||
            userPreferences.languages.length > 0;

        if (!hasPreferences) {
            return albums;
        }

        return albums
            .map((album) => {
                let score = 0;

                const albumSongs = songs.filter((song) =>
                    album.songIds?.some(
                        (songId) =>
                            String(song.id) ===
                            String(songId)
                    )
                );

                // -----------------------------------------
                // ARTIST MATCH
                // -----------------------------------------

                const artistMatch = albumSongs.some(
                    (song) => {
                        const songArtistIds =
                            Array.isArray(song.artistId)
                                ? song.artistId
                                : [];

                        return songArtistIds.some(
                            (artistId) =>
                                userPreferences.artists.includes(
                                    artistId
                                )
                        );
                    }
                );

                if (artistMatch) {
                    score += 5;
                }

                // -----------------------------------------
                // GENRE MATCH
                // -----------------------------------------

                const genreMatch = albumSongs.some(
                    (song) =>
                        userPreferences.genres.some(
                            (genre) =>
                                String(
                                    song.genre || ""
                                ).toLowerCase() ===
                                String(
                                    genre
                                ).toLowerCase()
                        )
                );

                if (genreMatch) {
                    score += 3;
                }

                // -----------------------------------------
                // LANGUAGE MATCH
                // -----------------------------------------

                const languageMatch = albumSongs.some(
                    (song) =>
                        userPreferences.languages.some(
                            (language) =>
                                String(
                                    song.language || ""
                                ).toLowerCase() ===
                                String(
                                    language
                                ).toLowerCase()
                        )
                );

                if (languageMatch) {
                    score += 2;
                }

                return {
                    ...album,
                    recommendationScore: score,
                };
            })
            .filter(
                (album) =>
                    album.recommendationScore > 0
            )
            .sort(
                (a, b) =>
                    b.recommendationScore -
                    a.recommendationScore
            );
    }, [
        userPreferences.artists,
        userPreferences.genres,
        userPreferences.languages,
    ]);

    // =====================================================
    // FILTER + SEARCH
    // =====================================================

    const filteredAlbums = useMemo(() => {
        let result = albums;

        if (activeFilter === "for-you") {
            result = personalizedAlbums;
        }

        const query = search.trim().toLowerCase();

        if (!query) {
            return result;
        }

        return result.filter((album) => {
            return (
                album.title
                    ?.toLowerCase()
                    .includes(query) ||
                album.artist
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [
        activeFilter,
        personalizedAlbums,
        search,
    ]);

    // =====================================================
    // FILTER LABEL
    // =====================================================

    const activeFilterLabel = useMemo(() => {
        if (activeFilter === "all") {
            return "All Albums";
        }

        return "For You";
    }, [activeFilter]);

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
                            Albums
                        </h1>

                        <p className="mt-2 text-[13px] text-[#7f8a90]">
                            Explore albums available in Sonic.
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
                            placeholder="Search albums..."
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
                    All Albums
                </button>

                {user && (
                    <button
                        type="button"
                        onClick={() =>
                            setActiveFilter("for-you")
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
                            ${activeFilter === "for-you"
                                ? "border-[#10aaa9]/50 bg-[#10aaa9]/10 text-[#10aaa9]"
                                : "border-white/[0.07] bg-[#11181d] text-[#7f8a90] hover:border-white/[0.14] hover:text-white"
                            }
                        `}
                    >
                        For You
                    </button>
                )}
            </div>

            {/* =================================================
                PERSONALIZATION INFO
            ================================================= */}

            {user &&
                !preferencesLoading &&
                activeFilter === "for-you" && (
                    <div className="mb-6 rounded-[5px] border border-[#10aaa9]/10 bg-[#10aaa9]/[0.04] px-4 py-3">
                        <p className="text-[11px] leading-5 text-[#7f8a90]">
                            {preferredArtistNames.length > 0 ? (
                                <>
                                    Albums recommended from your
                                    preferred artists:{" "}
                                    <span className="font-medium text-[#10aaa9]">
                                        {preferredArtistNames
                                            .slice(0, 3)
                                            .join(", ")}
                                    </span>
                                    .
                                </>
                            ) : userPreferences.genres.length >
                                0 ? (
                                <>
                                    Albums based on your{" "}
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
                                    Albums based on your{" "}
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
                COUNT
            ================================================= */}

            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[12px] font-medium text-white">
                        {activeFilterLabel}
                    </p>

                    <p className="mt-1 text-[11px] text-[#68747a]">
                        {filteredAlbums.length}{" "}
                        {filteredAlbums.length === 1
                            ? "album"
                            : "albums"}

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

            {filteredAlbums.length === 0 ? (
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
                        No albums found
                    </h2>

                    <p className="mt-2 max-w-[350px] text-[12px] leading-5 text-[#7f8a90]">
                        {activeFilter === "for-you"
                            ? "We couldn't find albums matching your preferences."
                            : "Try searching with a different album or artist name."}
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
                        View All Albums
                    </button>
                </div>
            ) : (
                /* =================================================
                   ALBUM GRID
                ================================================= */

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
                    {filteredAlbums.map((album) => {
                        const isRecommended =
                            album.recommendationScore > 0;

                        return (
                            <div
                                key={album.id}
                                className="group min-w-0"
                            >
                                {/* ALBUM COVER */}

                                <div
                                    className={`
                                        relative
                                        aspect-square
                                        overflow-hidden
                                        rounded-[6px]
                                        bg-[#11181d]
                                        ${user &&
                                            isRecommended
                                            ? "ring-1 ring-[#10aaa9]/30"
                                            : ""
                                        }
                                    `}
                                >
                                    {album.image ? (
                                        <img
                                            src={album.image}
                                            alt={album.title}
                                            loading="lazy"
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

                                    {/* RECOMMENDED BADGE */}

                                    {user && isRecommended && (
                                        <div
                                            className="
                                                absolute
                                                left-2
                                                top-2
                                                flex
                                                items-center
                                                gap-1
                                                rounded-full
                                                border
                                                border-[#10aaa9]/30
                                                bg-[#071012]/90
                                                px-2
                                                py-1
                                                text-[9px]
                                                font-medium
                                                text-[#10aaa9]
                                                backdrop-blur-sm
                                            "
                                        >
                                            <Check size={11} />
                                            For You
                                        </div>
                                    )}

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
                                        handleAlbumClick(
                                            album.id
                                        )
                                    }
                                    className="
                                        mt-3
                                        block
                                        w-full
                                        text-left
                                    "
                                >
                                    <h3
                                        className={`
                                            truncate
                                            text-[13px]
                                            font-medium
                                            transition-colors
                                            ${user &&
                                                isRecommended
                                                ? "text-[#10aaa9]"
                                                : "text-white"
                                            }
                                            group-hover:text-[#10aaa9]
                                        `}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}
