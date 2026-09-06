import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import MusicPlayer from "../player/MusicPlayer";

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#070c0f] text-white">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] lg:hidden"
                />
            )}

            {/* Sidebar */}
            <Sidebar
                mobileOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-[253px]">

                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

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
