import { useEffect, useState } from "react";

import {
    Heart,
    Pause,
    Play,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Shuffle,
    Repeat,
} from "lucide-react";

import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import LoginRequiredModal from "@/components/player/LoginRequiredModal";

function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}

export default function MusicPlayer() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,

        isShuffle,
        isRepeat,

        togglePlay,
        nextSong,
        previousSong,
        seek,
        changeVolume,

        toggleShuffle,
        toggleRepeat,
    } = usePlayer();

    const { user, loading: authLoading } = useAuth();

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // ==========================================
    // FIRESTORE FAVORITE LISTENER
    // ==========================================

    useEffect(() => {
        if (authLoading) return;

        if (!user || !currentSong?.id) {
            setIsFavorite(false);
            return;
        }

        const favoriteRef = doc(
            db,
            "users",
            user.uid,
            "favorites",
            String(currentSong.id)
        );

        const unsubscribe = onSnapshot(
            favoriteRef,
            (snapshot) => {
                setIsFavorite(snapshot.exists());
            },
            (error) => {
                console.error("Player favorite listener error:", error);
                setIsFavorite(false);
            }
        );

        return () => unsubscribe();
    }, [user, authLoading, currentSong?.id]);

    // ==========================================
    // LIKE / UNLIKE CURRENT SONG
    // ==========================================

    const handleLike = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (!currentSong?.id || favoriteLoading) {
            return;
        }

        setFavoriteLoading(true);

        try {
            const favoriteRef = doc(
                db,
                "users",
                user.uid,
                "favorites",
                String(currentSong.id)
            );

            if (isFavorite) {
                await deleteDoc(favoriteRef);
            } else {
                await setDoc(favoriteRef, {
                    id: currentSong.id,
                    title: currentSong.title || "",
                    artist: currentSong.artist || "",
                    album: currentSong.album || "",
                    image: currentSong.image || "",
                    audio: currentSong.audio || "",
                    createdAt: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error("Player favorite update error:", error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Player tabhi show hoga jab song select hoga
    if (!currentSong) {
        return null;
    }

    const progress =
        duration > 0
            ? Math.min((currentTime / duration) * 100, 100)
            : 0;

    return (
        <>
            <div
            className="
                fixed bottom-0 left-0 right-0 z-[100]
                border-t border-white/[0.07]
                bg-[#0b1114]/[0.98]
                shadow-[0_-8px_30px_rgba(0,0,0,0.28)]
                backdrop-blur-xl
                lg:left-[253px]
            "
        >
            {/* ============================
                MAIN PLAYER
            ============================ */}

            <div
                className="
                    relative
                    flex h-[86px]
                    items-center
                    px-3
                    sm:px-6
                "
            >
                {/* ============================
                    CURRENT SONG
                ============================ */}

                <div
                    className="
                        flex min-w-0 shrink-0
                        items-center gap-3
                        lg:w-[290px]
                    "
                >
                    {/* Album Image */}

                    <div
                        className="
                            relative shrink-0
                            overflow-hidden
                            rounded-[5px]
                        "
                    >
                        <img
                            src={currentSong.image}
                            alt={currentSong.title}
                            className="
                                h-[48px] w-[48px]
                                object-cover
                                sm:h-[52px] sm:w-[52px]
                            "
                        />

                        {/* Playing Animation */}

                        {isPlaying && (
                            <div
                                className="
                                    absolute inset-x-0 bottom-0
                                    flex h-5
                                    items-end justify-center
                                    gap-[2px]
                                    bg-gradient-to-t
                                    from-black/50
                                    to-transparent
                                    pb-1
                                "
                            >
                                <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-white" />

                                <span className="h-3 w-[2px] animate-pulse rounded-full bg-white [animation-delay:150ms]" />

                                <span className="h-2 w-[2px] animate-pulse rounded-full bg-white [animation-delay:300ms]" />

                                <span className="h-3.5 w-[2px] animate-pulse rounded-full bg-white [animation-delay:450ms]" />
                            </div>
                        )}
                    </div>

                    {/* Song Details */}

                    <div className="min-w-0 flex-1">
                        <p
                            className="
                                truncate
                                text-[12px]
                                font-semibold
                                text-white
                                sm:text-[13px]
                            "
                        >
                            {currentSong.title}
                        </p>

                        <p
                            className="
                                mt-1
                                truncate
                                text-[10px]
                                text-[#7d898f]
                                sm:text-[11px]
                            "
                        >
                            {currentSong.artist}
                        </p>
                    </div>

                    {/* Like */}

                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={favoriteLoading}
                        aria-label={
                            isFavorite
                                ? `Remove ${currentSong.title} from favorites`
                                : `Like ${currentSong.title}`
                        }
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        className={`
                            hidden h-8 w-8
                            shrink-0
                            items-center justify-center
                            rounded-full
                            transition-all
                            sm:flex
                            ${
                                isFavorite
                                    ? "text-[#10aaa9]"
                                    : "text-[#7d898f] hover:text-[#10aaa9]"
                            }
                            ${
                                favoriteLoading
                                    ? "cursor-wait opacity-60"
                                    : "hover:bg-white/[0.05]"
                            }
                        `}
                    >
                        <Heart
                            size={17}
                            strokeWidth={1.8}
                            fill={isFavorite ? "currentColor" : "none"}
                        />
                    </button>
                </div>

                {/* ============================
                    CENTER PLAYER
                ============================ */}

                <div
                    className="
                        flex min-w-0
                        flex-1
                        flex-col
                        items-center
                        px-2
                        sm:px-6
                    "
                >
                    {/* Controls */}

                    <div
                        className="
                            flex h-[38px]
                            items-center
                            gap-1
                            sm:gap-3
                        "
                    >
                        {/* =====================
                            SHUFFLE
                        ===================== */}

                        <button
                            type="button"
                            onClick={toggleShuffle}
                            aria-label="Shuffle"
                            title={
                                isShuffle
                                    ? "Shuffle On"
                                    : "Shuffle Off"
                            }
                            className={`
                                flex h-8 w-8
                                items-center justify-center
                                rounded-full
                                transition-all
                                ${
                                    isShuffle
                                        ? "text-[#10aaa9]"
                                        : "text-[#899398] hover:bg-white/[0.05] hover:text-white"
                                }
                            `}
                        >
                            <Shuffle
                                size={17}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* =====================
                            PREVIOUS
                        ===================== */}

                        <button
                            type="button"
                            onClick={previousSong}
                            aria-label="Previous song"
                            title="Previous"
                            className="
                                flex h-8 w-8
                                items-center justify-center
                                rounded-full
                                text-[#899398]
                                transition-all
                                hover:bg-white/[0.05]
                                hover:text-white
                            "
                        >
                            <SkipBack
                                size={18}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* =====================
                            PLAY / PAUSE
                        ===================== */}

                        <button
                            type="button"
                            onClick={togglePlay}
                            aria-label={
                                isPlaying
                                    ? "Pause"
                                    : "Play"
                            }
                            className="
                                flex
                                h-11 w-11
                                items-center justify-center
                                rounded-full
                                bg-[#10aaa9]
                                text-white
                                shadow-[0_4px_18px_rgba(16,170,169,0.25)]
                                transition-all
                                duration-200
                                hover:scale-105
                                hover:bg-[#12bdbc]
                                hover:shadow-[0_4px_24px_rgba(16,170,169,0.35)]
                                active:scale-95
                                sm:h-12 sm:w-12
                            "
                        >
                            {isPlaying ? (
                                <Pause
                                    size={19}
                                    fill="currentColor"
                                    strokeWidth={1.8}
                                />
                            ) : (
                                <Play
                                    size={20}
                                    fill="currentColor"
                                    strokeWidth={1.8}
                                    className="ml-[2px]"
                                />
                            )}
                        </button>

                        {/* =====================
                            NEXT
                        ===================== */}

                        <button
                            type="button"
                            onClick={nextSong}
                            aria-label="Next song"
                            title="Next"
                            className="
                                flex h-8 w-8
                                items-center justify-center
                                rounded-full
                                text-[#899398]
                                transition-all
                                hover:bg-white/[0.05]
                                hover:text-white
                            "
                        >
                            <SkipForward
                                size={18}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* =====================
                            REPEAT
                        ===================== */}

                        <button
                            type="button"
                            onClick={toggleRepeat}
                            aria-label="Repeat"
                            title={
                                isRepeat
                                    ? "Repeat On"
                                    : "Repeat Off"
                            }
                            className={`
                                flex h-8 w-8
                                items-center justify-center
                                rounded-full
                                transition-all
                                ${
                                    isRepeat
                                        ? "text-[#10aaa9]"
                                        : "text-[#899398] hover:bg-white/[0.05] hover:text-white"
                                }
                            `}
                        >
                            <Repeat
                                size={17}
                                strokeWidth={1.8}
                            />
                        </button>
                    </div>

                    {/* ============================
                        PROGRESS
                    ============================ */}

                    <div
                        className="
                            mt-1
                            flex w-full
                            max-w-[650px]
                            items-center
                            gap-2
                        "
                    >
                        {/* Current Time */}

                        <span
                            className="
                                hidden
                                w-8
                                text-right
                                text-[10px]
                                tabular-nums
                                text-[#68747a]
                                sm:block
                            "
                        >
                            {formatTime(currentTime)}
                        </span>

                        {/* Progress Track */}

                        <div
                            className="
                                relative
                                flex h-4
                                flex-1
                                items-center
                            "
                        >
                            {/* Track */}

                            <div
                                className="
                                    absolute left-0 right-0
                                    h-[3px]
                                    overflow-hidden
                                    rounded-full
                                    bg-[#293337]
                                "
                            >
                                <div
                                    className="
                                        h-full
                                        rounded-full
                                        bg-[#10aaa9]
                                    "
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>

                            {/* Range */}

                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                step="0.1"
                                value={currentTime}
                                onChange={(e) =>
                                    seek(e.target.value)
                                }
                                className="
                                    absolute inset-0
                                    h-4 w-full
                                    cursor-pointer
                                    opacity-0
                                "
                                aria-label="Song progress"
                            />

                            {/* Thumb */}

                            {duration > 0 && (
                                <div
                                    className="
                                        pointer-events-none
                                        absolute
                                        h-2.5 w-2.5
                                        rounded-full
                                        bg-[#10aaa9]
                                        shadow-[0_0_8px_rgba(16,170,169,0.45)]
                                    "
                                    style={{
                                        left: `calc(${progress}% - 5px)`,
                                    }}
                                />
                            )}
                        </div>

                        {/* Duration */}

                        <span
                            className="
                                hidden
                                w-8
                                text-[10px]
                                tabular-nums
                                text-[#68747a]
                                sm:block
                            "
                        >
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* ============================
                    VOLUME
                ============================ */}

                <div
                    className="
                        hidden
                        w-[200px]
                        shrink-0
                        items-center
                        justify-end
                        gap-3
                        lg:flex
                    "
                >
                    {/* Mute */}

                    <button
                        type="button"
                        onClick={() =>
                            changeVolume(
                                volume === 0
                                    ? 1
                                    : 0
                            )
                        }
                        aria-label={
                            volume === 0
                                ? "Unmute"
                                : "Mute"
                        }
                        className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-full
                            text-[#7d898f]
                            transition
                            hover:bg-white/[0.05]
                            hover:text-white
                        "
                    >
                        {volume === 0 ? (
                            <VolumeX
                                size={17}
                                strokeWidth={1.8}
                            />
                        ) : (
                            <Volume2
                                size={17}
                                strokeWidth={1.8}
                            />
                        )}
                    </button>

                    {/* Volume Slider */}

                    <div
                        className="
                            relative
                            h-4
                            w-[90px]
                        "
                    >
                        <div
                            className="
                                absolute
                                left-0 right-0
                                top-1/2
                                h-[3px]
                                -translate-y-1/2
                                rounded-full
                                bg-[#293337]
                            "
                        >
                            <div
                                className="
                                    h-full
                                    rounded-full
                                    bg-[#10aaa9]
                                "
                                style={{
                                    width: `${volume * 100}%`,
                                }}
                            />
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) =>
                                changeVolume(
                                    e.target.value
                                )
                            }
                            className="
                                absolute inset-0
                                h-4 w-full
                                cursor-pointer
                                opacity-0
                            "
                            aria-label="Volume"
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute top-1/2
                                h-2.5 w-2.5
                                -translate-y-1/2
                                rounded-full
                                bg-[#10aaa9]
                            "
                            style={{
                                left: `calc(${volume * 100}% - 5px)`,
                            }}
                        />
                    </div>
                </div>

                {/* Mobile Progress Line */}

                <div
                    className="
                        pointer-events-none
                        absolute bottom-0 left-0 right-0
                        h-[2px]
                        bg-[#293337]
                        sm:hidden
                    "
                >
                    <div
                        className="h-full bg-[#10aaa9]"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </div>
            </div>

            {showLoginModal && (
                <LoginRequiredModal
                    onClose={() => setShowLoginModal(false)}
                />
            )}
        </>
    );
}