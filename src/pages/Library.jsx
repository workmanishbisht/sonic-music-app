import { useEffect, useState } from "react";
import { Heart, Loader2, Music2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { songs } from "@/data/songs";
import SongRow from "@/components/music/SongRow";

export default function Library() {
    const { user, loading: authLoading } = useAuth();

    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // LOAD FAVORITES FROM FIRESTORE
    // ==========================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        // User logged out
        if (!user) {
            setFavoriteSongs([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const favoritesRef = collection(
            db,
            "users",
            user.uid,
            "favorites"
        );

        const unsubscribe = onSnapshot(
            favoritesRef,
            (snapshot) => {
                const favoriteIds = snapshot.docs.map(
                    (doc) => String(doc.id)
                );

                /*
                 * Get original song objects from songs.js
                 * instead of using asset URLs saved in Firestore.
                 */
                const userFavorites = favoriteIds
                    .map((id) =>
                        songs.find(
                            (song) =>
                                String(song.id) === id
                        )
                    )
                    .filter(Boolean);

                setFavoriteSongs(userFavorites);
                setLoading(false);
            },
            (error) => {
                console.error(
                    "Favorites loading error:",
                    error
                );

                setFavoriteSongs([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, authLoading]);

    // ==========================================
    // AUTH LOADING
    // ==========================================

    if (authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2
                    size={24}
                    className="animate-spin text-[#10aaa9]"
                />
            </div>
        );
    }

    // ==========================================
    // LOGGED OUT
    // ==========================================

    if (!user) {
        return (
            <div className="py-8 sm:py-10">
                <div className="mb-8">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                        Your Library
                    </p>

                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Library
                    </h1>

                    <p className="mt-2 text-[13px] text-[#7f8a90]">
                        Your songs, playlists, albums and
                        artists.
                    </p>
                </div>

                <div
                    className="
                        flex
                        min-h-[380px]
                        flex-col
                        items-center
                        justify-center
                        rounded-[6px]
                        border
                        border-white/[0.06]
                        bg-[#11181d]
                        px-5
                        text-center
                    "
                >
                    <div
                        className="
                            mb-5
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-[#10aaa9]/[0.10]
                            text-[#10aaa9]
                        "
                    >
                        <Heart
                            size={28}
                            strokeWidth={1.6}
                        />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                        Your favorites are waiting
                    </h2>

                    <p className="mt-2 max-w-[400px] text-[12px] leading-5 text-[#7f8a90]">
                        Log in to save your favorite songs
                        and access them anytime from your
                        library.
                    </p>

                    <Link
                        to="/login"
                        className="
                            mt-6
                            inline-flex
                            h-10
                            items-center
                            gap-2
                            rounded-[4px]
                            bg-[#10aaa9]
                            px-5
                            text-[12px]
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#12c1bf]
                        "
                    >
                        <LogIn size={15} />
                        Log in
                    </Link>
                </div>
            </div>
        );
    }

    // ==========================================
    // LOGGED IN LIBRARY
    // ==========================================

    return (
        <div className="py-8 sm:py-10">
            {/* ======================================
                HEADER
            ====================================== */}

            <div className="mb-7">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                            Your Music
                        </p>

                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Library
                        </h1>

                        <p className="mt-2 text-[13px] text-[#7f8a90]">
                            Your songs, playlists, albums and
                            artists.
                        </p>
                    </div>
                </div>
            </div>

            {/* ======================================
                FAVORITE SONGS
            ====================================== */}

            <section>
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-[4px]
                                bg-[#10aaa9]/[0.10]
                                text-[#10aaa9]
                            "
                        >
                            <Heart
                                size={18}
                                fill="currentColor"
                                strokeWidth={1.6}
                            />
                        </div>

                        <div>
                            <h2 className="text-[16px] font-semibold text-white">
                                Favorite Songs
                            </h2>

                            <p className="mt-0.5 text-[11px] text-[#68747a]">
                                {favoriteSongs.length}{" "}
                                {favoriteSongs.length === 1
                                    ? "song"
                                    : "songs"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ==================================
                    LOADING
                ================================== */}

                {loading ? (
                    <div
                        className="
                            flex
                            min-h-[300px]
                            items-center
                            justify-center
                            rounded-[6px]
                            border
                            border-white/[0.06]
                            bg-[#11181d]
                        "
                    >
                        <div className="flex items-center gap-3 text-[#7f8a90]">
                            <Loader2
                                size={19}
                                className="animate-spin text-[#10aaa9]"
                            />

                            <span className="text-[12px]">
                                Loading your favorites...
                            </span>
                        </div>
                    </div>
                ) : favoriteSongs.length === 0 ? (
                    /* ==================================
                       EMPTY STATE
                    ================================== */

                    <div
                        className="
                            flex
                            min-h-[320px]
                            flex-col
                            items-center
                            justify-center
                            rounded-[6px]
                            border
                            border-white/[0.06]
                            bg-[#11181d]
                            px-5
                            text-center
                        "
                    >
                        <div
                            className="
                                mb-5
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-full
                                bg-[#182126]
                                text-[#68747a]
                            "
                        >
                            <Music2
                                size={28}
                                strokeWidth={1.5}
                            />
                        </div>

                        <h3 className="text-[15px] font-semibold text-white">
                            No favorite songs yet
                        </h3>

                        <p className="mt-2 max-w-[380px] text-[12px] leading-5 text-[#7f8a90]">
                            When you find a song you love,
                            tap the heart icon to save it
                            here.
                        </p>

                        <Link
                            to="/discover"
                            className="
                                mt-5
                                inline-flex
                                h-9
                                items-center
                                rounded-[4px]
                                border
                                border-white/[0.08]
                                bg-[#182126]
                                px-4
                                text-[11px]
                                font-medium
                                text-white
                                transition
                                hover:border-[#10aaa9]/40
                                hover:bg-[#10aaa9]/10
                                hover:text-[#10aaa9]
                            "
                        >
                            Discover Music
                        </Link>
                    </div>
                ) : (
                    /* ==================================
                       FAVORITE SONG LIST
                    ================================== */

                    <div
                        className="
                            overflow-x-auto
                            rounded-[6px]
                            border
                            border-white/[0.06]
                            bg-[#11181d]
                        "
                    >
                        {/* TABLE HEADER */}

                        <div
                            className="
                                grid
                                min-w-[700px]
                                grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_40px]
                                items-center
                                gap-4
                                border-b
                                border-white/[0.06]
                                px-4
                                py-3
                            "
                        >
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                #
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                Song
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                Album
                            </span>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#68747a]">
                                Duration
                            </span>

                            <span />
                        </div>

                        {/* SONG ROWS */}

                        <div className="min-w-[700px]">
                            {favoriteSongs.map(
                                (song, index) => (
                                    <SongRow
                                        key={song.id}
                                        song={song}
                                        number={String(
                                            index + 1
                                        ).padStart(2, "0")}
                                        image={song.image}
                                        title={song.title}
                                        artist={song.artist}
                                        album={song.album}
                                        duration={
                                            song.duration
                                        }
                                        audio={song.audio}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}