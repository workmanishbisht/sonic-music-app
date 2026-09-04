import { Play } from "lucide-react";

export default function PlaylistCard({ image, title, description }) {
    return (
        <div className="group relative h-[150px] overflow-hidden rounded-[4px] border border-white/[0.06] bg-[#11181d]">
            <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#11181d] via-[#11181d]/80 to-transparent" />
            <div className="relative z-10 flex h-full max-w-[190px] flex-col justify-center px-5">
                <h3 className="text-[16px] font-semibold text-white">{title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[#a0aaaf]">{description}</p>
            </div>
            <button type="button" className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#10aaa9] text-white opacity-0 transition group-hover:opacity-100">
                <Play size={15} fill="currentColor" />
            </button>
        </div>
    );
}