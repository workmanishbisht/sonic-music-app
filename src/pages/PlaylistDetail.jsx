import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Play,
    MoreHorizontal,
    Pencil,
    Trash2,
    Music2,
    Loader2,
    X,
    Check,
} from "lucide-react";

import { usePlaylist } from "@/context/PlaylistContext";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { songs } from "@/data/songs";
import SongRow from "@/components/music/SongRow";

export default function PlaylistDetail() {
    const { playlistId } = useParams();
    const navigate = useNavigate();

    const {
        playlists,
        loading: playlistsLoading,
        renamePlaylist,
        deletePlaylist,
        removeSongFromPlaylist,
    } = usePlaylist();

    const { playSong } = usePlayer();
    const { user, loading: authLoading } = useAuth();

    const [showMenu, setShowMenu] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [removingSongId, setRemovingSongId] = useState(null);
    const [error, setError] = useState("");

    // ==========================================
    // FIND PLAYLIST
    // ==========================================

    const playlist = playlists.find(
        (item) => String(item.id) === String(playlistId)
    );

    // ==========================================
    // GET PLAYLIST SONGS
    // ==========================================

    const playlistSongIds = Array.isArray(playlist?.songs)
        ? playlist.songs
        : [];

    const playlistSongs = playlistSongIds
        .map((songId) =>
            songs.find(
                (song) =>
                    String(song.id) === String(songId)
            )
        )
        .filter(Boolean);

    // ==========================================
    // PLAY ALL
    // ==========================================

    const handlePlayAll = () => {
        if (!playlistSongs.length) {
            return;
        }

        playSong(playlistSongs[0]);
    };

    // ==========================================
    // RENAME
    // ==========================================

    const openRenameModal = () => {
        setNewName(playlist?.name || "");
        setError("");
        setShowMenu(false);
        setShowRenameModal(true);
    };

    const closeRenameModal = () => {
        if (saving) return;

        setShowRenameModal(false);
        setNewName("");
        setError("");
    };

    const handleRename = async (event) => {
        event.preventDefault();

        const trimmedName = newName.trim();

        if (!trimmedName) {
            setError("Please enter a playlist name.");
            return;
        }

        if (!playlist?.id) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            await renamePlaylist(
                playlist.id,
                trimmedName
            );

            setShowRenameModal(false);
            setNewName("");
        } catch (renameError) {
            console.error(
                "Rename playlist error:",
                renameError
            );

            setError(
                renameError?.message ||
                "Unable to rename playlist."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // DELETE
    // ==========================================

    const openDeleteModal = () => {
        setShowMenu(false);
        setError("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setShowDeleteModal(false);
        setError("");
    };

    const handleDelete = async () => {
        if (!playlist?.id) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deletePlaylist(playlist.id);

            setShowDeleteModal(false);

            navigate("/library");
        } catch (deleteError) {
            console.error(
                "Delete playlist error:",
                deleteError
            );

            setError(
                deleteError?.message ||
                "Unable to delete playlist."
            );
        } finally {
            setDeleting(false);
        }
    };

    // ==========================================
    // REMOVE SONG
    // ==========================================

    const handleRemoveSong = async (songId) => {
        if (!playlist?.id || !songId) {
            return;
        }

        try {
            setRemovingSongId(songId);

            await removeSongFromPlaylist(
                playlist.id,
                songId
            );
        } catch (removeError) {
            console.error(
                "Remove song error:",
                removeError
            );
        } finally {
            setRemovingSongId(null);
        }
    };

    // ==========================================
    // AUTH LOADING
    // ==========================================

    if (authLoading || playlistsLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-[#7f8a90]">
                    <Loader2
                        size={22}
                        className="animate-spin text-[#10aaa9]"
                    />

                    <span className="text-[12px]">
                        Loading playlist...
                    </span>
                </div>
            </div>
        );
    }

    // ==========================================
    // LOGIN REQUIRED
    // ==========================================

    if (!user) {
        return (
            <div className="py-10">
                <button
                    type="button"
                    onClick={() => navigate("/library")}
                    className="
                        mb-8 inline-flex items-center gap-2
                        text-[12px] text-[#7f8a90] transition
                        hover:text-white
                    "
                >
                    <ArrowLeft size={16} />
                    Back to Library
                </button>

                <div
                    className="
                        flex min-h-[350px] flex-col items-center
                        justify-center rounded-[6px] border
                        border-white/[0.06] bg-[#11181d]
                        px-5 text-center
                    "
                >
                    <div
                        className="
                            mb-5 flex h-16 w-16 items-center
                            justify-center rounded-full
                            bg-[#10aaa9]/10 text-[#10aaa9]
                        "
                    >
                        <Music2 size={28} />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                        Login required
                    </h2>

                    <p className="mt-2 max-w-[380px] text-[12px] leading-5 text-[#7f8a90]">
                        Please log in to access your playlists.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="
                            mt-6 h-10 rounded-[4px]
                            bg-[#10aaa9] px-5 text-[12px]
                            font-semibold text-white transition
                            hover:bg-[#12c1bf]
                        "
                    >
                        Log in
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // PLAYLIST NOT FOUND
    // ==========================================

    if (!playlist) {
        return (
            <div className="py-10">
                <button
                    type="button"
                    onClick={() => navigate("/library")}
                    className="
                        mb-8 inline-flex items-center gap-2
                        text-[12px] text-[#7f8a90] transition
                        hover:text-white
                    "
                >
                    <ArrowLeft size={16} />
                    Back to Library
                </button>

                <div
                    className="
                        flex min-h-[350px] flex-col items-center
                        justify-center rounded-[6px] border
                        border-white/[0.06] bg-[#11181d]
                        px-5 text-center
                    "
                >
                    <div
                        className="
                            mb-5 flex h-16 w-16 items-center
                            justify-center rounded-full
                            bg-[#182126] text-[#68747a]
                        "
                    >
                        <Music2 size={28} />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                        Playlist not found
                    </h2>

                    <p className="mt-2 text-[12px] text-[#7f8a90]">
                        This playlist may have been deleted.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/library")}
                        className="
                            mt-6 h-10 rounded-[4px]
                            bg-[#10aaa9] px-5 text-[12px]
                            font-semibold text-white transition
                            hover:bg-[#12c1bf]
                        "
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN
    // ==========================================

    return (
        <>
            <div className="py-8 sm:py-10">

                {/* ======================================
                    BACK BUTTON
                ====================================== */}

                <button
                    type="button"
                    onClick={() => navigate("/library")}
                    className="
                        mb-7 inline-flex items-center gap-2
                        text-[12px] text-[#7f8a90] transition
                        hover:text-white
                    "
                >
                    <ArrowLeft size={16} />
                    Back to Library
                </button>

                {/* ======================================
                    PLAYLIST HERO
                ====================================== */}

                <section
                    className="
                        relative overflow-visible rounded-[8px]
                        border border-white/[0.06]
                        bg-[#11181d]
                    "
                >
                    <div
                        className="
                            absolute inset-0 bg-gradient-to-r
                            from-[#10aaa9]/[0.08] via-transparent
                            to-transparent
                        "
                    />

                    <div
                        className="
                            relative flex flex-col gap-6 p-5
                            sm:flex-row sm:items-end sm:p-7
                        "
                    >
                        {/* COVER */}

                        <div
                            className="
                                h-[180px] w-[180px] shrink-0
                                overflow-hidden rounded-[6px]
                                bg-[#182126] shadow-2xl
                                sm:h-[210px] sm:w-[210px]
                            "
                        >
                            {playlist.image ? (
                                <img
                                    src={playlist.image}
                                    alt={
                                        playlist.name ||
                                        "Playlist"
                                    }
                                    className="
                                        h-full w-full object-cover
                                    "
                                />
                            ) : (
                                <div
                                    className="
                                        flex h-full w-full
                                        items-center justify-center
                                        text-[#10aaa9]
                                    "
                                >
                                    <Music2 size={60} />
                                </div>
                            )}
                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0 flex-1">
                            <p
                                className="
                                    mb-2 text-[10px] font-medium
                                    uppercase tracking-[0.18em]
                                    text-[#10aaa9]
                                "
                            >
                                Playlist
                            </p>

                            <h1
                                className="
                                    truncate text-2xl font-semibold
                                    text-white sm:text-4xl
                                "
                            >
                                {playlist.name}
                            </h1>

                            <p
                                className="
                                    mt-3 max-w-[600px]
                                    text-[12px] leading-5
                                    text-[#7f8a90]
                                "
                            >
                                {playlist.description ||
                                    "Your personal collection of songs."}
                            </p>

                            <p
                                className="
                                    mt-3 text-[11px]
                                    text-[#68747a]
                                "
                            >
                                {playlistSongs.length}{" "}
                                {playlistSongs.length === 1
                                    ? "song"
                                    : "songs"}
                            </p>

                            {/* ACTIONS */}

                            <div className="mt-5 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePlayAll}
                                    disabled={
                                        playlistSongs.length === 0
                                    }
                                    className="
                                        inline-flex h-10 items-center
                                        gap-2 rounded-full
                                        bg-[#10aaa9] px-5
                                        text-[11px] font-semibold
                                        text-white transition
                                        hover:bg-[#12c1bf]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <Play
                                        size={15}
                                        fill="currentColor"
                                    />
                                    Play All
                                </button>

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowMenu(
                                                (value) => !value
                                            )
                                        }
                                        aria-label="Playlist options"
                                        className="
                                            flex h-10 w-10
                                            items-center justify-center
                                            rounded-full border
                                            border-white/[0.08]
                                            bg-[#182126]
                                            text-[#8b969d]
                                            transition
                                            hover:border-white/[0.14]
                                            hover:text-white
                                        "
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>

                                    {showMenu && (
                                        <div
                                            className="
                                                absolute left-0 top-12
                                                z-30 w-[170px]
                                                overflow-hidden rounded-[6px]
                                                border border-white/[0.08]
                                                bg-[#11181d]
                                                p-1.5 shadow-2xl
                                            "
                                        >
                                            <button
                                                type="button"
                                                onClick={
                                                    openRenameModal
                                                }
                                                className="
                                                    flex w-full
                                                    items-center gap-3
                                                    rounded-[4px] px-3
                                                    py-2.5 text-left
                                                    text-[12px] text-white
                                                    transition
                                                    hover:bg-white/[0.05]
                                                "
                                            >
                                                <Pencil
                                                    size={15}
                                                    className="text-[#7f8a90]"
                                                />
                                                Rename
                                            </button>

                                            <button
                                                type="button"
                                                onClick={
                                                    openDeleteModal
                                                }
                                                className="
                                                    flex w-full
                                                    items-center gap-3
                                                    rounded-[4px] px-3
                                                    py-2.5 text-left
                                                    text-[12px]
                                                    text-red-400
                                                    transition
                                                    hover:bg-red-400/[0.06]
                                                "
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ======================================
                    SONGS
                ====================================== */}

                <section className="mt-8">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-[16px] font-semibold text-white">
                                Songs
                            </h2>

                            <p className="mt-1 text-[11px] text-[#68747a]">
                                {playlistSongs.length}{" "}
                                {playlistSongs.length === 1
                                    ? "song"
                                    : "songs"}{" "}
                                in this playlist
                            </p>
                        </div>
                    </div>

                    {playlistSongs.length === 0 ? (
                        <div
                            className="
                                flex min-h-[280px]
                                flex-col items-center
                                justify-center rounded-[6px]
                                border border-dashed
                                border-white/[0.08]
                                bg-[#11181d] px-5
                                text-center
                            "
                        >
                            <div
                                className="
                                    mb-4 flex h-14 w-14
                                    items-center justify-center
                                    rounded-full bg-[#182126]
                                    text-[#68747a]
                                "
                            >
                                <Music2
                                    size={26}
                                    strokeWidth={1.5}
                                />
                            </div>

                            <h3 className="text-[15px] font-semibold text-white">
                                This playlist is empty
                            </h3>

                            <p
                                className="
                                    mt-2 max-w-[360px]
                                    text-[12px] leading-5
                                    text-[#7f8a90]
                                "
                            >
                                Use the three-dot menu on a song
                                to add it to this playlist.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/discover")
                                }
                                className="
                                    mt-5 h-9 rounded-[4px]
                                    border border-white/[0.08]
                                    bg-[#182126] px-4
                                    text-[11px] font-medium
                                    text-white transition
                                    hover:border-[#10aaa9]/40
                                    hover:bg-[#10aaa9]/10
                                    hover:text-[#10aaa9]
                                "
                            >
                                Discover Music
                            </button>
                        </div>
                    ) : (
                        <div
                            className="
                                overflow-x-auto rounded-[6px]
                                border border-white/[0.06]
                                bg-[#11181d]
                            "
                        >
                            {/* TABLE HEADER */}

                            <div
                                className="
                                    grid min-w-[700px]
                                    grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_40px]
                                    items-center gap-4
                                    border-b border-white/[0.06]
                                    px-4 py-3
                                "
                            >
                                <span
                                    className="
                                        text-[10px] font-medium
                                        uppercase tracking-wider
                                        text-[#68747a]
                                    "
                                >
                                    #
                                </span>

                                <span
                                    className="
                                        text-[10px] font-medium
                                        uppercase tracking-wider
                                        text-[#68747a]
                                    "
                                >
                                    Song
                                </span>

                                <span
                                    className="
                                        text-[10px] font-medium
                                        uppercase tracking-wider
                                        text-[#68747a]
                                    "
                                >
                                    Album
                                </span>

                                <span
                                    className="
                                        text-[10px] font-medium
                                        uppercase tracking-wider
                                        text-[#68747a]
                                    "
                                >
                                    Duration
                                </span>

                                <span />
                            </div>

                            {/* SONG ROWS */}

                            <div className="min-w-[700px]">
                                {playlistSongs.map(
                                    (song, index) => (
                                        <div
                                            key={song.id}
                                            className="group relative"
                                        >
                                            <SongRow
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

                                            {/* REMOVE BUTTON */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveSong(
                                                        song.id
                                                    )
                                                }
                                                disabled={
                                                    removingSongId ===
                                                    song.id
                                                }
                                                title="Remove from playlist"
                                                aria-label={`Remove ${song.title} from playlist`}
                                                className="
                                                    absolute right-[58px]
                                                    top-1/2 z-10
                                                    flex h-7 w-7
                                                    -translate-y-1/2
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-[#11181d]
                                                    text-[#68747a]
                                                    opacity-0
                                                    transition-all
                                                    duration-200
                                                    group-hover:opacity-100
                                                    hover:bg-red-400/10
                                                    hover:text-red-400
                                                    disabled:cursor-wait
                                                    disabled:opacity-60
                                                "
                                            >
                                                {removingSongId ===
                                                    song.id ? (
                                                    <Loader2
                                                        size={14}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <X size={15} />
                                                )}
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* ==========================================
                RENAME MODAL
            ========================================== */}

            {showRenameModal && (
                <div
                    className="
                        fixed inset-0 z-[100]
                        flex items-center justify-center
                        bg-black/65 px-4
                        backdrop-blur-[2px]
                    "
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeRenameModal();
                        }
                    }}
                >
                    <form
                        onSubmit={handleRename}
                        className="
                            w-full max-w-[400px]
                            rounded-[8px]
                            border border-white/[0.08]
                            bg-[#11181d]
                            p-5 shadow-2xl sm:p-6
                        "
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Rename Playlist
                                </h2>

                                <p className="mt-1 text-[11px] text-[#7f8a90]">
                                    Choose a new name for your playlist.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRenameModal}
                                disabled={saving}
                                className="
                                    flex h-8 w-8 items-center
                                    justify-center rounded-full
                                    text-[#7f8a90] transition
                                    hover:bg-white/[0.05]
                                    hover:text-white
                                "
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={newName}
                            onChange={(event) =>
                                setNewName(
                                    event.target.value
                                )
                            }
                            placeholder="Playlist name"
                            maxLength={60}
                            autoFocus
                            className="
                                h-11 w-full rounded-[4px]
                                border border-white/[0.08]
                                bg-[#0b1013] px-3
                                text-[12px] text-white
                                outline-none
                                placeholder:text-[#4f5a60]
                                focus:border-[#10aaa9]/50
                            "
                        />

                        {error && (
                            <p className="mt-3 text-[11px] text-red-400">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeRenameModal}
                                disabled={saving}
                                className="
                                    h-10 rounded-[4px]
                                    border border-white/[0.08]
                                    bg-[#182126] px-4
                                    text-[11px] font-medium
                                    text-[#b7c0c5]
                                    transition hover:text-white
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="
                                    inline-flex h-10
                                    items-center gap-2
                                    rounded-[4px]
                                    bg-[#10aaa9] px-5
                                    text-[11px] font-semibold
                                    text-white transition
                                    hover:bg-[#12c1bf]
                                    disabled:cursor-wait
                                    disabled:opacity-60
                                "
                            >
                                {saving ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} />
                                        Save
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ==========================================
                DELETE MODAL
            ========================================== */}

            {showDeleteModal && (
                <div
                    className="
                        fixed inset-0 z-[100]
                        flex items-center justify-center
                        bg-black/65 px-4
                        backdrop-blur-[2px]
                    "
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDeleteModal();
                        }
                    }}
                >
                    <div
                        className="
                            w-full max-w-[400px]
                            rounded-[8px]
                            border border-white/[0.08]
                            bg-[#11181d]
                            p-5 shadow-2xl sm:p-6
                        "
                    >
                        <div
                            className="
                                mb-5 flex h-11 w-11
                                items-center justify-center
                                rounded-full bg-red-400/10
                                text-red-400
                            "
                        >
                            <Trash2 size={20} />
                        </div>

                        <h2 className="text-lg font-semibold text-white">
                            Delete playlist?
                        </h2>

                        <p className="mt-2 text-[12px] leading-5 text-[#7f8a90]">
                            This will permanently delete{" "}
                            <span className="font-medium text-white">
                                {playlist.name}
                            </span>
                            . This action cannot be undone.
                        </p>

                        {error && (
                            <p className="mt-3 text-[11px] text-red-400">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="
                                    h-10 rounded-[4px]
                                    border border-white/[0.08]
                                    bg-[#182126] px-4
                                    text-[11px] font-medium
                                    text-[#b7c0c5]
                                    transition hover:text-white
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="
                                    inline-flex h-10
                                    items-center gap-2
                                    rounded-[4px]
                                    bg-red-500 px-5
                                    text-[11px] font-semibold
                                    text-white transition
                                    hover:bg-red-500/90
                                    disabled:cursor-wait
                                    disabled:opacity-60
                                "
                            >
                                {deleting ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}