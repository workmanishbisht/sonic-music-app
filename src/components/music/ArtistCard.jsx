import { Play } from "lucide-react";

export default function ArtistCard({ image, name, followers }) {
    return (
        <div className="group text-center">
            <div className="relative mx-auto aspect-square max-w-[150px] overflow-hidden rounded-full bg-[#11181d]">
                <img src={image} alt={name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <button type="button" className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#10aaa9] text-white opacity-0 transition group-hover:opacity-100">
                    <Play size={15} fill="currentColor" />
                </button>
            </div>
            <h3 className="mt-3 truncate text-[14px] font-medium text-white">{name}</h3>
            <p className="mt-1 text-[11px] text-[#7f8a90]">{followers}</p>
        </div>
    );
}