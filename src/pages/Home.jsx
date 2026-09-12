import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Play,
} from "lucide-react";

import SongCard from "@/components/music/SongCard";
import PlaylistCard from "@/components/music/PlaylistCard";
import AlbumCard from "@/components/music/AlbumCard";
import SongRow from "@/components/music/SongRow";

import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import { artists as artistData } from "@/data/artists";
import { songs } from "@/data/songs";
import { playlists } from "@/data/playlists";
import { albums } from "@/data/albums";

import brahmastraCover from "@/assets/albums/brahmastra-cover.png";
import bhediyaCover from "@/assets/albums/Bhediya.jpg";

// =====================================================
// HERO SLIDES
// =====================================================

const heroSlides = [
    {
        id: 1,
        eyebrow: "GOOD EVENING",
        title: "Feel the melody.",
        titleSecond: "Live the moment.",
        description:
            "Discover new music, create your playlists and enjoy timeless classics.",
        button: "Play Now",
        image: brahmastraCover,
        song: songs[0],
    },
    {
        id: 2,
        eyebrow: "YOUR DAILY MUSIC",
        title: "Find your rhythm.",
        titleSecond: "Feel every beat.",
        description:
            "Explore fresh sounds and timeless favorites made for every moment.",
        button: "Listen Now",
        image: bhediyaCover,
        song: songs[1],
    },
];

// =====================================================
// HOME PAGE
// =====================================================

