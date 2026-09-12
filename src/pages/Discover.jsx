import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, Play, Music2, Users, Disc3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { songs } from "@/data/songs";
import { artists } from "@/data/artists";

export default function Discover() {
    const { user } = useAuth();
    const { playSong } = usePlayer();
    const navigate = useNavigate();

    const [preferences, setPreferences] = useState({
        genres: [],
        artists: [],
        languages: [],
    });

    const [search, setSearch] = useState("");
    const [loadingPreferences, setLoadingPreferences] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadPreferences = async () => {
            if (!user) {
                setPreferences({
                    genres: [],
                    artists: [],
                    languages: [],
                });
                return;
            }

            try {
                setLoadingPreferences(true);

                const snapshot = await getDocs(
                    collection(db, "users", user.uid, "preferences")
                );

                if (!cancelled && !snapshot.empty) {
                    const preferenceData = {};

                    snapshot.forEach((doc) => {
                        preferenceData[doc.id] = doc.data();
                    });

                    setPreferences({
                        genres: preferenceData.genres?.items || [],
                        artists: preferenceData.artists?.items || [],
                        languages: preferenceData.languages?.items || [],
                    });
                }
            } catch (error) {
                /*
                 * Preferences are also stored on users/{uid} by the
                 * current onboarding flow. The fallback below handles
                 * that structure as well.
                 */
                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const userSnap = await getDoc(doc(db, "users", user.uid));

                    if (!cancelled && userSnap.exists()) {
                        const data = userSnap.data();

                        setPreferences({
                            genres: Array.isArray(data.genres) ? data.genres : [],
                            artists: Array.isArray(data.artists) ? data.artists : [],
                            languages: Array.isArray(data.languages)
                                ? data.languages
                                : [],
                        });
                    }
                } catch (fallbackError) {
                    console.error(
                        "Discover preferences loading error:",
                        fallbackError
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingPreferences(false);
                }
            }
        };

        loadPreferences();

        return () => {
            cancelled = true;
        };
    }, [user]);

    const normalizedPreferences = useMemo(() => {
        const artistNames = preferences.artists.map((item) =>
            String(item).toLowerCase()
        );

        return {
            genres: preferences.genres.map((item) =>
                String(item).toLowerCase()
            ),
            artists: artistNames,
            languages: preferences.languages.map((item) =>
                String(item).toLowerCase()
            ),
        };
    }, [preferences]);

    const getSongScore = (song) => {
        let score = 0;

        const songArtistIds = Array.isArray(song.artistId)
            ? song.artistId
            : song.artistId
              ? [song.artistId]
              : [];

        const songArtistNames = String(song.artist || "")
            .split(",")
            .map((item) => item.trim().toLowerCase());

        const matchesArtist =
            songArtistIds.some((id) =>
                normalizedPreferences.artists.includes(String(id).toLowerCase())
            ) ||
            songArtistNames.some((name) =>
                normalizedPreferences.artists.includes(name)
            );

        if (matchesArtist) score += 5;

        if (
            song.genre &&
            normalizedPreferences.genres.includes(
                String(song.genre).toLowerCase()
            )
        ) {
            score += 3;
        }

        if (
            song.language &&
            normalizedPreferences.languages.includes(
                String(song.language).toLowerCase()
            )
        ) {
            score += 2;
        }

        return score;
    };

    const personalizedSongs = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = songs.filter((song) => {
            if (!query) return true;

            return [
                song.title,
                song.artist,
                song.album,
                song.genre,
                song.language,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );
        });

        const hasPreferences =
            normalizedPreferences.genres.length > 0 ||
            normalizedPreferences.artists.length > 0 ||
            normalizedPreferences.languages.length > 0;

        if (!hasPreferences) {
            return filtered.slice(0, 6);
        }

        return filtered
            .map((song, index) => ({
                song,
                score: getSongScore(song),
                index,
            }))
            .sort((a, b) => b.score - a.score || a.index - b.index)
            .slice(0, 6)
            .map((item) => item.song);
    }, [search, normalizedPreferences]);

    const trendingSongs = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return songs.slice(0, 6);

        return songs
            .filter((song) =>
                [song.title, song.artist, song.album]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(query)
                    )
            )
            .slice(0, 6);
    }, [search]);

    const discoverArtists = useMemo(() => {
        const query = search.trim().toLowerCase();

        return artists
            .filter((artist) => {
                if (!query) return true;

                return String(artist.name)
                    .toLowerCase()
                    .includes(query);
            })
            .slice(0, 7);
    }, [search]);

    const discoverAlbums = useMemo(() => {
        const albumMap = new Map();

        songs.forEach((song) => {
            if (!song.album) return;

            if (!albumMap.has(song.album)) {
                albumMap.set(song.album, {
                    id: song.album
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                    title: song.album,
                    image: song.image,
                    artist: song.artist,
                    songIds: [],
                });
            }

            albumMap.get(song.album).songIds.push(song.id);
        });

        const query = search.trim().toLowerCase();

        return Array.from(albumMap.values())
            .filter((album) => {
                if (!query) return true;

                return [album.title, album.artist].some((value) =>
                    String(value).toLowerCase().includes(query)
                );
            })
            .slice(0, 6);
    }, [search]);

    const handlePlaySong = (song) => {
        if (!song) return;
        playSong(song, songs);
    };

    const handlePlayAll = () => {
        if (personalizedSongs.length === 0) return;
        playSong(personalizedSongs[0], personalizedSongs);
    };

    const hasPreferences =
        preferences.genres.length > 0 ||
        preferences.artists.length > 0 ||
        preferences.languages.length > 0;

    return (
        <div className="py-8 sm:py-10">
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#10aaa9]">
                            Explore
                        </p>

                        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                            Discover
                        </h1>

                        <p className="mt-2 text-[13px] text-[#7f8a90]">
                            Explore trending music, artists and albums.
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-[320px]">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68747a]"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search music, artists or albums..."
                            className="h-10 w-full rounded-[4px] border border-white/[0.08] bg-[#11181d] pl-9 pr-3 text-[12px] text-white outline-none placeholder:text-[#4f5a60] focus:border-[#10aaa9]/50"
                        />
                    </div>
                </div>
            </div>

            {/* PERSONALIZED */}
            <section className="mb-10">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#10aaa9]/[0.10] text-[#10aaa9]">
                            <Sparkles size={18} strokeWidth={1.7} />
                        </div>

                        <div>
                            <h2 className="text-[16px] font-semibold text-white">
                                {hasPreferences ? "Made for you" : "Featured Music"}
                            </h2>

                            <p className="mt-0.5 text-[11px] text-[#68747a]">
                                {hasPreferences
                                    ? "Based on your music preferences"
                                    : "Popular picks from Sonic"}
                            </p>
                        </div>
                    </div>

                    {personalizedSongs.length > 0 && (
                        <button
                            type="button"
                            onClick={handlePlayAll}
                            className="inline-flex h-9 items-center gap-2 rounded-[4px] bg-[#10aaa9] px-4 text-[11px] font-semibold text-white transition hover:bg-[#12c1bf]"
                        >
                            <Play size={14} fill="currentColor" />
                            Play All
                        </button>
                    )}
                </div>

                {loadingPreferences ? (
                    <div className="flex min-h-[180px] items-center justify-center rounded-[6px] border border-white/[0.06] bg-[#11181d] text-[12px] text-[#7f8a90]">
                        Loading recommendations...
                    </div>
                ) : personalizedSongs.length === 0 ? (
                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[6px] border border-white/[0.06] bg-[#11181d] px-5 text-center">
                        <Music2 size={26} className="mb-3 text-[#68747a]" />
                        <h3 className="text-[14px] font-semibold text-white">
                            No music found
                        </h3>
                        <p className="mt-1 text-[11px] text-[#7f8a90]">
                            Try a different search.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                        {personalizedSongs.map((song) => (
                            <button
                                key={song.id}
                                type="button"
                                onClick={() => handlePlaySong(song)}
                                className="group min-w-0 text-left"
                            >
                                <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[#11181d]">
                                    <img
                                        src={song.image}
                                        alt={song.title}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/45">
                                        <span className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-[#10aaa9] text-white opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100">
                                            <Play
                                                size={17}
                                                fill="currentColor"
                                            />
                                        </span>
                                    </div>
                                </div>

                                <h3 className="mt-3 truncate text-[13px] font-medium text-white transition-colors group-hover:text-[#10aaa9]">
                                    {song.title}
                                </h3>

                                <p className="mt-1 truncate text-[11px] text-[#7f8a90]">
                                    {song.artist}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* TRENDING SONGS */}
            <section className="mb-10">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#10aaa9]/[0.10] text-[#10aaa9]">
                        <Music2 size={18} strokeWidth={1.7} />
                    </div>

                    <div>
                        <h2 className="text-[16px] font-semibold text-white">
                            Trending Songs
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[#68747a]">
                            What people are listening to
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-[6px] border border-white/[0.06] bg-[#11181d]">
                    <div className="grid min-w-[700px] grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px] items-center gap-4 border-b border-white/[0.06] px-4 py-3">
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
                            Language
                        </span>
                    </div>

                    <div className="min-w-[700px]">
                        {trendingSongs.map((song, index) => (
                            <button
                                key={song.id}
                                type="button"
                                onClick={() => handlePlaySong(song)}
                                className="grid w-full grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px] items-center gap-4 border-b border-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.03]"
                            >
                                <span className="text-[11px] text-[#68747a]">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <div className="flex min-w-0 items-center gap-3">
                                    <img
                                        src={song.image}
                                        alt={song.title}
                                        className="h-10 w-10 shrink-0 rounded-[4px] object-cover"
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-[12px] font-medium text-white">
                                            {song.title}
                                        </p>
                                        <p className="mt-1 truncate text-[10px] text-[#7f8a90]">
                                            {song.artist}
                                        </p>
                                    </div>
                                </div>

                                <span className="truncate text-[11px] text-[#7f8a90]">
                                    {song.album || "Single"}
                                </span>

                                <span className="text-[10px] text-[#68747a]">
                                    {song.language || "—"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ARTISTS */}
            <section className="mb-10">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#10aaa9]/[0.10] text-[#10aaa9]">
                        <Users size={18} strokeWidth={1.7} />
                    </div>

                    <div>
                        <h2 className="text-[16px] font-semibold text-white">
                            Popular Artists
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[#68747a]">
                            Discover artists you may like
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
                    {discoverArtists.map((artist) => (
                        <button
                            key={artist.id}
                            type="button"
                            onClick={() => navigate(`/artist/${artist.id}`)}
                            className="group min-w-0 text-center"
                        >
                            <div className="mx-auto aspect-square max-w-[150px] overflow-hidden rounded-full bg-[#11181d]">
                                <img
                                    src={artist.image}
                                    alt={artist.name}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>

                            <h3 className="mt-3 truncate text-[12px] font-medium text-white transition-colors group-hover:text-[#10aaa9]">
                                {artist.name}
                            </h3>

                            <p className="mt-1 truncate text-[10px] text-[#68747a]">
                                {artist.followers || "Artist"}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {/* ALBUMS */}
            <section>
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#10aaa9]/[0.10] text-[#10aaa9]">
                        <Disc3 size={18} strokeWidth={1.7} />
                    </div>

                    <div>
                        <h2 className="text-[16px] font-semibold text-white">
                            Explore Albums
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[#68747a]">
                            Albums from your Sonic catalog
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {discoverAlbums.map((album) => (
                        <button
                            key={album.id}
                            type="button"
                            onClick={() => navigate(`/album/${album.id}`)}
                            className="group min-w-0 text-left"
                        >
                            <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[#11181d]">
                                <img
                                    src={album.image}
                                    alt={album.title}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                                    <span className="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-[#10aaa9] text-white opacity-0 transition duration-200 group-hover:scale-100 group-hover:opacity-100">
                                        <Play size={16} fill="currentColor" />
                                    </span>
                                </div>
                            </div>

                            <h3 className="mt-3 truncate text-[13px] font-medium text-white transition-colors group-hover:text-[#10aaa9]">
                                {album.title}
                            </h3>

                            <p className="mt-1 truncate text-[11px] text-[#7f8a90]">
                                {album.artist}
                            </p>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
