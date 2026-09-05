import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { PlaylistProvider } from "./context/PlaylistContext";
import { PlayerProvider } from "./context/PlayerContext";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Radio from "./pages/Radio";
import Podcasts from "./pages/Podcasts";
import AlbumDetail from "./pages/AlbumDetail";
import ArtistDetail from "./pages/ArtistDetail";
import Premium from "./pages/Premium";

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

                                {/* Library */}
                                <Route
                                    path="/library"
                                    element={<Library />}
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

                                {/* Premium */}
                                <Route
                                    path="/premium"
                                    element={<Premium />}
                                />

                            </Route>

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