export default function Home() {
    const { user } = useAuth();
    const { playSong } = usePlayer();

    const [userPreferences, setUserPreferences] = useState({
        genres: [],
        artists: [],
        languages: [],
    });

    const [preferencesLoading, setPreferencesLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    // =====================================================
    // STATIC HOME DATA
    // =====================================================

    const recentlyPlayed = songs.slice(0, 5);
    const popularSongs = songs.slice(0, 6);

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
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

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
                    "Failed to load Home preferences:",
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
    // PERSONALIZED SONGS
    //
    // Artist = 5 points
    // Genre  = 3 points
    // Language = 2 points
    // =====================================================

    const personalizedSongs = useMemo(() => {
        const hasArtistPreference =
            userPreferences.artists.length > 0;

        const hasGenrePreference =
            userPreferences.genres.length > 0;

        const hasLanguagePreference =
            userPreferences.languages.length > 0;

        const hasAnyPreference =
            hasArtistPreference ||
            hasGenrePreference ||
            hasLanguagePreference;

        // No preferences
        if (!hasAnyPreference) {
            return songs.slice(0, 6);
        }

        const scoredSongs = songs.map((song) => {
            let score = 0;

            // ---------------------------------------------
            // ARTIST MATCH
            // ---------------------------------------------

            const songArtistIds = Array.isArray(song.artistId)
                ? song.artistId
                : [];

            const artistMatch = songArtistIds.some((artistId) =>
                userPreferences.artists.includes(artistId)
            );

            if (artistMatch) {
                score += 5;
            }

            // ---------------------------------------------
            // GENRE MATCH
            // ---------------------------------------------

            const genreMatch = userPreferences.genres.some(
                (genre) =>
                    String(song.genre || "").toLowerCase() ===
                    String(genre).toLowerCase()
            );

            if (genreMatch) {
                score += 3;
            }

            // ---------------------------------------------
            // LANGUAGE MATCH
            // ---------------------------------------------

            const languageMatch = userPreferences.languages.some(
                (language) =>
                    String(song.language || "").toLowerCase() ===
                    String(language).toLowerCase()
            );

            if (languageMatch) {
                score += 2;
            }

            return {
                ...song,
                recommendationScore: score,
            };
        });

        const matchedSongs = scoredSongs
            .filter((song) => song.recommendationScore > 0)
            .sort(
                (a, b) =>
                    b.recommendationScore -
                    a.recommendationScore
            );

        // If no preference matches existing songs,
        // show normal songs instead of empty section.
        if (!matchedSongs.length) {
            return songs.slice(0, 6);
        }

        return matchedSongs.slice(0, 6);
    }, [
        userPreferences.artists,
        userPreferences.genres,
        userPreferences.languages,
    ]);

    // =====================================================
    // PERSONALIZATION DESCRIPTION
    // =====================================================

    const personalizedDescription = useMemo(() => {
        if (selectedArtistNames.length) {
            return `Based on ${selectedArtistNames
                .slice(0, 2)
                .join(" & ")}`;
        }

        if (userPreferences.genres.length) {
            return `Based on your ${userPreferences.genres
                .slice(0, 2)
                .join(" & ")} taste`;
        }

        if (userPreferences.languages.length) {
            return `Based on your ${userPreferences.languages
                .slice(0, 2)
                .join(" & ")} music`;
        }

        return "Personalized picks for your taste";
    }, [
        selectedArtistNames,
        userPreferences.genres,
        userPreferences.languages,
    ]);

    // =====================================================
    // ACTIVE HERO SLIDE
    // =====================================================

    const activeSlide = heroSlides[currentSlide];

    // =====================================================
    // AUTO CAROUSEL
    // =====================================================

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === heroSlides.length - 1
                    ? 0
                    : prev + 1
            );
        }, 5500);

        return () => clearInterval(timer);
    }, []);

    // =====================================================
    // PREVIOUS SLIDE
    // =====================================================

    const previousSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0
                ? heroSlides.length - 1
                : prev - 1
        );
    };

    // =====================================================
    // NEXT SLIDE
    // =====================================================

    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === heroSlides.length - 1
                ? 0
                : prev + 1
        );
    };

    // =====================================================
    // HERO PLAY
    // =====================================================

    const handleHeroPlay = () => {
        if (activeSlide?.song) {
            playSong(activeSlide.song);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-8 py-5 sm:space-y-9 sm:py-6">

            {/* =================================================
                HERO CAROUSEL
            ================================================= */}

            <section
                className="
                    relative
                    min-h-[360px]
                    overflow-hidden
                    rounded-[4px]
                    border
                    border-white/[0.06]
                    bg-[#0d1b1d]
                    sm:min-h-[400px]
                    lg:min-h-[430px]
                "
            >
                {/* HERO BACKGROUND */}

                <div
                    key={`hero-image-${activeSlide.id}`}
                    className="
                        absolute
                        inset-0
                        animate-[heroFade_700ms_ease]
                    "
                >
                    <img
                        src={activeSlide.image}
                        alt=""
                        className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                            object-center
                        "
                    />

                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-r
                            from-[#071012]
                            via-[#071012]/90
                            via-[55%]
                            to-[#071012]/20
                        "
                    />

                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-[#071012]/70
                            via-transparent
                            to-transparent
                        "
                    />

                    <div
                        className="
                            absolute
                            inset-0
                            bg-[radial-gradient(circle_at_75%_45%,rgba(16,170,169,0.25),transparent_35%)]
                        "
                    />
                </div>

                {/* HERO CONTENT */}

                <div
                    key={`hero-content-${activeSlide.id}`}
                    className="
                        relative
                        z-10
                        flex
                        min-h-[360px]
                        items-center
                        px-5
                        py-10
                        animate-[heroContent_700ms_ease]
                        sm:min-h-[400px]
                        sm:px-9
                        lg:min-h-[430px]
                        lg:px-12
                    "
                >
                    <div className="max-w-[600px]">

                        <p
                            className="
                                mb-3
                                text-[10px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-[#10aaa9]
                                sm:mb-4
                                sm:text-[11px]
                            "
                        >
                            {activeSlide.eyebrow}
                        </p>

                        <h1
                            className="
                                max-w-[700px]
                                text-[32px]
                                font-semibold
                                leading-[1.08]
                                tracking-[-1px]
                                text-white
                                sm:text-[42px]
                                sm:leading-[1.12]
                                sm:tracking-[-1.5px]
                                lg:text-[52px]
                            "
                        >
                            {activeSlide.title}
                            <br />
                            {activeSlide.titleSecond}
                        </h1>

                        <p
                            className="
                                mt-4
                                max-w-[470px]
                                text-[13px]
                                leading-6
                                text-[#b0b9bc]
                                sm:mt-5
                                sm:text-[14px]
                            "
                        >
                            {activeSlide.description}
                        </p>

                        <div
                            className="
                                mt-6
                                flex
                                items-center
                                gap-2.5
                                sm:mt-7
                                sm:gap-3
                            "
                        >
                            <button
                                type="button"
                                onClick={handleHeroPlay}
                                className="
                                    flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-[4px]
                                    bg-[#10aaa9]
                                    px-4
                                    text-[12px]
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-[#12c1bf]
                                    sm:h-11
                                    sm:px-6
                                    sm:text-[13px]
                                "
                            >
                                <Play
                                    size={15}
                                    fill="currentColor"
                                />

                                {activeSlide.button}
                            </button>

                            <button
                                type="button"
                                className="
                                    flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-[4px]
                                    border
                                    border-white/20
                                    px-4
                                    text-[12px]
                                    font-medium
                                    text-white
                                    transition
                                    hover:bg-white/[0.05]
                                    sm:h-11
                                    sm:px-6
                                    sm:text-[13px]
                                "
                            >
                                Explore

                                <ArrowRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* CAROUSEL ARROWS */}

                <div
                    className="
                        absolute
                        bottom-5
                        right-5
                        z-30
                        flex
                        items-center
                        gap-2
                        sm:bottom-7
                        sm:right-7
                    "
                >
                    <button
                        type="button"
                        onClick={previousSlide}
                        aria-label="Previous slide"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            bg-black/45
                            text-white/80
                            backdrop-blur-sm
                            transition
                            hover:bg-black/65
                            hover:text-white
                            sm:h-10
                            sm:w-10
                        "
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Next slide"
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            bg-black/45
                            text-white/80
                            backdrop-blur-sm
                            transition
                            hover:bg-black/65
                            hover:text-white
                            sm:h-10
                            sm:w-10
                        "
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* DOTS */}

                <div
                    className="
                        absolute
                        bottom-6
                        left-1/2
                        z-30
                        flex
                        -translate-x-1/2
                        items-center
                        gap-1.5
                    "
                >
                    {heroSlides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() =>
                                setCurrentSlide(index)
                            }
                            aria-label={`Go to slide ${index + 1}`}
                            className={`
                                h-1.5
                                rounded-full
                                transition-all
                                duration-300
                                ${currentSlide === index
                                    ? "w-7 bg-[#10aaa9]"
                                    : "w-1.5 bg-white/35 hover:bg-white/60"
                                }
                            `}
                        />
                    ))}
                </div>
            </section>

            {/* =================================================
                PERSONALIZED PICKS
            ================================================= */}

            {user && !preferencesLoading && (
                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
                                Made for you
                            </h2>

                            <p className="mt-1 text-[11px] text-[#68747a]">
                                {personalizedDescription}
                            </p>
                        </div>

                        <span className="text-[11px] font-medium text-[#10aaa9]">
                            For you
                        </span>
                    </div>

                    <div
                        className="
                            flex
                            gap-4
                            overflow-x-auto
                            pb-2
                            scrollbar-hide
                            sm:grid
                            sm:grid-cols-3
                            sm:gap-5
                            md:grid-cols-4
                            lg:grid-cols-5
                        "
                    >
                        {personalizedSongs.map((song) => (
                            <div
                                key={`personalized-${song.id}`}
                                className="w-[150px] shrink-0 sm:w-auto"
                            >
                                <SongCard song={song} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* =================================================
                RECENTLY PLAYED
            ================================================= */}

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
                        Recently Played
                    </h2>

                    <button
                        type="button"
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-1
                            text-[11px]
                            font-medium
                            text-[#10aaa9]
                            transition
                            hover:text-[#14c8c5]
                            sm:text-[12px]
                        "
                    >
                        View all
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div
                    className="
                        flex
                        gap-4
                        overflow-x-auto
                        pb-2
                        scrollbar-hide
                        sm:grid
                        sm:grid-cols-3
                        sm:gap-5
                        md:grid-cols-4
                        lg:grid-cols-5
                    "
                >
                    {recentlyPlayed.map((song) => (
                        <div
                            key={song.id}
                            className="
                                w-[150px]
                                shrink-0
                                sm:w-auto
                            "
                        >
                            <SongCard song={song} />
                        </div>
                    ))}
                </div>
            </section>

            {/* =================================================
                PLAYLISTS
            ================================================= */}

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
                        Made for you
                    </h2>

                    <button
                        type="button"
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-1
                            text-[11px]
                            font-medium
                            text-[#10aaa9]
                            transition
                            hover:text-[#14c8c5]
                            sm:text-[12px]
                        "
                    >
                        View all
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div
                    className="
                        flex
                        gap-4
                        overflow-x-auto
                        pb-2
                        scrollbar-hide
                        sm:grid
                        sm:grid-cols-2
                        sm:gap-4
                        lg:grid-cols-4
                    "
                >
                    {playlists.slice(0, 4).map((playlist) => (
                        <div
                            key={playlist.id}
                            className="
                                w-[190px]
                                shrink-0
                                sm:w-auto
                            "
                        >
                            <PlaylistCard
                                image={playlist.image}
                                title={playlist.title}
                                description={`${playlist.songs} • Curated for you`}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* =================================================
                ALBUMS
            ================================================= */}

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
                        Albums
                    </h2>

                    <button
                        type="button"
                        className="
                            flex
                            shrink-0
                            items-center
                            gap-1
                            text-[11px]
                            font-medium
                            text-[#10aaa9]
                            transition
                            hover:text-[#14c8c5]
                            sm:text-[12px]
                        "
                    >
                        View all
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div
                    className="
                        flex
                        gap-4
                        overflow-x-auto
                        pb-2
                        scrollbar-hide
                        sm:grid
                        sm:grid-cols-3
                        sm:gap-5
                        md:grid-cols-4
                        lg:grid-cols-6
                    "
                >
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="
                                w-[150px]
                                shrink-0
                                sm:w-auto
                            "
                        >
                            <AlbumCard album={album} />
                        </div>
                    ))}
                </div>
            </section>

            {/* =================================================
                POPULAR SONGS
            ================================================= */}

            <section
                className="
                    overflow-hidden
                    rounded-[4px]
                    border
                    border-white/[0.06]
                    bg-[#0d1418]
                "
            >
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-white/[0.06]
                        px-4
                        py-4
                        sm:px-5
                    "
                >
                    <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
                        Popular Songs
                    </h2>

                    <button
                        type="button"
                        className="
                            flex
                            items-center
                            gap-1
                            text-[11px]
                            font-medium
                            text-[#10aaa9]
                            transition
                            hover:text-[#14c8c5]
                            sm:text-[12px]
                        "
                    >
                        View all
                        <ArrowRight size={14} />
                    </button>
                </div>

                {/* Desktop Header */}

                <div
                    className="
                        hidden
                        grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_60px]
                        gap-4
                        border-b
                        border-white/[0.06]
                        px-4
                        py-3
                        text-[10px]
                        uppercase
                        tracking-wider
                        text-[#667177]
                        md:grid
                    "
                >
                    <span>#</span>
                    <span>Title</span>
                    <span>Album</span>
                    <span>Duration</span>
                    <span />
                </div>

                {/* Song Rows */}

                <div className="w-full">
                    {popularSongs.map((song, index) => (
                        <SongRow
                            key={song.id}
                            song={song}
                            number={String(index + 1).padStart(2, "0")}
                            image={song.image}
                            title={song.title}
                            artist={song.artist}
                            album={song.album}
                            duration={song.duration}
                            audio={song.audio}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}