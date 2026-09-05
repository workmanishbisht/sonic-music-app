import { useNavigate } from "react-router-dom";

export default function ArtistCard({
    artist,
    image,
    name,
    followers,
}) {
    const navigate = useNavigate();

    const currentArtist = artist || {
        id: name,
        name,
        followers,
        image,
    };

    const handleArtistClick = () => {
        if (!currentArtist?.id) return;

        navigate(`/artist/${currentArtist.id}`);
    };

    return (
        <div
            onClick={handleArtistClick}
            className="group min-w-0 cursor-pointer"
        >
            {/* Artist Image */}

            <div
                className="
                    relative
                    mx-auto
                    aspect-square
                    w-full
                    max-w-[180px]
                    overflow-hidden
                    rounded-full
                    bg-[#11181d]
                "
            >
                {currentArtist.image ? (
                    <img
                        src={currentArtist.image}
                        alt={currentArtist.name || "Artist"}
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

                {/* Hover Overlay */}

                <div
                    className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        rounded-full
                        bg-black/35
                        opacity-0
                        transition
                        duration-200
                        group-hover:opacity-100
                    "
                >
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-[#10aaa9]
                            text-white
                            shadow-lg
                        "
                    >
                        <span className="text-[16px]">▶</span>
                    </div>
                </div>
            </div>

            {/* Artist Info */}

            <div className="mt-3 text-center">
                <h3
                    className="
                        truncate
                        text-[13px]
                        font-medium
                        text-white
                        transition-colors
                        group-hover:text-[#10aaa9]
                    "
                >
                    {currentArtist.name}
                </h3>

                {currentArtist.followers && (
                    <p className="mt-1 truncate text-[11px] text-[#7f8a90]">
                        {currentArtist.followers}
                    </p>
                )}
            </div>
        </div>
    );
}