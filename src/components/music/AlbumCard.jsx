import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlbumCard({
    album,
    image,
    title,
    artist,
}) {
    const navigate = useNavigate();

    const currentAlbum = album || {
        id: title,
        title,
        artist,
        image,
    };

    const handleAlbumClick = () => {
        if (!currentAlbum?.id) return;

        navigate(`/album/${currentAlbum.id}`);
    };

    const handlePlayClick = (event) => {
        event.stopPropagation();

        if (!currentAlbum?.id) return;

        navigate(`/album/${currentAlbum.id}`);
    };

    return (
        <div
            className="group min-w-0 cursor-pointer"
            onClick={handleAlbumClick}
        >
            {/* ==========================================
                ALBUM COVER
            ========================================== */}

            <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#11181d]">
                {currentAlbum.image ? (
                    <img
                        src={currentAlbum.image}
                        alt={currentAlbum.title || "Album"}
                        className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-300
                            group-hover:scale-105
                        "
                    />
                ) : (
                    <div className="h-full w-full bg-[#182126]" />
                )}

                {/* ======================================
                    PLAY / OPEN ALBUM
                ====================================== */}

                <button
                    type="button"
                    onClick={handlePlayClick}
                    aria-label={`Open ${currentAlbum.title}`}
                    className="
                        absolute
                        bottom-3
                        right-3
                        flex
                        h-10
                        w-10
                        translate-y-2
                        items-center
                        justify-center
                        rounded-full
                        bg-[#10aaa9]
                        text-white
                        opacity-0
                        shadow-lg
                        transition-all
                        duration-200
                        group-hover:translate-y-0
                        group-hover:opacity-100
                        hover:bg-[#12c1bf]
                    "
                >
                    <Play
                        size={17}
                        fill="currentColor"
                        className="ml-0.5"
                    />
                </button>
            </div>

            {/* ==========================================
                ALBUM INFO
            ========================================== */}

            <h3
                className="
                    mt-3
                    truncate
                    text-[14px]
                    font-medium
                    text-white
                    transition-colors
                    group-hover:text-[#10aaa9]
                "
            >
                {currentAlbum.title}
            </h3>

            <p className="mt-1 truncate text-[12px] text-[#7f8a90]">
                {currentAlbum.artist}
            </p>
        </div>
    );
}