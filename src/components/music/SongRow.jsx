import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    Heart,
    Play,
    MoreHorizontal,
    Plus,
    Check,
    ChevronRight,
    X,
    Music2 as Music2Icon,
} from "lucide-react";

import {
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
} from "firebase/firestore";

import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { usePlaylist } from "@/context/PlaylistContext";
import LoginRequiredModal from "@/components/player/LoginRequiredModal";

function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function SongRow({
    song,
    number,
    image,
    title,
    artist,
    album,
    duration,
    audio,
}) {
    const { currentSong, isPlaying, playSong } = usePlayer();
    const { user, loading: authLoading } = useAuth();

    const {
        playlists,
        addSongToPlaylist,
        createPlaylist,
    } = usePlaylist();

    const [showPlaylistMenu, setShowPlaylistMenu] =
        useState(false);

    const [showCreatePlaylist, setShowCreatePlaylist] =
        useState(false);

    const [newPlaylistName, setNewPlaylistName] =
        useState("");

    const [playlistSaving, setPlaylistSaving] =
        useState(false);

    const [playlistMessage, setPlaylistMessage] =
        useState("");

    const playlistMenuRef = useRef(null);
    const playlistButtonRef = useRef(null);
    const playlistPopupRef = useRef(null);

    const [playlistMenuPosition, setPlaylistMenuPosition] =
        useState({
            top: 0,
            left: 0,
        });

    const [actualDuration, setActualDuration] =
        useState(duration || "0:00");

    const [isFavorite, setIsFavorite] =
        useState(false);

    const [favoriteLoading, setFavoriteLoading] =
        useState(false);

    const [showLoginModal, setShowLoginModal] =
        useState(false);

    const currentTrack = song || {
        id: title,
        title,
        artist,
        album,
        image,
        audio,
        duration,
    };

    const isCurrentSong =
        currentSong?.id === currentTrack?.id;

    // ==========================================
    // PLAYLIST MENU - POSITION + CLOSE OUTSIDE
    // ==========================================

    useEffect(() => {
        const updatePlaylistMenuPosition = () => {
            if (!playlistButtonRef.current) {
                return;
            }

            const buttonRect =
                playlistButtonRef.current.getBoundingClientRect();

            const popupWidth = 220;
            const estimatedPopupHeight = 280;
            const gap = 8;
            const edgePadding = 12;

            let left =
                buttonRect.right -
                popupWidth;

            left = Math.max(
                edgePadding,
                Math.min(
                    left,
                    window.innerWidth -
                        popupWidth -
                        edgePadding
                )
            );

            let top =
                buttonRect.top -
                estimatedPopupHeight -
                gap;

            if (top < edgePadding) {
                top =
                    buttonRect.bottom +
                    gap;
            }

            setPlaylistMenuPosition({
                top,
                left,
            });
        };

        const handleOutsideClick = (event) => {
            const clickedInsideButton =
                playlistMenuRef.current?.contains(
                    event.target
                );

            const clickedInsidePopup =
                playlistPopupRef.current?.contains(
                    event.target
                );

            if (
                !clickedInsideButton &&
                !clickedInsidePopup
            ) {
                setShowPlaylistMenu(false);
            }
        };

        if (showPlaylistMenu) {
            updatePlaylistMenuPosition();

            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );

            window.addEventListener(
                "resize",
                updatePlaylistMenuPosition
            );

            window.addEventListener(
                "scroll",
                updatePlaylistMenuPosition,
                true
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            window.removeEventListener(
                "resize",
                updatePlaylistMenuPosition
            );

            window.removeEventListener(
                "scroll",
                updatePlaylistMenuPosition,
                true
            );
        };
    }, [showPlaylistMenu]);

    // ==========================================
    // OPEN PLAYLIST MENU
    // ==========================================

    const handlePlaylistMenu = (event) => {
        event.stopPropagation();

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        setPlaylistMessage("");

        setShowPlaylistMenu((previous) => {
            const nextValue = !previous;

            if (
                nextValue &&
                playlistButtonRef.current
            ) {
                const buttonRect =
                    playlistButtonRef.current.getBoundingClientRect();

                const popupWidth = 220;
                const estimatedPopupHeight = 280;
                const gap = 8;
                const edgePadding = 12;

                let left =
                    buttonRect.right -
                    popupWidth;

                left = Math.max(
                    edgePadding,
                    Math.min(
                        left,
                        window.innerWidth -
                            popupWidth -
                            edgePadding
                    )
                );

                let top =
                    buttonRect.top -
                    estimatedPopupHeight -
                    gap;

                if (top < edgePadding) {
                    top =
                        buttonRect.bottom +
                        gap;
                }

                setPlaylistMenuPosition({
                    top,
                    left,
                });
            }

            return nextValue;
        });
    };

    // ==========================================
    // ADD SONG TO EXISTING PLAYLIST
    // ==========================================

    const handleAddToPlaylist = async (
        event,
        playlist
    ) => {
        event.stopPropagation();

        if (!playlist?.id) {
            return;
        }

        try {
            await addSongToPlaylist(
                playlist.id,
                currentTrack.id
            );

            setPlaylistMessage(
                `Added to ${playlist.name}`
            );

            setTimeout(
                () => setPlaylistMessage(""),
                1800
            );
        } catch (error) {
            console.error(
                "Add to playlist error:",
                error
            );

            setPlaylistMessage(
                "Could not add song"
            );
        }
    };

    // ==========================================
    // CREATE NEW PLAYLIST WITH CURRENT SONG
    // ==========================================

    const handleCreatePlaylist = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (
            !newPlaylistName.trim() ||
            playlistSaving
        ) {
            return;
        }

        try {
            setPlaylistSaving(true);
            setPlaylistMessage("");

            await createPlaylist({
                name: newPlaylistName,
                description: `Playlist created with ${currentTrack.title}`,
                songId: currentTrack.id,
            });

            setNewPlaylistName("");
            setShowCreatePlaylist(false);
            setShowPlaylistMenu(false);

            setPlaylistMessage(
                `Created ${newPlaylistName.trim()} with ${currentTrack.title}`
            );

            setTimeout(
                () => setPlaylistMessage(""),
                1800
            );
        } catch (error) {
            console.error(
                "Create playlist error:",
                error
            );

            setPlaylistMessage(
                error?.message ||
                "Could not create playlist"
            );
        } finally {
            setPlaylistSaving(false);
        }
    };

    // ==========================================
    // LOAD ACTUAL SONG DURATION
    // ==========================================

    useEffect(() => {
        let audioElement;
        let cancelled = false;

        const loadDuration = () => {
            if (!currentTrack?.audio) {
                return;
            }

            audioElement = new Audio();
            audioElement.preload = "metadata";

            audioElement.onloadedmetadata = () => {
                if (
                    !cancelled &&
                    Number.isFinite(
                        audioElement.duration
                    )
                ) {
                    setActualDuration(
                        formatDuration(
                            audioElement.duration
                        )
                    );
                }

                audioElement.src = "";
            };

            audioElement.onerror = () => {
                if (!cancelled) {
                    setActualDuration(
                        duration || "0:00"
                    );
                }
            };

            audioElement.src = currentTrack.audio;
        };

        loadDuration();

        return () => {
            cancelled = true;

            if (audioElement) {
                audioElement.onloadedmetadata = null;
                audioElement.onerror = null;
                audioElement.src = "";
                audioElement.load();
            }
        };
    }, [currentTrack?.audio, duration]);

    // ==========================================
    // FIRESTORE FAVORITE LISTENER
    // ==========================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user || !currentTrack?.id) {
            setIsFavorite(false);
            return;
        }

        const favoriteRef = doc(
            db,
            "users",
            user.uid,
            "favorites",
            String(currentTrack.id)
        );

        const unsubscribe = onSnapshot(
            favoriteRef,
            (snapshot) => {
                setIsFavorite(
                    snapshot.exists()
                );
            },
            (error) => {
                console.error(
                    "Favorite listener error:",
                    error
                );

                setIsFavorite(false);
            }
        );

        return () => unsubscribe();
    }, [
        user,
        authLoading,
        currentTrack?.id,
    ]);

    // ==========================================
    // PLAY SONG
    // ==========================================

    const handlePlay = (event) => {
        event.stopPropagation();

        if (!currentTrack?.audio) {
            console.warn(
                "Audio file is missing for:",
                currentTrack?.title
            );
            return;
        }

        playSong(currentTrack);
    };

    // ==========================================
    // ROW CLICK
    // ==========================================

    const handleRowClick = () => {
        if (!currentTrack?.audio) {
            console.warn(
                "Audio file is missing for:",
                currentTrack?.title
            );
            return;
        }

        playSong(currentTrack);
    };

    // ==========================================
    // LIKE / UNLIKE
    // ==========================================

    const handleLike = async (event) => {
        event.stopPropagation();

        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (
            !currentTrack?.id ||
            favoriteLoading
        ) {
            return;
        }

        setFavoriteLoading(true);

        try {
            const favoriteRef = doc(
                db,
                "users",
                user.uid,
                "favorites",
                String(currentTrack.id)
            );

            if (isFavorite) {
                await deleteDoc(favoriteRef);
            } else {
                await setDoc(favoriteRef, {
                    id: currentTrack.id,
                    title:
                        currentTrack.title || "",
                    artist:
                        currentTrack.artist || "",
                    album:
                        currentTrack.album || "",
                    image:
                        currentTrack.image || "",
                    audio:
                        currentTrack.audio || "",
                    createdAt:
                        new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error(
                "Favorite update error:",
                error
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <>
            <div
                onClick={handleRowClick}
                className={`
                    group
                    grid
                    grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_40px]
                    items-center
                    gap-4
                    border-b
                    border-white/[0.05]
                    px-4
                    py-3
                    cursor-pointer
                    transition-all
                    duration-200
                    hover:bg-white/[0.03]
                    ${isCurrentSong
                        ? "bg-[#10aaa9]/[0.05]"
                        : ""
                    }
                `}
            >
                {/* ======================================
                    NUMBER / PLAY
                ====================================== */}

                <div className="flex items-center justify-start">
                    <span
                        className={`
                            text-[12px]
                            tabular-nums
                            ${isCurrentSong
                                ? "text-[#10aaa9]"
                                : "text-[#68747a]"
                            }
                            group-hover:hidden
                        `}
                    >
                        {number}
                    </span>

                    <button
                        type="button"
                        onClick={handlePlay}
                        aria-label={`Play ${currentTrack.title}`}
                        className="
                            hidden
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            text-white
                            transition
                            group-hover:flex
                            hover:text-[#10aaa9]
                        "
                    >
                        {isCurrentSong &&
                            isPlaying ? (
                            <span className="flex items-end gap-[2px]">
                                <span className="h-3 w-[2px] animate-pulse bg-[#10aaa9]" />
                                <span className="h-4 w-[2px] animate-pulse bg-[#10aaa9] [animation-delay:150ms]" />
                                <span className="h-2 w-[2px] animate-pulse bg-[#10aaa9] [animation-delay:300ms]" />
                            </span>
                        ) : (
                            <Play
                                size={15}
                                fill="currentColor"
                            />
                        )}
                    </button>
                </div>

                {/* ======================================
                    SONG INFO
                ====================================== */}

                <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[4px]">
                        {currentTrack.image ? (
                            <img
                                src={currentTrack.image}
                                alt={
                                    currentTrack.title ||
                                    "Song"
                                }
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition
                                    duration-300
                                    group-hover:scale-[1.04]
                                "
                            />
                        ) : (
                            <div className="h-full w-full bg-[#182126]" />
                        )}

                        <button
                            type="button"
                            onClick={handlePlay}
                            aria-label={`Play ${currentTrack.title}`}
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-black/55
                                text-white
                                opacity-0
                                transition-all
                                duration-200
                                group-hover:opacity-100
                            "
                        >
                            {isCurrentSong &&
                                isPlaying ? (
                                <span className="flex items-end gap-[2px]">
                                    <span className="h-3 w-[2px] animate-pulse bg-white" />
                                    <span className="h-4 w-[2px] animate-pulse bg-white [animation-delay:150ms]" />
                                    <span className="h-2 w-[2px] animate-pulse bg-white [animation-delay:300ms]" />
                                </span>
                            ) : (
                                <Play
                                    size={15}
                                    fill="currentColor"
                                />
                            )}
                        </button>
                    </div>

                    <div className="min-w-0">
                        <p
                            className={`
                                truncate
                                text-[13px]
                                font-medium
                                ${isCurrentSong
                                    ? "text-[#10aaa9]"
                                    : "text-white"
                                }
                            `}
                        >
                            {currentTrack.title}
                        </p>

                        <p className="truncate text-[11px] text-[#7f8a90]">
                            {currentTrack.artist}
                        </p>
                    </div>
                </div>

                {/* ======================================
                    ALBUM
                ====================================== */}

                <span className="truncate text-[12px] text-[#8b969d]">
                    {currentTrack.album}
                </span>

                {/* ======================================
                    DURATION
                ====================================== */}

                <span className="text-[12px] tabular-nums text-[#8b969d]">
                    {actualDuration}
                </span>

                {/* ======================================
                    ACTIONS / FAVORITE
                ====================================== */}

                <div
                    ref={playlistMenuRef}
                    className="relative flex items-center justify-end gap-3"
                >
                    <button
                        ref={playlistButtonRef}
                        type="button"
                        onClick={handlePlaylistMenu}
                        aria-label={`More options for ${currentTrack.title}`}
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            text-[#778288]
                            opacity-0
                            transition-all
                            duration-200
                            hover:bg-white/[0.05]
                            hover:text-white
                            group-hover:opacity-100
                        "
                    >
                        <MoreHorizontal
                            size={17}
                            strokeWidth={1.8}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={favoriteLoading}
                        aria-label={
                            isFavorite
                                ? `Remove ${currentTrack.title} from favorites`
                                : `Like ${currentTrack.title}`
                        }
                        className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            transition-all
                            duration-200
                            hover:bg-white/[0.05]
                            ${isFavorite
                                ? "text-[#10aaa9]"
                                : "text-[#778288] hover:text-[#10aaa9]"
                            }
                            ${favoriteLoading
                                ? "cursor-wait opacity-60"
                                : ""
                            }
                        `}
                    >
                        <Heart
                            size={16}
                            strokeWidth={1.7}
                            fill={
                                isFavorite
                                    ? "currentColor"
                                    : "none"
                            }
                        />
                    </button>

                    {/* ======================================
                        PLAYLIST MENU
                    ====================================== */}

                    {showPlaylistMenu &&
                        user &&
                        createPortal(
                            <div
                                ref={playlistPopupRef}
                                onClick={(event) =>
                                    event.stopPropagation()
                                }
                                style={{
                                    position: "fixed",
                                    top: `${playlistMenuPosition.top}px`,
                                    left: `${playlistMenuPosition.left}px`,
                                }}
                                className="
                                    z-[100]
                                    w-[220px]
                                    overflow-hidden
                                    rounded-[8px]
                                    border
                                    border-white/[0.09]
                                    bg-[#11181d]
                                    p-1.5
                                    shadow-[0_14px_40px_rgba(0,0,0,0.5)]
                                "
                            >
                                <div className="px-2.5 pb-2 pt-1">
                                    <p
                                        className="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.12em]
                                            text-[#68747a]
                                        "
                                    >
                                        Add to playlist
                                    </p>
                                </div>

                                {playlists.length > 0 ? (
                                    <div className="max-h-[190px] overflow-y-auto">
                                        {playlists.map(
                                            (playlist) => {
                                                const alreadyAdded =
                                                    Array.isArray(
                                                        playlist.songs
                                                    ) &&
                                                    playlist.songs.some(
                                                        (id) =>
                                                            String(
                                                                id
                                                            ) ===
                                                            String(
                                                                currentTrack.id
                                                            )
                                                    );

                                                return (
                                                    <button
                                                        key={
                                                            playlist.id
                                                        }
                                                        type="button"
                                                        onClick={(
                                                            event
                                                        ) =>
                                                            handleAddToPlaylist(
                                                                event,
                                                                playlist
                                                            )
                                                        }
                                                        disabled={
                                                            alreadyAdded
                                                        }
                                                        className="
                                                            flex
                                                            w-full
                                                            items-center
                                                            gap-3
                                                            rounded-[6px]
                                                            px-2.5
                                                            py-2
                                                            text-left
                                                            transition
                                                            hover:bg-white/[0.06]
                                                            disabled:cursor-default
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                flex
                                                                h-9
                                                                w-9
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                overflow-hidden
                                                                rounded-[5px]
                                                                bg-[#182126]
                                                            "
                                                        >
                                                            {playlist.image ? (
                                                                <img
                                                                    src={
                                                                        playlist.image
                                                                    }
                                                                    alt=""
                                                                    className="
                                                                        h-full
                                                                        w-full
                                                                        object-cover
                                                                    "
                                                                />
                                                            ) : (
                                                                <Music2Icon
                                                                    size={
                                                                        16
                                                                    }
                                                                    className="text-[#68747a]"
                                                                />
                                                            )}
                                                        </div>

                                                        <span
                                                            className={`
                                                                min-w-0
                                                                flex-1
                                                                truncate
                                                                text-[12px]
                                                                font-medium
                                                                ${
                                                                    alreadyAdded
                                                                        ? "text-[#7f8a90]"
                                                                        : "text-white"
                                                                }
                                                            `}
                                                        >
                                                            {
                                                                playlist.name
                                                            }
                                                        </span>

                                                        <span
                                                            className="
                                                                flex
                                                                h-6
                                                                w-6
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                            "
                                                        >
                                                            {alreadyAdded ? (
                                                                <Check
                                                                    size={
                                                                        15
                                                                    }
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    className="text-[#10aaa9]"
                                                                />
                                                            ) : (
                                                                <Plus
                                                                    size={
                                                                        15
                                                                    }
                                                                    strokeWidth={
                                                                        1.8
                                                                    }
                                                                    className="text-[#68747a]"
                                                                />
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="px-2.5 py-3">
                                        <p className="text-[11px] text-[#7f8a90]">
                                            No playlists yet.
                                        </p>
                                    </div>
                                )}

                                <div className="my-1.5 border-t border-white/[0.06]" />

                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setShowPlaylistMenu(false);
                                        setShowCreatePlaylist(true);
                                    }}
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-[6px]
                                        px-2.5
                                        py-2
                                        text-left
                                        transition
                                        hover:bg-[#10aaa9]/[0.08]
                                    "
                                >
                                    <span
                                        className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-[5px]
                                            bg-[#10aaa9]/[0.10]
                                            text-[#10aaa9]
                                        "
                                    >
                                        <Plus
                                            size={17}
                                            strokeWidth={1.8}
                                        />
                                    </span>

                                    <span
                                        className="
                                            min-w-0
                                            flex-1
                                            text-[12px]
                                            font-medium
                                            text-[#10aaa9]
                                        "
                                    >
                                        Create new playlist
                                    </span>

                                    <ChevronRight
                                        size={15}
                                        strokeWidth={1.8}
                                        className="shrink-0 text-[#10aaa9]"
                                    />
                                </button>
                            </div>,
                            document.body
                        )}
                </div>
            </div>

            {/* ==========================================
                PLAYLIST MESSAGE
            ========================================== */}

            {playlistMessage && (
                <div
                    className="
                        fixed
                        bottom-[105px]
                        left-1/2
                        z-[70]
                        -translate-x-1/2
                        rounded-lg
                        border
                        border-white/[0.08]
                        bg-[#11181d]
                        px-4
                        py-2.5
                        text-[12px]
                        text-white
                        shadow-xl
                    "
                >
                    {playlistMessage}
                </div>
            )}

            {/* ==========================================
                CREATE PLAYLIST MODAL
            ========================================== */}

            {showCreatePlaylist && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[80]
                        flex
                        items-center
                        justify-center
                        bg-black/65
                        px-4
                        backdrop-blur-[2px]
                    "
                    onClick={() =>
                        !playlistSaving &&
                        setShowCreatePlaylist(false)
                    }
                >
                    <form
                        onSubmit={handleCreatePlaylist}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        className="
                            w-full
                            max-w-[380px]
                            rounded-2xl
                            border
                            border-white/[0.08]
                            bg-[#10171b]
                            p-5
                            shadow-2xl
                        "
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-[16px] font-semibold text-white">
                                    Create playlist
                                </h3>

                                <p className="mt-1 text-[11px] text-[#7f8a90]">
                                    Add “
                                    {
                                        currentTrack.title
                                    }
                                    ” to it
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreatePlaylist(
                                        false
                                    )
                                }
                                disabled={
                                    playlistSaving
                                }
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#778288]
                                    transition
                                    hover:bg-white/[0.05]
                                    hover:text-white
                                    disabled:opacity-50
                                "
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <input
                            autoFocus
                            value={newPlaylistName}
                            onChange={(event) =>
                                setNewPlaylistName(
                                    event.target.value
                                )
                            }
                            placeholder="Playlist name"
                            maxLength={60}
                            className="
                                h-11
                                w-full
                                rounded-lg
                                border
                                border-white/[0.08]
                                bg-[#080d10]
                                px-3
                                text-[13px]
                                text-white
                                outline-none
                                placeholder:text-[#59656b]
                                focus:border-[#10aaa9]/60
                            "
                        />

                        <button
                            type="submit"
                            disabled={
                                !newPlaylistName.trim() ||
                                playlistSaving
                            }
                            className="
                                mt-4
                                h-11
                                w-full
                                rounded-lg
                                bg-[#10aaa9]
                                text-[13px]
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#12c1bf]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {playlistSaving
                                ? "Creating..."
                                : "Create playlist"}
                        </button>
                    </form>
                </div>
            )}

            {/* ==========================================
                LOGIN REQUIRED MODAL
            ========================================== */}

            {showLoginModal && (
                <LoginRequiredModal
                    onClose={() =>
                        setShowLoginModal(false)
                    }
                />
            )}
        </>
    );
}
