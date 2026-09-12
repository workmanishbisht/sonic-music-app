import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { PlaylistProvider } from "./context/PlaylistContext";
import { PlayerProvider } from "./context/PlayerContext";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Radio from "./pages/Radio";
import Podcasts from "./pages/Podcasts";

import Albums from "./pages/Albums";
import Artists from "./pages/Artists";
import Songs from "./pages/Songs";

import AlbumDetail from "./pages/AlbumDetail";
import ArtistDetail from "./pages/ArtistDetail";
import PlaylistDetail from "./pages/PlaylistDetail";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <PlaylistProvider>
                    <PlayerProvider>
                        <Routes>

                            {/* =================================
                                MAIN APP
                            ================================= */}

                            <Route element={<MainLayout />}>

                                {/* =================================
                                    PUBLIC PAGES
                                ================================= */}

                                {/* Home */}
                                <Route
                                    path="/"
                                    element={<Home />}
                                />

                                {/* Discover */}
                                <Route
                                    path="/discover"
                                    element={<Discover />}
                                />

                                {/* Radio */}
                                <Route
                                    path="/radio"
                                    element={<Radio />}
                                />

                                {/* Podcasts */}
                                <Route
                                    path="/podcasts"
                                    element={<Podcasts />}
                                />

                                {/* Premium */}
                                <Route
                                    path="/premium"
                                    element={<Premium />}
                                />

                                {/* Albums */}
                                <Route
                                    path="/albums"
                                    element={<Albums />}
                                />

                                {/* Artists */}
                                <Route
                                    path="/artists"
                                    element={<Artists />}
                                />

                                {/* Songs */}
                                <Route
                                    path="/songs"
                                    element={<Songs />}
                                />

                                {/* Album Detail */}
                                <Route
                                    path="/album/:albumId"
                                    element={<AlbumDetail />}
                                />

                                {/* Artist Detail */}
                                <Route
                                    path="/artist/:artistId"
                                    element={<ArtistDetail />}
                                />

                                {/* =================================
                                    PROTECTED PAGES
                                ================================= */}

                                {/* Library */}
                                <Route
                                    path="/library"
                                    element={
                                        <ProtectedRoute>
                                            <Library />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Playlist Detail */}
                                <Route
                                    path="/playlist/:playlistId"
                                    element={
                                        <ProtectedRoute>
                                            <PlaylistDetail />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Profile */}
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Settings */}
                                <Route
                                    path="/settings"
                                    element={
                                        <ProtectedRoute>
                                            <Settings />
                                        </ProtectedRoute>
                                    }
                                />

                            </Route>

                            {/* =================================
                                ONBOARDING
                            ================================= */}

                            <Route
                                path="/onboarding"
                                element={<Onboarding />}
                            />

                            {/* =================================
                                AUTH PAGES
                            ================================= */}

                            {/* Login */}
                            <Route
                                path="/login"
                                element={<Login />}
                            />

                            {/* Signup */}
                            <Route
                                path="/signup"
                                element={<Signup />}
                            />

                        </Routes>
                    </PlayerProvider>
                </PlaylistProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}