import {
    Heart,
    Pause,
    Play,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
} from "lucide-react";

import { usePlayer } from "@/context/PlayerContext";

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
        togglePlay,
        nextSong,
        previousSong,
        seek,
        changeVolume,
    } = usePlayer();

    // Player tabhi show hoga jab song select hoga
    if (!currentSong) {
        return null;
    }

    const progress =
        duration > 0
            ? Math.min((currentTime / duration) * 100, 100)
            : 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.07] bg-[#0b1114]/[0.98] shadow-[0_-8px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:left-[253px]">

            <div className="flex h-[86px] items-center px-4 sm:px-6">

                {/* =========================================
                    CURRENT SONG
                ========================================= */}
                <div className="flex min-w-0 shrink-0 items-center gap-3 lg:w-[290px]">

                    {/* Album Image */}
                    <div className="relative shrink-0 overflow-hidden rounded-[5px]">
                        <img
                            src={currentSong.image}
                            alt={currentSong.title}
                            className="h-[52px] w-[52px] object-cover"
                        />

                        {/* Playing Animation */}
                        {isPlaying && (
                            <div className="absolute inset-x-0 bottom-0 flex h-5 items-end justify-center gap-[2px] bg-gradient-to-t from-black/50 to-transparent pb-1">
                                <span className="h-1.5 w-[2px] animate-pulse rounded-full bg-white" />
                                <span className="h-3 w-[2px] animate-pulse rounded-full bg-white [animation-delay:150ms]" />
                                <span className="h-2 w-[2px] animate-pulse rounded-full bg-white [animation-delay:300ms]" />
                                <span className="h-3.5 w-[2px] animate-pulse rounded-full bg-white [animation-delay:450ms]" />
                            </div>
                        )}
                    </div>

                    {/* Song Details */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-white">
                            {currentSong.title}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-[#7d898f]">
                            {currentSong.artist}
                        </p>
                    </div>

                    {/* Like */}
                    <button
                        type="button"
                        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7d898f] transition-all hover:bg-white/[0.06] hover:text-[#10aaa9] sm:flex"
                        aria-label="Like song"
                    >
                        <Heart
                            size={17}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>

                {/* =========================================
                    CENTER PLAYER
                ========================================= */}
                <div className="flex min-w-0 flex-1 flex-col items-center px-3 sm:px-6">

                    {/* Controls */}
                    <div className="flex h-[34px] items-center gap-3 sm:gap-5">

                        {/* Previous */}
                        <button
                            type="button"
                            onClick={previousSong}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#899398] transition-all hover:bg-white/[0.05] hover:text-white"
                            aria-label="Previous song"
                        >
                            <SkipBack
                                size={17}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* Play / Pause */}
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10aaa9] text-white shadow-[0_4px_18px_rgba(16,170,169,0.25)] transition-all duration-200 hover:scale-105 hover:bg-[#12bdbc] hover:shadow-[0_4px_24px_rgba(16,170,169,0.35)] active:scale-95"
                            aria-label={
                                isPlaying
                                    ? "Pause"
                                    : "Play"
                            }
                        >
                            {isPlaying ? (
                                <Pause
                                    size={17}
                                    fill="currentColor"
                                    strokeWidth={1.8}
                                />
                            ) : (
                                <Play
                                    size={18}
                                    fill="currentColor"
                                    strokeWidth={1.8}
                                    className="ml-[2px]"
                                />
                            )}
                        </button>

                        {/* Next */}
                        <button
                            type="button"
                            onClick={nextSong}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#899398] transition-all hover:bg-white/[0.05] hover:text-white"
                            aria-label="Next song"
                        >
                            <SkipForward
                                size={17}
                                strokeWidth={1.8}
                            />
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-1 flex w-full max-w-[650px] items-center gap-2">

                        <span className="hidden w-8 text-right text-[10px] tabular-nums text-[#68747a] sm:block">
                            {formatTime(currentTime)}
                        </span>

                        <div className="relative flex h-4 flex-1 items-center">

                            {/* Track */}
                            <div className="absolute left-0 right-0 h-[3px] overflow-hidden rounded-full bg-[#293337]">
                                <div
                                    className="h-full rounded-full bg-[#10aaa9]"
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
                                className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
                                aria-label="Song progress"
                            />

                            {/* Thumb */}
                            {duration > 0 && (
                                <div
                                    className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-[#10aaa9] shadow-[0_0_8px_rgba(16,170,169,0.45)]"
                                    style={{
                                        left: `calc(${progress}% - 5px)`,
                                    }}
                                />
                            )}
                        </div>

                        <span className="hidden w-8 text-[10px] tabular-nums text-[#68747a] sm:block">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* =========================================
                    VOLUME
                ========================================= */}
                <div className="hidden w-[200px] shrink-0 items-center justify-end gap-3 lg:flex">

                    {/* Mute */}
                    <button
                        type="button"
                        onClick={() =>
                            changeVolume(
                                volume === 0 ? 1 : 0
                            )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d898f] transition hover:bg-white/[0.05] hover:text-white"
                        aria-label={
                            volume === 0
                                ? "Unmute"
                                : "Mute"
                        }
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
                    <div className="relative h-4 w-[90px]">

                        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#293337]">
                            <div
                                className="h-full rounded-full bg-[#10aaa9]"
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
                            className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
                            aria-label="Volume"
                        />

                        <div
                            className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#10aaa9]"
                            style={{
                                left: `calc(${volume * 100}% - 5px)`,
                            }}
                        />
                    </div>

                    <span className="w-8 text-right text-[10px] tabular-nums text-[#68747a]">
                        {Math.round(volume * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
}