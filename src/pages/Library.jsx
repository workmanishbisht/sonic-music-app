import { useEffect, useState } from "react";

import {
    Heart,
    Loader2,
    Music2,
    LogIn,
    Plus,
    ListMusic,
    X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { songs } from "@/data/songs";
import SongRow from "@/components/music/SongRow";

export default function Library() {
    const { user, loading: authLoading } = useAuth();
    const { playlists, loading: playlistsLoading, createPlaylist } =
        usePlaylist();

    const navigate = useNavigate();

    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistDescription, setPlaylistDescription] = useState("");
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);
    const [playlistError, setPlaylistError] = useState("");

    // ==========================================
    // LOAD FAVORITES FROM FIRESTORE
    // ==========================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

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
                const favoriteIds = snapshot.docs.map((doc) =>
                    String(doc.id)
                );

                const userFavorites = favoriteIds
                    .map((id) =>
                        songs.find(
                            (song) => String(song.id) === id
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
    // CREATE PLAYLIST
    // ==========================================

    const openCreatePlaylist = () => {
        setPlaylistName("");
        setPlaylistDescription("");
        setPlaylistError("");
        setShowCreateModal(true);
    };

    const closeCreatePlaylist = () => {
        if (creatingPlaylist) return;

        setShowCreateModal(false);
        setPlaylistName("");
        setPlaylistDescription("");
        setPlaylistError("");
    };

    const handleCreatePlaylist = async (event) => {
        event.preventDefault();

        const trimmedName = playlistName.trim();

        if (!trimmedName) {
            setPlaylistError("Please enter a playlist name.");
            return;
        }

        try {
            setCreatingPlaylist(true);
            setPlaylistError("");

            const newPlaylist = await createPlaylist({
                name: trimmedName,
                description: playlistDescription.trim(),
            });

            setShowCreateModal(false);
            setPlaylistName("");
            setPlaylistDescription("");

            if (newPlaylist?.id) {
                navigate(`/playlist/${newPlaylist.id}`);
            }
        } catch (error) {
            console.error("Create playlist error:", error);
            setPlaylistError(
                error?.message || "Unable to create playlist."
            );
        } finally {
            setCreatingPlaylist(false);
        }
    };

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
                        Your songs, playlists, albums and artists.
                    </p>
                </div>

                <div
                    className="
                        flex min-h-[380px] flex-col items-center
                        justify-center rounded-[6px] border border-white/[0.06]
                        bg-[#11181d] px-5 text-center
                    "
                >
                    <div
                        className="
                            mb-5 flex h-16 w-16 items-center justify-center
                            rounded-full bg-[#10aaa9]/[0.10] text-[#10aaa9]
                        "
                    >
                        <Heart size={28} strokeWidth={1.6} />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                        Your favorites are waiting
                    </h2>

                    <p className="mt-2 max-w-[400px] text-[12px] leading-5 text-[#7f8a90]">
                        Log in to save your favorite songs and access them
                        anytime from your library.
                    </p>

                    <Link
                        to="/login"
                        className="
                            mt-6 inline-flex h-10 items-center gap-2
                            rounded-[4px] bg-[#10aaa9] px-5 text-[12px]
                            font-semibold text-white transition hover:bg-[#12c1bf]
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
        <>
            <div className="py-8 sm:py-10">
                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="mb-8">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                        Your Music
                    </p>

                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Library
                    </h1>

                    <p className="mt-2 text-[13px] text-[#7f8a90]">
                        Your songs, playlists, albums and artists.
                    </p>
                </div>

                {/* ======================================
                    PLAYLISTS
                ====================================== */}

                <section className="mb-10">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-[4px] bg-[#10aaa9]/[0.10] text-[#10aaa9]
                                "
                            >
                                <ListMusic size={18} strokeWidth={1.7} />
                            </div>

                            <div>
                                <h2 className="text-[16px] font-semibold text-white">
                                    Your Playlists
                                </h2>

                                <p className="mt-0.5 text-[11px] text-[#68747a]">
                                    {playlists.length}{" "}
                                    {playlists.length === 1
                                        ? "playlist"
                                        : "playlists"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={openCreatePlaylist}
                            className="
                                inline-flex h-9 items-center gap-2 rounded-[4px]
                                bg-[#10aaa9] px-4 text-[11px] font-semibold
                                text-white transition hover:bg-[#12c1bf]
                            "
                        >
                            <Plus size={15} />
                            Create Playlist
                        </button>
                    </div>

                    {playlistsLoading ? (
                        <div
                            className="
                                flex min-h-[180px] items-center justify-center
                                rounded-[6px] border border-white/[0.06]
                                bg-[#11181d]
                            "
                        >
                            <div className="flex items-center gap-3 text-[#7f8a90]">
                                <Loader2
                                    size={19}
                                    className="animate-spin text-[#10aaa9]"
                                />
                                <span className="text-[12px]">
                                    Loading your playlists...
                                </span>
                            </div>
                        </div>
                    ) : playlists.length === 0 ? (
                        <div
                            className="
                                flex min-h-[220px] flex-col items-center
                                justify-center rounded-[6px] border border-dashed
                                border-white/[0.08] bg-[#11181d] px-5 text-center
                            "
                        >
                            <div
                                className="
                                    mb-4 flex h-14 w-14 items-center justify-center
                                    rounded-full bg-[#182126] text-[#68747a]
                                "
                            >
                                <ListMusic size={25} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-[15px] font-semibold text-white">
                                No playlists yet
                            </h3>

                            <p className="mt-2 max-w-[360px] text-[12px] leading-5 text-[#7f8a90]">
                                Create your first playlist and start adding
                                your favorite songs.
                            </p>

                            <button
                                type="button"
                                onClick={openCreatePlaylist}
                                className="
                                    mt-5 inline-flex h-9 items-center gap-2
                                    rounded-[4px] border border-white/[0.08]
                                    bg-[#182126] px-4 text-[11px] font-medium
                                    text-white transition hover:border-[#10aaa9]/40
                                    hover:bg-[#10aaa9]/10 hover:text-[#10aaa9]
                                "
                            >
                                <Plus size={14} />
                                Create Playlist
                            </button>
                        </div>
                    ) : (
                        <div
                            className="
                                grid grid-cols-2 gap-4 sm:grid-cols-3
                                md:grid-cols-4 xl:grid-cols-5
                            "
                        >
                            {/* CREATE CARD */}
                            <button
                                type="button"
                                onClick={openCreatePlaylist}
                                className="
                                    group flex aspect-square flex-col
                                    items-center justify-center rounded-[6px]
                                    border border-dashed border-white/[0.08]
                                    bg-[#11181d] px-4 text-center transition
                                    hover:border-[#10aaa9]/40 hover:bg-[#10aaa9]/[0.04]
                                "
                            >
                                <span
                                    className="
                                        flex h-11 w-11 items-center justify-center
                                        rounded-full bg-[#182126] text-[#10aaa9]
                                        transition group-hover:bg-[#10aaa9]/10
                                    "
                                >
                                    <Plus size={21} />
                                </span>

                                <span className="mt-3 text-[12px] font-semibold text-white">
                                    Create Playlist
                                </span>

                                <span className="mt-1 text-[10px] text-[#68747a]">
                                    Start a new collection
                                </span>
                            </button>

                            {playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/playlist/${playlist.id}`
                                        )
                                    }
                                    className="
                                        group min-w-0 text-left
                                    "
                                >
                                    <div
                                        className="
                                            relative aspect-square overflow-hidden
                                            rounded-[6px] bg-[#11181d]
                                        "
                                    >
                                        {playlist.image ? (
                                            <img
                                                src={playlist.image}
                                                alt={playlist.name || "Playlist"}
                                                className="
                                                    h-full w-full object-cover
                                                    transition duration-300
                                                    group-hover:scale-105
                                                "
                                            />
                                        ) : (
                                            <div
                                                className="
                                                    flex h-full w-full items-center
                                                    justify-center bg-[#182126]
                                                    text-[#10aaa9]
                                                "
                                            >
                                                <ListMusic size={38} />
                                            </div>
                                        )}

                                        <div
                                            className="
                                                absolute inset-0 flex items-end
                                                bg-gradient-to-t from-black/70
                                                via-black/10 to-transparent
                                            "
                                        >
                                            <div className="w-full p-3">
                                                <p className="truncate text-[10px] text-white/70">
                                                    {Array.isArray(playlist.songs)
                                                        ? playlist.songs.length
                                                        : 0}{" "}
                                                    {Array.isArray(playlist.songs) &&
                                                        playlist.songs.length === 1
                                                        ? "song"
                                                        : "songs"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="mt-3 truncate text-[13px] font-medium text-white transition-colors group-hover:text-[#10aaa9]">
                                        {playlist.name}
                                    </h3>

                                    <p className="mt-1 truncate text-[11px] text-[#7f8a90]">
                                        {playlist.description || "Your playlist"}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* ======================================
                    FAVORITE SONGS
                ====================================== */}

                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex h-9 w-9 items-center justify-center
                                    rounded-[4px] bg-[#10aaa9]/[0.10] text-[#10aaa9]
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

                    {loading ? (
                        <div
                            className="
                                flex min-h-[300px] items-center justify-center
                                rounded-[6px] border border-white/[0.06]
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
                        <div
                            className="
                                flex min-h-[320px] flex-col items-center
                                justify-center rounded-[6px] border border-white/[0.06]
                                bg-[#11181d] px-5 text-center
                            "
                        >
                            <div
                                className="
                                    mb-5 flex h-16 w-16 items-center justify-center
                                    rounded-full bg-[#182126] text-[#68747a]
                                "
                            >
                                <Music2 size={28} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-[15px] font-semibold text-white">
                                No favorite songs yet
                            </h3>

                            <p className="mt-2 max-w-[380px] text-[12px] leading-5 text-[#7f8a90]">
                                When you find a song you love, tap the heart
                                icon to save it here.
                            </p>

                            <Link
                                to="/discover"
                                className="
                                    mt-5 inline-flex h-9 items-center rounded-[4px]
                                    border border-white/[0.08] bg-[#182126] px-4
                                    text-[11px] font-medium text-white transition
                                    hover:border-[#10aaa9]/40 hover:bg-[#10aaa9]/10
                                    hover:text-[#10aaa9]
                                "
                            >
                                Discover Music
                            </Link>
                        </div>
                    ) : (
                        <div
                            className="
                                overflow-x-auto rounded-[6px] border
                                border-white/[0.06] bg-[#11181d]
                            "
                        >
                            <div
                                className="
                                    grid min-w-[700px]
                                    grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_40px]
                                    items-center gap-4 border-b border-white/[0.06]
                                    px-4 py-3
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

                            <div className="min-w-[700px]">
                                {favoriteSongs.map((song, index) => (
                                    <SongRow
                                        key={song.id}
                                        song={song}
                                        number={String(index + 1).padStart(
                                            2,
                                            "0"
                                        )}
                                        image={song.image}
                                        title={song.title}
                                        artist={song.artist}
                                        album={song.album}
                                        duration={song.duration}
                                        audio={song.audio}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* ==========================================
                CREATE PLAYLIST MODAL
            ========================================== */}

            {showCreateModal && (
                <div
                    className="
                        fixed inset-0 z-[100] flex items-center justify-center
                        bg-black/65 px-4 backdrop-blur-[2px]
                    "
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCreatePlaylist();
                        }
                    }}
                >
                    <form
                        onSubmit={handleCreatePlaylist}
                        className="
                            w-full max-w-[430px] rounded-[8px]
                            border border-white/[0.08] bg-[#11181d]
                            p-5 shadow-2xl sm:p-6
                        "
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#10aaa9]">
                                    Your Library
                                </p>

                                <h2 className="text-lg font-semibold text-white">
                                    Create Playlist
                                </h2>

                                <p className="mt-1 text-[11px] text-[#7f8a90]">
                                    Create a collection for your favorite songs.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeCreatePlaylist}
                                disabled={creatingPlaylist}
                                className="
                                    flex h-8 w-8 shrink-0 items-center justify-center
                                    rounded-full text-[#7f8a90] transition
                                    hover:bg-white/[0.05] hover:text-white
                                    disabled:opacity-50
                                "
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="playlist-name"
                                    className="mb-2 block text-[11px] font-medium text-[#b7c0c5]"
                                >
                                    Playlist name
                                </label>

                                <input
                                    id="playlist-name"
                                    type="text"
                                    value={playlistName}
                                    onChange={(event) =>
                                        setPlaylistName(event.target.value)
                                    }
                                    placeholder="e.g. Chill Vibes"
                                    maxLength={60}
                                    autoFocus
                                    className="
                                        h-11 w-full rounded-[4px] border
                                        border-white/[0.08] bg-[#0b1013]
                                        px-3 text-[12px] text-white outline-none
                                        placeholder:text-[#4f5a60]
                                        focus:border-[#10aaa9]/50
                                    "
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="playlist-description"
                                    className="mb-2 block text-[11px] font-medium text-[#b7c0c5]"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="playlist-description"
                                    value={playlistDescription}
                                    onChange={(event) =>
                                        setPlaylistDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="A short description (optional)"
                                    maxLength={150}
                                    rows={3}
                                    className="
                                        w-full resize-none rounded-[4px] border
                                        border-white/[0.08] bg-[#0b1013]
                                        px-3 py-3 text-[12px] text-white outline-none
                                        placeholder:text-[#4f5a60]
                                        focus:border-[#10aaa9]/50
                                    "
                                />
                            </div>
                        </div>

                        {playlistError && (
                            <p className="mt-3 text-[11px] text-red-400">
                                {playlistError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeCreatePlaylist}
                                disabled={creatingPlaylist}
                                className="
                                    h-10 rounded-[4px] border border-white/[0.08]
                                    bg-[#182126] px-4 text-[11px] font-medium
                                    text-[#b7c0c5] transition hover:text-white
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={creatingPlaylist}
                                className="
                                    inline-flex h-10 items-center gap-2 rounded-[4px]
                                    bg-[#10aaa9] px-5 text-[11px] font-semibold
                                    text-white transition hover:bg-[#12c1bf]
                                    disabled:cursor-wait disabled:opacity-60
                                "
                            >
                                {creatingPlaylist ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} />
                                        Create Playlist
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
