import { Heart, MoreHorizontal, Play } from "lucide-react";

export default function SongRow({ number, image, title, artist, album, duration }) {
    return (
        <div className="group grid grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_60px] items-center gap-4 border-b border-white/[0.05] px-4 py-3 transition hover:bg-white/[0.03]">
            <span className="text-[12px] text-[#68747a]">{number}</span>

            <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[4px]">
                    <img src={image} alt={title} className="h-full w-full object-cover" />
                    <button type="button" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
                        <Play size={15} fill="currentColor" />
                    </button>
                </div>

                <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white">{title}</p>
                    <p className="truncate text-[11px] text-[#7f8a90]">{artist}</p>
                </div>
            </div>

            <span className="truncate text-[12px] text-[#8b969d]">{album}</span>
            <span className="text-[12px] text-[#8b969d]">{duration}</span>

            <div className="flex items-center justify-end gap-3">
                <button type="button" className="text-[#778288] transition hover:text-[#10aaa9]">
                    <Heart size={16} />
                </button>
                <button type="button" className="text-[#778288] transition hover:text-white">
                    <MoreHorizontal size={17} />
                </button>
            </div>
        </div>
    );
}