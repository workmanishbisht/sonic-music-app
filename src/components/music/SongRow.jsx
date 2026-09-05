import { useEffect, useState } from "react";
import { Heart, Play } from "lucide-react";
import {
    deleteDoc,
    doc,
    onSnapshot,
    setDoc,
} from "firebase/firestore";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
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

    const [actualDuration, setActualDuration] = useState(
        duration || "0:00"
    );

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

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
    // LOAD ACTUAL SONG DURATION
    // ==========================================

    useEffect(() => {
        let audioElement;
        let cancelled = false;

        const loadDuration = () => {
            if (!currentTrack?.audio) return;

            audioElement = new Audio();
            audioElement.preload = "metadata";

            audioElement.onloadedmetadata = () => {
                if (
                    !cancelled &&
                    Number.isFinite(audioElement.duration)
                ) {
                    setActualDuration(
                        formatDuration(audioElement.duration)
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
        if (authLoading) return;

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
                setIsFavorite(snapshot.exists());
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

        // Login required
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!currentTrack?.id || favoriteLoading) {
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
                // Remove favorite
                await deleteDoc(favoriteRef);
            } else {
                // Add favorite
                await setDoc(favoriteRef, {
                    id: currentTrack.id,
                    title: currentTrack.title || "",
                    artist: currentTrack.artist || "",
                    album: currentTrack.album || "",
                    image: currentTrack.image || "",
                    audio: currentTrack.audio || "",
                    createdAt: new Date().toISOString(),
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
                    ${
                        isCurrentSong
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
                            ${
                                isCurrentSong
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
                        {isCurrentSong && isPlaying ? (
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
                            {isCurrentSong && isPlaying ? (
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
                                ${
                                    isCurrentSong
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
                    FAVORITE
                ====================================== */}

                <div className="flex items-center justify-end">
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
                            ${
                                isFavorite
                                    ? "text-[#10aaa9]"
                                    : "text-[#778288] hover:text-[#10aaa9]"
                            }
                            ${
                                favoriteLoading
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
                </div>
            </div>

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