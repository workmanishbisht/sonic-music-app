import { Play } from "lucide-react";

export default function AlbumCard({ image, title, artist }) {
    return (
        <div className="group min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#11181d]">
                <img src={image} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <button type="button" className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#10aaa9] text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    <Play size={17} fill="currentColor" />
                </button>
            </div>
            <h3 className="mt-3 truncate text-[14px] font-medium text-white">{title}</h3>
            <p className="mt-1 truncate text-[12px] text-[#7f8a90]">{artist}</p>
        </div>
    );
}