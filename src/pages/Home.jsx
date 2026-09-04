import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

import SongCard from "@/components/music/SongCard";
import PlaylistCard from "@/components/music/PlaylistCard";
import SongRow from "@/components/music/SongRow";
import { songs } from "@/data/songs";
import { playlists } from "@/data/playlists";

export default function Home() {
  const recentlyPlayed = songs.slice(0, 5);
  const popularSongs = songs.slice(0, 6);

  return (
    <div className="space-y-8 py-5 sm:space-y-9 sm:py-6">

      {/* ==========================================
          HERO
      ========================================== */}
      <section className="relative min-h-[360px] overflow-hidden rounded-[4px] border border-white/[0.06] bg-[#0d1b1d] sm:min-h-[340px]">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(16,170,169,0.25),transparent_38%)]" />

        <div className="absolute right-0 top-0 h-full w-[55%] bg-[radial-gradient(circle_at_70%_50%,rgba(16,170,169,0.18),transparent_55%)]" />

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-[360px] items-center px-5 py-10 sm:min-h-[340px] sm:px-9 sm:py-0">

          <div className="max-w-[570px]">

            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#10aaa9] sm:mb-4 sm:text-[11px]">
              Good evening
            </p>

            <h1 className="max-w-[330px] text-[32px] font-semibold leading-[1.08] tracking-[-1px] text-white sm:max-w-none sm:text-[42px] sm:leading-[1.12] sm:tracking-[-1.5px]">
              Feel the melody.
              <br />
              Live the moment.
            </h1>

            <p className="mt-4 max-w-[380px] text-[13px] leading-6 text-[#9aa5aa] sm:mt-5 sm:max-w-[440px] sm:text-[14px]">
              Discover new music, create your playlists and enjoy timeless
              classics.
            </p>

            <div className="mt-6 flex items-center gap-2.5 sm:mt-7 sm:gap-3">

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-[4px] bg-[#10aaa9] px-4 text-[12px] font-semibold text-white transition hover:bg-[#12c1bf] sm:h-11 sm:px-6 sm:text-[13px]"
              >
                <Play size={15} fill="currentColor" />
                Play Now
              </button>

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-[4px] border border-white/20 px-4 text-[12px] font-medium text-white transition hover:bg-white/[0.05] sm:h-11 sm:px-6 sm:text-[13px]"
              >
                Explore
                <ArrowRight size={15} />
              </button>

            </div>
          </div>
        </div>

        {/* ==========================================
            DESKTOP DECORATION
        ========================================== */}
        <div className="absolute right-[7%] top-1/2 hidden h-[300px] w-[300px] -translate-y-1/2 items-center justify-center rounded-full border border-[#10aaa9]/20 md:flex">

          <div className="flex h-[240px] w-[240px] items-center justify-center rounded-full border border-[#10aaa9]/20">

            <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-[#10aaa9]/10 shadow-[0_0_100px_rgba(16,170,169,0.2)]">

              <div className="flex items-end gap-1">
                <span className="h-8 w-1 rounded-full bg-[#10aaa9]" />
                <span className="h-16 w-1 rounded-full bg-[#10aaa9]" />
                <span className="h-11 w-1 rounded-full bg-[#10aaa9]" />
                <span className="h-20 w-1 rounded-full bg-[#10aaa9]" />
                <span className="h-12 w-1 rounded-full bg-[#10aaa9]" />
                <span className="h-7 w-1 rounded-full bg-[#10aaa9]" />
              </div>

            </div>
          </div>
        </div>

        {/* Mobile decoration */}
        <div className="absolute -right-16 -top-10 flex h-[180px] w-[180px] items-center justify-center rounded-full border border-[#10aaa9]/10 md:hidden">
          <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[#10aaa9]/5">
            <div className="flex items-end gap-1 opacity-50">
              <span className="h-5 w-1 rounded-full bg-[#10aaa9]" />
              <span className="h-10 w-1 rounded-full bg-[#10aaa9]" />
              <span className="h-7 w-1 rounded-full bg-[#10aaa9]" />
              <span className="h-12 w-1 rounded-full bg-[#10aaa9]" />
              <span className="h-8 w-1 rounded-full bg-[#10aaa9]" />
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-6 sm:right-6">

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/70 transition hover:bg-black/50 hover:text-white"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/70 transition hover:bg-black/50 hover:text-white"
          >
            <ChevronRight size={17} />
          </button>

        </div>
      </section>

      {/* ==========================================
          RECENTLY PLAYED
      ========================================== */}
      <section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
            Recently Played
          </h2>

          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#10aaa9] transition hover:text-[#14c8c5] sm:text-[12px]"
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile horizontal scroll / Desktop grid */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
          {recentlyPlayed.map((song) => (
            <div
              key={song.id}
              className="w-[150px] shrink-0 sm:w-auto"
            >
              <SongCard
                song={song}
              />
            </div>
          ))}
        </div>

      </section>

      {/* ==========================================
          MADE FOR YOU
      ========================================== */}
      <section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
            Made for you
          </h2>

          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#10aaa9] transition hover:text-[#14c8c5] sm:text-[12px]"
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {playlists.slice(0, 4).map((playlist) => (
            <div
              key={playlist.id}
              className="w-[190px] shrink-0 sm:w-auto"
            >
              <PlaylistCard
                image={playlist.image}
                title={playlist.title}
                description={`${playlist.songs} • Curated for you`}
              />
            </div>
          ))}
        </div>

      </section>

      {/* ==========================================
          POPULAR SONGS
      ========================================== */}
      <section className="overflow-hidden rounded-[4px] border border-white/[0.06] bg-[#0d1418]">

        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4 sm:px-5">

          <h2 className="text-[17px] font-semibold text-white sm:text-[18px]">
            Popular Songs
          </h2>

          <button
            type="button"
            className="flex items-center gap-1 text-[11px] font-medium text-[#10aaa9] transition hover:text-[#14c8c5] sm:text-[12px]"
          >
            View all
            <ArrowRight size={14} />
          </button>

        </div>

        {/* Desktop table header */}
        <div className="hidden grid-cols-[40px_minmax(220px,1.5fr)_1fr_90px_60px] gap-4 border-b border-white/[0.06] px-4 py-3 text-[10px] uppercase tracking-wider text-[#667177] md:grid">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span>Duration</span>
          <span />
        </div>

        {/* Rows */}
        <div className="w-full">
          {popularSongs.map((song, index) => (
            <SongRow
              key={song.id}
              number={String(index + 1).padStart(2, "0")}
              image={song.image}
              title={song.title}
              artist={song.artist}
              album={song.album}
              duration={song.duration}
            />
          ))}
        </div>

      </section>

    </div>
  );
}