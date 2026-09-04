import { Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export default function SongCard({ song, ...props }) {
  // Supports both:
  // <SongCard song={song} />
  // and
  // <SongCard {...song} />
  const currentSong = song || props;

  const { playSong } = usePlayer();

  if (!currentSong?.image) {
    return null;
  }

  return (
    <div className="group min-w-0">
      <div className="relative overflow-hidden rounded-[4px] bg-[#11181d]">
        <img
          src={currentSong.image}
          alt={currentSong.title || "Song"}
          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />

        <button
          type="button"
          onClick={() => playSong(currentSong)}
          className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#10aaa9] text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#12c1bf]"
        >
          <Play
            size={17}
            fill="currentColor"
            className="ml-0.5"
          />
        </button>
      </div>

      <div className="mt-3">
        <p className="truncate text-[13px] font-semibold text-white">
          {currentSong.title}
        </p>

        <p className="mt-1 truncate text-[11px] text-[#7f8a90]">
          {currentSong.artist}
        </p>
      </div>
    </div>
  );
}