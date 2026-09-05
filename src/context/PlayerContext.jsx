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
import { useAuth } from "@/context/AuthContext";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
    const audioRef = useRef(null);
    const currentSongRef = useRef(null);
    const { user, loading: authLoading } = useAuth();

    // Shuffle / Repeat refs
    const shuffleRef = useRef(false);
    const repeatRef = useRef(false);

    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [volume, setVolume] = useState(1);

    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);

    // ==========================================
    // AUTH CHECK
    // ==========================================

    const checkLogin = useCallback(() => {
        return !!user;
    }, [user]);

    // ==========================================
    // KEEP CURRENT SONG REF UPDATED
    // ==========================================

    useEffect(() => {
        currentSongRef.current = currentSong;
    }, [currentSong]);

    // ==========================================
    // KEEP SHUFFLE REF UPDATED
    // ==========================================

    useEffect(() => {
        shuffleRef.current = isShuffle;
    }, [isShuffle]);

    // ==========================================
    // KEEP REPEAT REF UPDATED
    // ==========================================

    useEffect(() => {
        repeatRef.current = isRepeat;
    }, [isRepeat]);

    // ==========================================
    // CREATE AUDIO PLAYER
    // ==========================================

    useEffect(() => {
        const audio = new Audio();

        audioRef.current = audio;

        audio.preload = "metadata";
        audio.volume = 1;

        // ======================================
        // TIME UPDATE
        // ======================================

        const handleTimeUpdate = () => {
            setCurrentTime(
                audio.currentTime || 0
            );
        };

        // ======================================
        // LOADED METADATA
        // ======================================

        const handleLoadedMetadata = () => {
            if (
                Number.isFinite(audio.duration)
            ) {
                setDuration(audio.duration);
            } else {
                setDuration(0);
            }
        };

        // ======================================
        // SONG ENDED
        // ======================================

        const handleEnded = async () => {
            const song =
                currentSongRef.current;

            if (!song) {
                setIsPlaying(false);
                return;
            }

            // ==================================
            // REPEAT CURRENT SONG
            // ==================================

            if (repeatRef.current) {
                audio.currentTime = 0;

                try {
                    await audio.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.error(
                        "Repeat play error:",
                        error
                    );

                    setIsPlaying(false);
                }

                return;
            }

            // ==================================
            // FIND CURRENT SONG
            // ==================================

            const currentIndex =
                songs.findIndex(
                    (item) =>
                        item.id === song.id
                );

            if (currentIndex === -1) {
                setIsPlaying(false);
                return;
            }

            let nextIndex;

            // ==================================
            // SHUFFLE
            // ==================================

            if (
                shuffleRef.current &&
                songs.length > 1
            ) {
                do {
                    nextIndex =
                        Math.floor(
                            Math.random() *
                            songs.length
                        );
                } while (
                    nextIndex ===
                    currentIndex
                );
            } else {
                // ==============================
                // NORMAL NEXT
                // ==============================

                nextIndex =
                    currentIndex ===
                        songs.length - 1
                        ? 0
                        : currentIndex + 1;
            }

            const next =
                songs[nextIndex];

            // ==================================
            // UPDATE STATE
            // ==================================

            currentSongRef.current = next;

            setCurrentSong(next);
            setCurrentTime(0);
            setDuration(0);

            // ==================================
            // LOAD NEXT SONG
            // ==================================

            audio.src = next.audio;
            audio.currentTime = 0;
            audio.volume = volume;

            try {
                await audio.play();

                setIsPlaying(true);
            } catch (error) {
                console.error(
                    "Next song play error:",
                    error
                );

                setIsPlaying(false);
            }
        };

        // ======================================
        // AUDIO ERROR
        // ======================================

        const handleError = () => {
            console.error(
                "Audio failed to load:",
                audio.src
            );

            setIsPlaying(false);
        };

        // ======================================
        // EVENTS
        // ======================================

        audio.addEventListener(
            "timeupdate",
            handleTimeUpdate
        );

        audio.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata
        );

        audio.addEventListener(
            "ended",
            handleEnded
        );

        audio.addEventListener(
            "error",
            handleError
        );

        // ======================================
        // CLEANUP
        // ======================================

        return () => {
            audio.pause();

            audio.removeAttribute("src");
            audio.load();

            audio.removeEventListener(
                "timeupdate",
                handleTimeUpdate
            );

            audio.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );

            audio.removeEventListener(
                "ended",
                handleEnded
            );

            audio.removeEventListener(
                "error",
                handleError
            );

            audioRef.current = null;
        };
    }, []);

    // ==========================================
    // KEEP AUDIO VOLUME UPDATED
    // ==========================================

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
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

            const audio =
                audioRef.current;

            if (!audio) return;

            try {
                // Pause current audio
                audio.pause();

                // Set current song
                currentSongRef.current = song;

                setCurrentSong(song);

                setCurrentTime(0);
                setDuration(0);

                // Set audio
                audio.src = song.audio;
                audio.load();

                audio.volume = volume;

                // Play
                await audio.play();

                setIsPlaying(true);
            } catch (error) {
                console.error(
                    "Audio play error:",
                    error
                );

                setIsPlaying(false);
            }
        },
        [checkLogin, volume]
    );

    // ==========================================
    // PAUSE SONG
    // ==========================================

    const pauseSong = useCallback(() => {
        const audio =
            audioRef.current;

        if (!audio) return;

        audio.pause();

        setIsPlaying(false);
    }, []);

    // ==========================================
    // RESUME SONG
    // ==========================================

    const resumeSong = useCallback(
        async () => {
            if (!checkLogin()) {
                setShowLoginModal(true);
                return;
            }

            const audio =
                audioRef.current;

            if (!audio || !currentSong) {
                return;
            }

            try {
                await audio.play();

                setIsPlaying(true);
            } catch (error) {
                console.error(
                    "Resume play error:",
                    error
                );

                setIsPlaying(false);
            }
        },
        [checkLogin, currentSong]
    );

    // ==========================================
    // TOGGLE PLAY
    // ==========================================

    const togglePlay = useCallback(
        async () => {
            if (!checkLogin()) {
                setShowLoginModal(true);
                return;
            }

            if (!currentSong) {
                if (songs.length > 0) {
                    await playSong(songs[0]);
                }

                return;
            }

            const audio =
                audioRef.current;

            if (!audio) return;

            if (audio.paused) {
                try {
                    await audio.play();

                    setIsPlaying(true);
                } catch (error) {
                    console.error(
                        "Toggle play error:",
                        error
                    );

                    setIsPlaying(false);
                }
            } else {
                audio.pause();

                setIsPlaying(false);
            }
        },
        [
            checkLogin,
            currentSong,
            playSong,
        ]
    );

    // ==========================================
    // NEXT SONG
    // ==========================================

    const nextSong = useCallback(
        async () => {
            if (!checkLogin()) {
                setShowLoginModal(true);
                return;
            }

            const song =
                currentSongRef.current;

            if (!song) {
                if (songs.length > 0) {
                    await playSong(songs[0]);
                }

                return;
            }

            const currentIndex =
                songs.findIndex(
                    (item) =>
                        item.id === song.id
                );

            if (currentIndex === -1) {
                return;
            }

            let nextIndex;

            // Shuffle
            if (
                shuffleRef.current &&
                songs.length > 1
            ) {
                do {
                    nextIndex =
                        Math.floor(
                            Math.random() *
                            songs.length
                        );
                } while (
                    nextIndex ===
                    currentIndex
                );
            } else {
                // Normal next
                nextIndex =
                    currentIndex ===
                        songs.length - 1
                        ? 0
                        : currentIndex + 1;
            }

            const next =
                songs[nextIndex];

            await playSong(next);
        },
        [checkLogin, playSong]
    );

    // ==========================================
    // PREVIOUS SONG
    // ==========================================

    const previousSong = useCallback(
        async () => {
            if (!checkLogin()) {
                setShowLoginModal(true);
                return;
            }

            const song =
                currentSongRef.current;

            if (!song) {
                if (songs.length > 0) {
                    await playSong(songs[0]);
                }

                return;
            }

            const currentIndex =
                songs.findIndex(
                    (item) =>
                        item.id === song.id
                );

            if (currentIndex === -1) {
                return;
            }

            // Previous always normal order
            const previousIndex =
                currentIndex === 0
                    ? songs.length - 1
                    : currentIndex - 1;

            const previous =
                songs[previousIndex];

            await playSong(previous);
        },
        [checkLogin, playSong]
    );

    // ==========================================
    // SEEK
    // ==========================================

    const seek = useCallback(
        (value) => {
            const audio =
                audioRef.current;

            if (!audio) return;

            const newTime =
                Number(value);

            if (
                !Number.isFinite(
                    newTime
                )
            ) {
                return;
            }

            audio.currentTime =
                newTime;

            setCurrentTime(newTime);
        },
        []
    );

    // ==========================================
    // VOLUME
    // ==========================================

    const changeVolume = useCallback(
        (value) => {
            const newVolume =
                Math.min(
                    1,
                    Math.max(
                        0,
                        Number(value)
                    )
                );

            setVolume(newVolume);

            if (audioRef.current) {
                audioRef.current.volume =
                    newVolume;
            }
        },
        []
    );

    // ==========================================
    // SHUFFLE
    // ==========================================

    const toggleShuffle =
        useCallback(() => {
            setIsShuffle(
                (previous) =>
                    !previous
            );
        }, []);

    // ==========================================
    // REPEAT
    // ==========================================

    const toggleRepeat =
        useCallback(() => {
            setIsRepeat(
                (previous) =>
                    !previous
            );
        }, []);

    // ==========================================
    // STOP PLAYBACK WHEN USER LOGS OUT
    // ==========================================

    useEffect(() => {
        if (authLoading || user) return;

        const audio = audioRef.current;

        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        currentSongRef.current = null;
        setCurrentSong(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, [user, authLoading]);

    // ==========================================
    // CONTEXT VALUE
    // ==========================================

    const value = {
        currentSong,
        isPlaying,
        authLoading,

        currentTime,
        duration,

        volume,

        isShuffle,
        isRepeat,

        playSong,
        pauseSong,
        resumeSong,

        togglePlay,

        nextSong,
        previousSong,

        seek,
        changeVolume,

        toggleShuffle,
        toggleRepeat,
    };

    return (
        <PlayerContext.Provider
            value={value}
        >
            {children}

            {/* Login Required Popup */}

            {showLoginModal && (
                <LoginRequiredModal
                    onClose={() =>
                        setShowLoginModal(
                            false
                        )
                    }
                />
            )}
        </PlayerContext.Provider>
    );
}

// ==========================================
// USE PLAYER HOOK
// ==========================================

export function usePlayer() {
    const context =
        useContext(PlayerContext);

    if (!context) {
        throw new Error(
            "usePlayer must be used inside PlayerProvider"
        );
    }

    return context;
}