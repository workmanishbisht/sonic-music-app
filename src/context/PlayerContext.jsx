import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { songs } from "@/data/songs";
import LoginRequiredModal from "@/components/player/LoginRequiredModal";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
    const audioRef = useRef(null);
    const currentSongRef = useRef(null);

    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const [showLoginModal, setShowLoginModal] = useState(false);

    // ==========================================
    // AUTH CHECK
    // ==========================================
    const checkLogin = useCallback(() => {
        return localStorage.getItem("sonicLoggedIn") === "true";
    }, []);

    // ==========================================
    // KEEP CURRENT SONG REF UPDATED
    // ==========================================
    useEffect(() => {
        currentSongRef.current = currentSong;
    }, [currentSong]);

    // ==========================================
    // CREATE AUDIO PLAYER
    // ==========================================
    useEffect(() => {
        const audio = new Audio();

        audioRef.current = audio;

        audio.preload = "metadata";
        audio.volume = 1;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime || 0);
        };

        const handleLoadedMetadata = () => {
            if (Number.isFinite(audio.duration)) {
                setDuration(audio.duration);
            } else {
                setDuration(0);
            }
        };

        const handleEnded = () => {
            const song = currentSongRef.current;

            if (!song) {
                setIsPlaying(false);
                return;
            }

            const currentIndex = songs.findIndex(
                (item) => item.id === song.id
            );

            if (currentIndex === -1) {
                setIsPlaying(false);
                return;
            }

            const nextIndex =
                currentIndex === songs.length - 1
                    ? 0
                    : currentIndex + 1;

            const next = songs[nextIndex];

            currentSongRef.current = next;
            setCurrentSong(next);
            setCurrentTime(0);
            setDuration(0);

            // Automatically play next song
            audio.src = next.audio;
            audio.currentTime = 0;
            audio.volume = volume;

            audio.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((error) => {
                    console.error("Next song play error:", error);
                    setIsPlaying(false);
                });
        };

        const handleError = () => {
            console.error("Audio failed to load:", audio.src);
            setIsPlaying(false);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        return () => {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();

            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("error", handleError);

            audioRef.current = null;
        };
    }, [volume]);

    // ==========================================
    // PLAY SONG
    // ==========================================
    const playSong = useCallback(
        async (song) => {
            if (!song) return;

            // Login required
            if (!checkLogin()) {
                setShowLoginModal(true);
                return;
            }

            const audio = audioRef.current;

            if (!audio) {
                console.error("Audio player is not initialized.");
                return;
            }

            try {
                // If same song is already loaded
                if (currentSongRef.current?.id === song.id) {
                    if (audio.paused) {
                        await audio.play();
                    }

                    setIsPlaying(true);
                    return;
                }

                // Stop current song
                audio.pause();

                // Set new song
                currentSongRef.current = song;
                setCurrentSong(song);

                setCurrentTime(0);
                setDuration(0);

                // Set audio source
                audio.src = song.audio;
                audio.currentTime = 0;
                audio.volume = volume;

                // Force browser to load new audio
                audio.load();

                // IMPORTANT:
                // Play directly from user interaction
                await audio.play();

                setIsPlaying(true);
            } catch (error) {
                console.error("Audio play error:", error);
                setIsPlaying(false);
            }
        },
        [checkLogin, volume]
    );

    // ==========================================
    // PAUSE
    // ==========================================
    const pauseSong = useCallback(() => {
        if (!checkLogin()) {
            setShowLoginModal(true);
            return;
        }

        const audio = audioRef.current;

        if (!audio) return;

        audio.pause();
        setIsPlaying(false);
    }, [checkLogin]);

    // ==========================================
    // RESUME
    // ==========================================
    const resumeSong = useCallback(async () => {
        if (!checkLogin()) {
            setShowLoginModal(true);
            return;
        }

        const audio = audioRef.current;

        if (!audio || !currentSongRef.current) return;

        try {
            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Resume audio error:", error);
            setIsPlaying(false);
        }
    }, [checkLogin]);

    // ==========================================
    // TOGGLE PLAY / PAUSE
    // ==========================================
    const togglePlay = useCallback(async () => {
        if (!checkLogin()) {
            setShowLoginModal(true);
            return;
        }

        const audio = audioRef.current;

        if (!audio) return;

        // No current song
        if (!currentSongRef.current) {
            if (songs.length > 0) {
                await playSong(songs[0]);
            }

            return;
        }

        // Currently playing
        if (!audio.paused) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        // Currently paused
        try {
            await audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Toggle play error:", error);
            setIsPlaying(false);
        }
    }, [checkLogin, playSong]);

    // ==========================================
    // NEXT SONG
    // ==========================================
    const nextSong = useCallback(async () => {
        if (!checkLogin()) {
            setShowLoginModal(true);
            return;
        }

        const song = currentSongRef.current;

        if (!song) {
            if (songs.length > 0) {
                await playSong(songs[0]);
            }

            return;
        }

        const currentIndex = songs.findIndex(
            (item) => item.id === song.id
        );

        if (currentIndex === -1) return;

        const nextIndex =
            currentIndex === songs.length - 1
                ? 0
                : currentIndex + 1;

        const next = songs[nextIndex];

        await playSong(next);
    }, [checkLogin, playSong]);

    // ==========================================
    // PREVIOUS SONG
    // ==========================================
    const previousSong = useCallback(async () => {
        if (!checkLogin()) {
            setShowLoginModal(true);
            return;
        }

        const song = currentSongRef.current;

        if (!song) {
            if (songs.length > 0) {
                await playSong(songs[0]);
            }

            return;
        }

        const currentIndex = songs.findIndex(
            (item) => item.id === song.id
        );

        if (currentIndex === -1) return;

        const previousIndex =
            currentIndex === 0
                ? songs.length - 1
                : currentIndex - 1;

        const previous = songs[previousIndex];

        await playSong(previous);
    }, [checkLogin, playSong]);

    // ==========================================
    // SEEK
    // ==========================================
    const seek = useCallback((value) => {
        const audio = audioRef.current;

        if (!audio) return;

        const newTime = Number(value);

        if (!Number.isFinite(newTime)) return;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    }, []);

    // ==========================================
    // VOLUME
    // ==========================================
    const changeVolume = useCallback((value) => {
        const newVolume = Math.min(
            1,
            Math.max(0, Number(value))
        );

        setVolume(newVolume);

        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    }, []);

    // ==========================================
    // CONTEXT VALUE
    // ==========================================
    const value = {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,

        playSong,
        pauseSong,
        resumeSong,
        togglePlay,
        nextSong,
        previousSong,
        seek,
        changeVolume,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}

            {showLoginModal && (
                <LoginRequiredModal
                    onClose={() => setShowLoginModal(false)}
                />
            )}
        </PlayerContext.Provider>
    );
}

// ==========================================
// USE PLAYER HOOK
// ==========================================
export function usePlayer() {
    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error(
            "usePlayer must be used inside PlayerProvider"
        );
    }

    return context;
}