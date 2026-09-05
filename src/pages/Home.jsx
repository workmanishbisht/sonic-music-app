import { useEffect, useState } from "react";
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
import { songs } from "@/data/songs";
import { playlists } from "@/data/playlists";
import { albums } from "@/data/albums";

import brahmastraCover from "@/assets/albums/brahmastra-cover.png";
import bhediyaCover from "@/assets/albums/Bhediya.jpg";

// =====================================================
// HERO SLIDES — ONLY 2
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
    const recentlyPlayed = songs.slice(0, 5);
    const popularSongs = songs.slice(0, 6);
    const homeAlbums = albums.slice(0, 6);

    const { playSong } = usePlayer();

    const [currentSlide, setCurrentSlide] = useState(0);

    const activeSlide = heroSlides[currentSlide];

    // =====================================================
    // AUTO CAROUSEL — 5.5 SECONDS
    // =====================================================

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === heroSlides.length - 1 ? 0 : prev + 1
            );
        }, 5500);

        return () => clearInterval(timer);
    }, []);

    // =====================================================
    // PREVIOUS SLIDE
    // =====================================================

    const previousSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? heroSlides.length - 1 : prev - 1
        );
    };

    // =====================================================
    // NEXT SLIDE
    // =====================================================

    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === heroSlides.length - 1 ? 0 : prev + 1
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
                {/* FULL HERO BACKGROUND IMAGE */}

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

                    {/* Dark left overlay */}

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

                    {/* Bottom overlay */}

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

                    {/* Teal glow */}

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
                        {/* Eyebrow */}

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

                        {/* Title */}

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

                        {/* Description */}

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

                        {/* Buttons */}

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
                            {/* Play */}

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

                            {/* Explore */}

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

                {/* 2 DOTS */}

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
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`
                                h-1.5
                                rounded-full
                                transition-all
                                duration-300
                                ${
                                    currentSlide === index
                                        ? "w-7 bg-[#10aaa9]"
                                        : "w-1.5 bg-white/35 hover:bg-white/60"
                                }
                            `}
                        />
                    ))}
                </div>
            </section>

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
                MADE FOR YOU
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
                                description={
                                    playlist.songs
                                        ? `${playlist.songs} • Curated for you`
                                        : playlist.description ||
                                          "Curated for you"
                                }
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
                    <div>
                        <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
                            Albums
                        </h2>

                        <p className="mt-1 text-[11px] text-[#68747a]">
                            Explore albums and their songs
                        </p>
                    </div>

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
                        xl:grid-cols-6
                    "
                >
                    {homeAlbums.map((album) => (
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
                {/* Popular Header */}

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

                {/* Desktop table header */}

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
