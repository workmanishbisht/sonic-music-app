import { Link, useLocation, useNavigate } from "react-router-dom";

import favoritePlaylist from "@/assets/images/playlist-favorite.png";

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
    {
        name: "Home",
        icon: Home,
        path: "/",
    },
    {
        name: "Discover",
        icon: Compass,
        path: "/discover",
    },
    {
        name: "Library",
        icon: Library,
        path: "/library",
    },
    {
        name: "Radio",
        icon: Radio,
        path: "/radio",
    },
    {
        name: "Podcasts",
        icon: Mic2,
        path: "/podcasts",
    },
];

const libraryNavigation = [
    {
        name: "Playlists",
        icon: ListMusic,
        path: "/library",
    },
    {
        name: "Albums",
        icon: Disc3,
        path: "/albums",
    },
    {
        name: "Artists",
        icon: Users,
        path: "/artists",
    },
    {
        name: "Songs",
        icon: Music2,
        path: "/songs",
    },
    {
        name: "Downloaded",
        icon: Download,
        path: null,
        disabled: true,
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
        handleNavigation();
        navigate("/premium");
    };

    const handleLibraryItem = (item) => {
        if (item.disabled || !item.path) {
            return;
        }

        handleNavigation();
        navigate(item.path);
    };

    const handleCreatePlaylist = () => {
        handleNavigation();
        navigate("/library");
    };

    const handlePlaylistClick = (playlistId) => {
        handleNavigation();

        if (!playlistId) {
            navigate("/library");
            return;
        }

        navigate(`/playlist/${playlistId}`);
    };

    const isMainActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    const isLibraryItemActive = (item) => {
        if (item.name === "Playlists") {
            return (
                location.pathname === "/library" ||
                location.pathname.startsWith("/playlist/")
            );
        }

        if (item.name === "Albums") {
            return location.pathname.startsWith("/albums");
        }

        if (item.name === "Artists") {
            return location.pathname.startsWith("/artists");
        }

        if (item.name === "Songs") {
            return location.pathname.startsWith("/songs");
        }

        return false;
    };

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

                {/* MOBILE CLOSE */}

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
                        const isActive = isMainActive(item.path);

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

                {/* DIVIDER */}

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
                            const isActive =
                                isLibraryItemActive(item);

                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    disabled={item.disabled}
                                    onClick={() =>
                                        handleLibraryItem(item)
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
                                        ${item.disabled
                                            ? "cursor-not-allowed text-[#465056]"
                                            : isActive
                                                ? "bg-white/[0.05] text-[#10aaa9]"
                                                : "text-[#a6afb4] hover:bg-white/[0.04] hover:text-white"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={18}
                                        strokeWidth={1.7}
                                    />

                                    <span>{item.name}</span>

                                    {item.disabled && (
                                        <span className="ml-auto text-[9px] uppercase tracking-wider text-[#4d585e]">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ======================================
                    YOUR PLAYLISTS
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
                            onClick={handleCreatePlaylist}
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
                        {/* FAVORITE SONGS */}

                        <button
                            type="button"
                            onClick={() => {
                                handleNavigation();
                                navigate("/library");
                            }}
                            className={`
                                flex w-full
                                items-center gap-3
                                rounded-[4px]
                                px-2 py-2
                                text-left
                                transition-all
                                duration-200
                                ${location.pathname === "/library"
                                    ? "bg-white/[0.04]"
                                    : "hover:bg-white/[0.04]"
                                }
                            `}
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

                        {/* FIREBASE USER PLAYLISTS */}

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
                                                    src={playlist.image}
                                                    alt={playlist.name}
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
                                                {playlist.name}
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
                                                    ? `${playlist.songs.length} ${playlist.songs.length ===
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

                    {/* SHOW MORE */}

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