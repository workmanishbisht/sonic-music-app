import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import MusicPlayer from "../player/MusicPlayer";

export default function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-[#070c0f] text-white">

            {/* Sidebar - Desktop only */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-[253px]">

                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-[105px] sm:px-6 lg:px-8 lg:pb-[110px]">
                    <Outlet />
                </main>

                {/* Music Player */}
                <MusicPlayer />

            </div>

        </div>
    );
}