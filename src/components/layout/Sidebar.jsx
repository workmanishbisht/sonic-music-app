import { Link, useLocation, useNavigate } from "react-router-dom";

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
    X,
} from "lucide-react";

import { usePlaylist } from "@/context/PlaylistContext";

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

const fallbackPlaylists = [
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

export default function Sidebar({
    mobileOpen = false,
    onClose,
}) {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        playlists: userPlaylists,
        loading: playlistsLoading,
    } = usePlaylist();

    const handleNavigation = () => {
        if (onClose) {
            onClose();
        }
    };

    const handlePremium = () => {
        if (onClose) {
            onClose();
        }

        navigate("/premium");
    };

    const handleLibraryItem = (name) => {
        if (onClose) {
            onClose();
        }

        // Playlists are now connected to the Library page.
        if (name === "Playlists") {
            navigate("/library");
            return;
        }

        // These sections are not separate routes yet.
        if (
            name === "Albums" ||
            name === "Artists" ||
            name === "Songs"
        ) {
            navigate("/library");
            return;
        }

        // Downloaded is not implemented yet.
    };

    const handleCreatePlaylist = () => {
        if (onClose) {
            onClose();
        }

        navigate("/library");
    };

    const handlePlaylistClick = (playlistId) => {
        if (onClose) {
            onClose();
        }

        if (!playlistId) {
            navigate("/library");
            return;
        }

        navigate(`/playlist/${playlistId}`);
    };

    const libraryActive =
        location.pathname === "/library" ||
        location.pathname.startsWith("/playlist/");

    return (
        <aside
            className={`
                fixed left-0 top-0 z-50
                flex h-screen w-[253px]
                flex-col
                border-r border-white/[0.07]
                bg-[#080d10]
                text-white
                transition-transform duration-300 ease-out
                lg:translate-x-0
                lg:z-40
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}
        >
            {/* ==========================================
                LOGO
            ========================================== */}

            <div
                className="
                    flex h-[92px] shrink-0
                    items-center justify-between
                    border-b border-white/[0.05]
                    px-7
                "
            >
                <Link
                    to="/"
                    onClick={handleNavigation}
                    className="flex items-center"
                >
                    <img
                        src="/sonic.png"
                        alt="Sonic"
                        className="h-auto w-[138px] object-contain"
                    />
                </Link>

                {/* Mobile Close Button */}

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close sidebar"
                    className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-[4px]
                        text-[#89949a]
                        transition
                        hover:bg-white/[0.06]
                        hover:text-white
                        lg:hidden
                    "
                >
                    <X
                        size={20}
                        strokeWidth={1.8}
                    />
                </button>
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
                                : location.pathname.startsWith(
                                      item.path
                                  );

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={handleNavigation}
                                className={`
                                    flex h-[48px]
                                    items-center gap-4
                                    rounded-[4px]
                                    px-4
                                    text-[14px]
                                    font-medium
                                    transition-all
                                    duration-200
                                    ${
                                        isActive
                                            ? "bg-[#10aaa9] text-white shadow-[0_8px_24px_rgba(16,170,169,0.15)]"
                                            : "text-[#a6afb4] hover:bg-white/[0.04] hover:text-white"
                                    }
                                `}
                            >
                                <Icon
                                    size={20}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {item.name}
                                </span>
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
                        {libraryNavigation.map(
                            (item) => {
                                const Icon = item.icon;

                                const isActive =
                                    item.name ===
                                        "Playlists" &&
                                    libraryActive;

                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() =>
                                            handleLibraryItem(
                                                item.name
                                            )
                                        }
                                        className={`
                                            flex h-[42px] w-full
                                            items-center gap-4
                                            rounded-[4px]
                                            px-2
                                            text-left
                                            text-[13px]
                                            font-medium
                                            transition-all
                                            duration-200
                                            ${
                                                isActive
                                                    ? "bg-white/[0.05] text-[#10aaa9]"
                                                    : "text-[#a6afb4] hover:bg-white/[0.04] hover:text-white"
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={18}
                                            strokeWidth={1.7}
                                        />

                                        <span>
                                            {item.name}
                                        </span>
                                    </button>
                                );
                            }
                        )}
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
                            onClick={
                                handleCreatePlaylist
                            }
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
                        {/* Favorite Songs */}

                        <button
                            type="button"
                            onClick={() => {
                                handleNavigation();
                                navigate("/library");
                            }}
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
                                src={favoritePlaylist}
                                alt="Favorite Songs"
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
                                    Favorite Songs
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-[11px]
                                        text-[#68747a]
                                    "
                                >
                                    Your favorites
                                </p>
                            </div>
                        </button>

                        {/* Firebase User Playlists */}

                        {playlistsLoading ? (
                            <div
                                className="
                                    px-2 py-3
                                    text-[11px]
                                    text-[#68747a]
                                "
                            >
                                Loading playlists...
                            </div>
                        ) : userPlaylists.length > 0 ? (
                            userPlaylists
                                .slice(0, 5)
                                .map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        type="button"
                                        onClick={() =>
                                            handlePlaylistClick(
                                                playlist.id
                                            )
                                        }
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
                                        <div
                                            className="
                                                flex h-10 w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                overflow-hidden
                                                rounded-[4px]
                                                bg-[#182126]
                                            "
                                        >
                                            {playlist.image ? (
                                                <img
                                                    src={
                                                        playlist.image
                                                    }
                                                    alt={
                                                        playlist.name
                                                    }
                                                    className="
                                                        h-full
                                                        w-full
                                                        object-cover
                                                    "
                                                />
                                            ) : (
                                                <Music2
                                                    size={17}
                                                    className="text-[#68747a]"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate
                                                    text-[13px]
                                                    font-medium
                                                    text-[#d7dcdf]
                                                "
                                            >
                                                {
                                                    playlist.name
                                                }
                                            </p>

                                            <p
                                                className="
                                                    mt-0.5
                                                    text-[11px]
                                                    text-[#68747a]
                                                "
                                            >
                                                {Array.isArray(
                                                    playlist.songs
                                                )
                                                    ? `${playlist.songs.length} ${
                                                          playlist.songs.length ===
                                                          1
                                                              ? "song"
                                                              : "songs"
                                                      }`
                                                    : "0 songs"}
                                            </p>
                                        </div>
                                    </button>
                                ))
                        ) : (
                            <div className="px-2 py-3">
                                <p
                                    className="
                                        text-[11px]
                                        leading-5
                                        text-[#68747a]
                                    "
                                >
                                    No playlists yet.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Show more */}

                    {userPlaylists.length > 5 && (
                        <button
                            type="button"
                            onClick={() => {
                                handleNavigation();
                                navigate("/library");
                            }}
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
                    )}

                    {/* Fallback visual playlists are intentionally
                        not shown once Firebase playlists are available. */}

                    {userPlaylists.length === 0 &&
                        !playlistsLoading && (
                            <div className="hidden">
                                {fallbackPlaylists.map(
                                    (playlist) => (
                                        <div
                                            key={
                                                playlist.name
                                            }
                                        >
                                            {
                                                playlist.name
                                            }
                                        </div>
                                    )
                                )}
                            </div>
                        )}
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
                            onClick={handlePremium}
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
