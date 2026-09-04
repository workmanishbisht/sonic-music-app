import { Link, useLocation } from "react-router-dom";

import favoritePlaylist from "@/assets/images/playlist-favorite.png";
import chillPlaylist from "@/assets/images/playlist-chill.png";
import workoutPlaylist from "@/assets/images/playlist-workout.png";
import classicPlaylist from "@/assets/images/playlist-classic.png";
import focusPlaylist from "@/assets/images/playlist-focus.png";

import {
    Home,
    Compass,
    Library,
    Radio,
    Mic2,
    ListMusic,
    Disc3,
    Users,
    Music2,
    Download,
    Plus,
} from "lucide-react";

const mainNavigation = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Discover", icon: Compass, path: "/discover" },
    { name: "Library", icon: Library, path: "/library" },
    { name: "Radio", icon: Radio, path: "/radio" },
    { name: "Podcasts", icon: Mic2, path: "/podcasts" },
];

const libraryNavigation = [
    { name: "Playlists", icon: ListMusic },
    { name: "Albums", icon: Disc3 },
    { name: "Artists", icon: Users },
    { name: "Songs", icon: Music2 },
    { name: "Downloaded", icon: Download },
];

const playlists = [
    {
        name: "Favorite Songs",
        songs: "128 songs",
        image: favoritePlaylist,
    },
    {
        name: "Chill Vibes",
        songs: "80 songs",
        image: chillPlaylist,
    },
    {
        name: "Workout Mix",
        songs: "60 songs",
        image: workoutPlaylist,
    },
    {
        name: "Classic Hits",
        songs: "90 songs",
        image: classicPlaylist,
    },
    {
        name: "Focus Time",
        songs: "70 songs",
        image: focusPlaylist,
    },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside
            className="
                fixed left-0 top-0 z-40
                hidden h-screen w-[253px]
                flex-col
                border-r border-white/[0.07]
                bg-[#080d10]
                text-white
                lg:flex
            "
        >

            {/* ==========================================
                LOGO
            ========================================== */}
            <div
                className="
                    flex h-[92px] shrink-0
                    items-center
                    border-b border-white/[0.05]
                    px-7
                "
            >
                <Link
                    to="/"
                    className="flex items-center"
                >
                    <img
                        src="/sonic.png"
                        alt="Sonic"
                        className="h-auto w-[138px] object-contain"
                    />
                </Link>
            </div>

            {/* ==========================================
                SCROLLABLE CONTENT
            ========================================== */}
            <div
                className="
                    flex-1
                    overflow-y-auto
                    overflow-x-hidden
                    px-4
                    py-5
                "
            >

                {/* ======================================
                    MAIN NAVIGATION
                ====================================== */}
                <nav className="space-y-1.5">
                    {mainNavigation.map((item) => {
                        const Icon = item.icon;

                        const isActive =
                            item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`
                                    flex h-[48px]
                                    items-center gap-4
                                    rounded-[4px]
                                    px-4
                                    text-[14px]
                                    font-medium
                                    transition-all
                                    duration-200
                                    ${isActive
                                        ? "bg-[#10aaa9] text-white shadow-[0_8px_24px_rgba(16,170,169,0.15)]"
                                        : "text-[#a6afb4] hover:bg-white/[0.04] hover:text-white"
                                    }
                                `}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={1.8}
                                />

                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="my-6 border-t border-white/[0.07]" />

                {/* ======================================
                    YOUR LIBRARY
                ====================================== */}
                <section>
                    <div className="mb-3 px-2">
                        <span
                            className="
                                text-[11px]
                                font-medium
                                uppercase
                                tracking-[0.12em]
                                text-[#667177]
                            "
                        >
                            Your Library
                        </span>
                    </div>

                    <div className="space-y-1">
                        {libraryNavigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    className="
                                        flex h-[42px] w-full
                                        items-center gap-4
                                        rounded-[4px]
                                        px-2
                                        text-left
                                        text-[13px]
                                        font-medium
                                        text-[#a6afb4]
                                        transition-all
                                        duration-200
                                        hover:bg-white/[0.04]
                                        hover:text-white
                                    "
                                >
                                    <Icon
                                        size={18}
                                        strokeWidth={1.7}
                                    />

                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ======================================
                    PLAYLISTS
                ====================================== */}
                <section className="mt-7">

                    <div className="mb-3 flex items-center justify-between px-2">

                        <span
                            className="
                                text-[11px]
                                font-medium
                                uppercase
                                tracking-[0.12em]
                                text-[#667177]
                            "
                        >
                            Your Playlists
                        </span>

                        <button
                            type="button"
                            aria-label="Create playlist"
                            className="
                                flex h-6 w-6
                                items-center justify-center
                                rounded-[4px]
                                text-[#7d888e]
                                transition
                                hover:bg-white/[0.06]
                                hover:text-white
                            "
                        >
                            <Plus
                                size={17}
                                strokeWidth={1.8}
                            />
                        </button>

                    </div>

                    <div className="space-y-1">
                        {playlists.map((playlist) => (
                            <button
                                key={playlist.name}
                                type="button"
                                className="
                                    flex w-full
                                    items-center gap-3
                                    rounded-[4px]
                                    px-2 py-2
                                    text-left
                                    transition-all
                                    duration-200
                                    hover:bg-white/[0.04]
                                "
                            >
                                <img
                                    src={playlist.image}
                                    alt={playlist.name}
                                    className="
                                        h-10 w-10
                                        shrink-0
                                        rounded-[4px]
                                        object-cover
                                    "
                                />

                                <div className="min-w-0">

                                    <p
                                        className="
                                            truncate
                                            text-[13px]
                                            font-medium
                                            text-[#d7dcdf]
                                        "
                                    >
                                        {playlist.name}
                                    </p>

                                    <p
                                        className="
                                            mt-0.5
                                            text-[11px]
                                            text-[#68747a]
                                        "
                                    >
                                        {playlist.songs}
                                    </p>

                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="
                            mt-3 px-2
                            text-[11px]
                            font-medium
                            text-[#778288]
                            transition
                            hover:text-white
                        "
                    >
                        Show more
                    </button>

                </section>

                {/* ======================================
                    PREMIUM
                ====================================== */}
                <section className="mt-7 pb-5">

                    <div
                        className="
                            rounded-[4px]
                            bg-gradient-to-br
                            from-[#159e9e]
                            to-[#087d7d]
                            p-4
                        "
                    >

                        <h3 className="text-[13px] font-semibold text-white">
                            Upgrade to Premium
                        </h3>

                        <p
                            className="
                                mt-2
                                text-[11px]
                                leading-5
                                text-white/75
                            "
                        >
                            No ads, unlimited skips and more!
                        </p>

                        <button
                            type="button"
                            className="
                                mt-4 w-full
                                rounded-[4px]
                                bg-white
                                py-2.5
                                text-[11px]
                                font-semibold
                                text-[#11181d]
                                transition
                                hover:bg-gray-100
                            "
                        >
                            Upgrade Now
                        </button>

                    </div>

                </section>

            </div>
        </aside>
    );
}