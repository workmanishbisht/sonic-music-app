import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const PlaylistContext = createContext(null);

export function PlaylistProvider({ children }) {
    const { user, loading: authLoading } = useAuth();

    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // FIRESTORE PLAYLIST LISTENER
    // ==========================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setPlaylists([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const playlistsRef = collection(
            db,
            "users",
            user.uid,
            "playlists"
        );

        const unsubscribe = onSnapshot(
            playlistsRef,
            (snapshot) => {
                const userPlaylists = snapshot.docs.map(
                    (playlistDoc) => ({
                        id: playlistDoc.id,
                        ...playlistDoc.data(),
                    })
                );

                userPlaylists.sort((a, b) => {
                    const aTime =
                        a.createdAt?.seconds || 0;

                    const bTime =
                        b.createdAt?.seconds || 0;

                    return bTime - aTime;
                });

                setPlaylists(userPlaylists);
                setLoading(false);
            },
            (error) => {
                console.error(
                    "Playlists loading error:",
                    error
                );

                setPlaylists([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, authLoading]);

    // ==========================================
    // CREATE PLAYLIST
    // ==========================================

    const createPlaylist = async ({
        name,
        description = "",
        image = "/src/assets/images/playlist-favorite.png",
        songId = null,
    }) => {
        if (!user) {
            throw new Error(
                "You must be logged in to create a playlist."
            );
        }

        const trimmedName = name?.trim();

        if (!trimmedName) {
            throw new Error(
                "Please enter a playlist name."
            );
        }

        const playlistsRef = collection(
            db,
            "users",
            user.uid,
            "playlists"
        );

        const playlistData = {
            name: trimmedName,
            description: description?.trim() || "",
            image,
            songs:
                songId !== null &&
                songId !== undefined &&
                songId !== ""
                    ? [songId]
                    : [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const playlistDoc = await addDoc(
            playlistsRef,
            playlistData
        );

        return {
            id: playlistDoc.id,
            ...playlistData,
        };
    };

    // ==========================================
    // DELETE PLAYLIST
    // ==========================================

    const deletePlaylist = async (playlistId) => {
        if (!user || !playlistId) {
            return;
        }

        const playlistRef = doc(
            db,
            "users",
            user.uid,
            "playlists",
            playlistId
        );

        await deleteDoc(playlistRef);
    };

    // ==========================================
    // RENAME PLAYLIST
    // ==========================================

    const renamePlaylist = async (
        playlistId,
        newName
    ) => {
        if (!user || !playlistId) {
            return;
        }

        const trimmedName = newName?.trim();

        if (!trimmedName) {
            throw new Error(
                "Please enter a playlist name."
            );
        }

        const playlistRef = doc(
            db,
            "users",
            user.uid,
            "playlists",
            playlistId
        );

        await updateDoc(playlistRef, {
            name: trimmedName,
            updatedAt: serverTimestamp(),
        });
    };

    // ==========================================
    // UPDATE PLAYLIST
    // ==========================================

    const updatePlaylist = async (
        playlistId,
        data
    ) => {
        if (!user || !playlistId) {
            return;
        }

        const playlistRef = doc(
            db,
            "users",
            user.uid,
            "playlists",
            playlistId
        );

        await updateDoc(playlistRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    };

    // ==========================================
    // ADD SONG TO PLAYLIST
    // ==========================================

    const addSongToPlaylist = async (
        playlistId,
        songId
    ) => {
        if (
            !user ||
            !playlistId ||
            songId === null ||
            songId === undefined ||
            songId === ""
        ) {
            return;
        }

        const playlist = playlists.find(
            (item) => item.id === playlistId
        );

        if (!playlist) {
            throw new Error(
                "Playlist not found."
            );
        }

        const playlistRef = doc(
            db,
            "users",
            user.uid,
            "playlists",
            playlistId
        );

        await updateDoc(playlistRef, {
            songs: arrayUnion(songId),
            updatedAt: serverTimestamp(),
        });
    };

    // ==========================================
    // REMOVE SONG FROM PLAYLIST
    // ==========================================

    const removeSongFromPlaylist = async (
        playlistId,
        songId
    ) => {
        if (
            !user ||
            !playlistId ||
            songId === null ||
            songId === undefined ||
            songId === ""
        ) {
            return;
        }

        const playlist = playlists.find(
            (item) => item.id === playlistId
        );

        if (!playlist) {
            throw new Error(
                "Playlist not found."
            );
        }

        const playlistRef = doc(
            db,
            "users",
            user.uid,
            "playlists",
            playlistId
        );

        await updateDoc(playlistRef, {
            songs: arrayRemove(songId),
            updatedAt: serverTimestamp(),
        });
    };

    // ==========================================
    // CHECK SONG IN PLAYLIST
    // ==========================================

    const isSongInPlaylist = (
        playlistId,
        songId
    ) => {
        const playlist = playlists.find(
            (item) => item.id === playlistId
        );

        if (!playlist) {
            return false;
        }

        const playlistSongs = Array.isArray(
            playlist.songs
        )
            ? playlist.songs
            : [];

        return playlistSongs.some(
            (id) =>
                String(id) === String(songId)
        );
    };

    // ==========================================
    // GET PLAYLIST SONG COUNT
    // ==========================================

    const getPlaylistSongCount = (
        playlist
    ) => {
        if (!playlist) {
            return 0;
        }

        return Array.isArray(playlist.songs)
            ? playlist.songs.length
            : 0;
    };

    // ==========================================
    // CONTEXT VALUE
    // ==========================================

    const value = {
        playlists,
        loading,

        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        updatePlaylist,

        addSongToPlaylist,
        removeSongFromPlaylist,

        isSongInPlaylist,
        getPlaylistSongCount,
    };

    return (
        <PlaylistContext.Provider value={value}>
            {children}
        </PlaylistContext.Provider>
    );
}

// ==========================================
// USE PLAYLIST HOOK
// ==========================================

export function usePlaylist() {
    const context =
        useContext(PlaylistContext);

    if (!context) {
        throw new Error(
            "usePlaylist must be used inside PlaylistProvider"
        );
    }

    return context;
}
