import { BrowserRouter, Routes, Route } from "react-router-dom";

import { PlayerProvider } from "./context/PlayerContext";
import MainLayout from "./components/layout/MainLayout";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Radio from "./pages/Radio";
import Podcasts from "./pages/Podcasts";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/discover"
              element={<Discover />}
            />
            <Route
              path="/library"
              element={<Library />}
            />
            <Route
              path="/radio"
              element={<Radio />}
            />
            <Route
              path="/podcasts"
              element={<Podcasts />}
            />
          </Route>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}