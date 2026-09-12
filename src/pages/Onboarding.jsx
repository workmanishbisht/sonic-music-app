import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Headphones,
    Music2,
    Search,
    Sparkles,
} from "lucide-react";

import { artists } from "@/data/artists";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const genres = [
    "Pop",
    "Rock",
    "Hip Hop",
    "R&B",
    "Electronic",
    "Bollywood",
    "Indie",
    "Classical",
    "Jazz",
    "Lo-fi",
    "Punjabi",
    "Romantic",
];



const languages = [
    "Hindi",
    "English",
    "Punjabi",
    "Tamil",
    "Telugu",
    "Bengali",
    "Marathi",
    "Other",
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [artistSearch, setArtistSearch] = useState("");
    const [isFinishing, setIsFinishing] = useState(false);

    const toggleGenre = (genre) => {
        setSelectedGenres((prev) =>
            prev.includes(genre)
                ? prev.filter((item) => item !== genre)
                : [...prev, genre]
        );
    };

    const toggleArtist = (artistId) => {
        setSelectedArtists((prev) =>
            prev.includes(artistId)
                ? prev.filter((id) => id !== artistId)
                : [...prev, artistId]
        );
    };

    const nextStep = () => {
        if (step < 3) {
            setStep((prev) => prev + 1);
        } else {
            finishSetup();
        }
    };

    const previousStep = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
        }
    };

    const finishSetup = async () => {
        if (isFinishing || !user) return;

        setIsFinishing(true);

        const startTime = Date.now();

        try {
            const userRef = doc(db, "users", user.uid);

            await setDoc(
                userRef,
                {
                    uid: user.uid,
                    name:
                        user.displayName ||
                        user.email?.split("@")[0] ||
                        "Sonic User",
                    email: user.email || "",
                    photoURL: user.photoURL || "",
                    genres: selectedGenres,
                    artists: selectedArtists,
                    languages: selectedLanguages,
                    setupCompleted: true,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            // Keep the setup loader visible for a minimum of 3 seconds.
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, 3000 - elapsed);

            await new Promise((resolve) =>
                setTimeout(resolve, remainingTime)
            );

            // Keep localStorage for compatibility with the existing app.
            localStorage.setItem("sonicSetupCompleted", "true");
            localStorage.setItem(
                "sonicPreferences",
                JSON.stringify({
                    genres: selectedGenres,
                    artists: selectedArtists,
                    languages: selectedLanguages,
                })
            );

            navigate("/", { replace: true });
        } catch (error) {
            console.error("Failed to save onboarding data:", error);
            setIsFinishing(false);

            alert(
                "We couldn't save your preferences. Please check your internet connection and try again."
            );
        }
    };

    const filteredArtists = artists.filter((artist) =>
        artist.name.toLowerCase().includes(artistSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#070c0f] text-white">
            {/* Header */}
            <header className="flex h-[76px] items-center justify-between border-b border-white/[0.06] px-5 sm:px-8 lg:px-12">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2"
                >
                    <img
                        src="/sonic.png"
                        alt="Sonic"
                        className="h-[34px] w-auto object-contain"
                    />
                </button>

                <div className="text-[12px] text-[#68747a]">
                    Step {step} of 3
                </div>
            </header>

            {/* Progress */}
            <div className="mx-auto mt-6 flex max-w-[620px] gap-2 px-5">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${item <= step
                            ? "bg-[#10aaa9]"
                            : "bg-white/[0.08]"
                            }`}
                    />
                ))}
            </div>

            {/* Main */}
            <main className="mx-auto flex min-h-[calc(100vh-125px)] w-full max-w-[720px] flex-col px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
                {/* Step 1 */}
                {step === 1 && (
                    <section className="flex flex-1 flex-col">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#10aaa9]/20 bg-[#10aaa9]/[0.08]">
                                <Music2
                                    size={25}
                                    className="text-[#10aaa9]"
                                />
                            </div>

                            <h1 className="text-[27px] font-semibold tracking-[-0.7px] sm:text-[31px]">
                                What do you like listening to?
                            </h1>

                            <p className="mx-auto mt-2 max-w-[470px] text-[13px] leading-6 text-[#778187]">
                                Pick a few genres you love. We'll use them to
                                personalize your Sonic experience.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {genres.map((genre) => {
                                const selected =
                                    selectedGenres.includes(genre);

                                return (
                                    <button
                                        key={genre}
                                        type="button"
                                        onClick={() => toggleGenre(genre)}
                                        className={`rounded-full border px-5 py-2.5 text-[13px] transition-all ${selected
                                            ? "border-[#10aaa9] bg-[#10aaa9] text-white"
                                            : "border-white/[0.09] bg-white/[0.025] text-[#aeb7bb] hover:border-[#10aaa9]/40 hover:bg-[#10aaa9]/[0.06]"
                                            }`}
                                    >
                                        {selected && (
                                            <Check
                                                size={14}
                                                className="mr-1.5 inline-block"
                                            />
                                        )}
                                        {genre}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-5 text-center text-[11px] text-[#59656b]">
                            {selectedGenres.length} selected
                        </p>
                    </section>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <section className="flex flex-1 flex-col">
                        <div className="mb-7 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#10aaa9]/20 bg-[#10aaa9]/[0.08]">
                                <Headphones
                                    size={25}
                                    className="text-[#10aaa9]"
                                />
                            </div>

                            <h1 className="text-[27px] font-semibold tracking-[-0.7px] sm:text-[31px]">
                                Pick your favourite artists
                            </h1>

                            <p className="mx-auto mt-2 max-w-[470px] text-[13px] leading-6 text-[#778187]">
                                Choose artists you already enjoy and we'll
                                create recommendations around your taste.
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6b70]"
                            />

                            <input
                                type="text"
                                value={artistSearch}
                                onChange={(e) =>
                                    setArtistSearch(e.target.value)
                                }
                                placeholder="Search artists"
                                className="h-[46px] w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-11 pr-4 text-[13px] text-white outline-none transition placeholder:text-[#566167] focus:border-[#10aaa9]/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {filteredArtists.map((artist) => {
                                const selected = selectedArtists.includes(
                                    artist.id
                                );

                                return (
                                    <button
                                        key={artist.id}
                                        type="button"
                                        onClick={() =>
                                            toggleArtist(artist.id)
                                        }
                                        className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all ${selected
                                            ? "border-[#10aaa9] bg-[#10aaa9]/[0.08]"
                                            : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.14]"
                                            }`}
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-xl">
                                            <img
                                                src={artist.image}
                                                alt={artist.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {selected && (
                                                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#10aaa9]">
                                                    <Check size={15} />
                                                </div>
                                            )}
                                        </div>

                                        <p className="mt-3 truncate text-[13px] font-medium text-white">
                                            {artist.name}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-5 text-center text-[11px] text-[#59656b]">
                            {selectedArtists.length} artist
                            {selectedArtists.length !== 1 ? "s" : ""} selected
                        </p>
                    </section>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <section className="flex flex-1 flex-col">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#10aaa9]/20 bg-[#10aaa9]/[0.08]">
                                <Sparkles
                                    size={25}
                                    className="text-[#10aaa9]"
                                />
                            </div>

                            <h1 className="text-[27px] font-semibold tracking-[-0.7px] sm:text-[31px]">
                                What language do you listen to?
                            </h1>

                            <p className="mx-auto mt-2 max-w-[470px] text-[13px] leading-6 text-[#778187]">
                                Select your preferred music language to improve
                                your recommendations.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {languages.map((language) => {
                                const selected =
                                    selectedLanguages.includes(language);

                                return (
                                    <button
                                        key={language}
                                        type="button"
                                        onClick={() => {
                                            setSelectedLanguages((prev) =>
                                                prev.includes(language)
                                                    ? prev.filter((item) => item !== language)
                                                    : prev.length < 3
                                                        ? [...prev, language]
                                                        : prev
                                            );
                                        }}
                                        className={`relative rounded-xl border px-4 py-4 text-[13px] transition-all ${selected
                                            ? "border-[#10aaa9] bg-[#10aaa9]/10 text-white"
                                            : "border-white/[0.08] bg-white/[0.025] text-[#aeb7bb] hover:border-[#10aaa9]/40"
                                            }`}
                                    >
                                        {selected && (
                                            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#10aaa9]">
                                                <Check size={11} />
                                            </span>
                                        )}

                                        {language}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-center text-[11px] text-[#59656b]">
                            {selectedLanguages.length}/3 languages selected
                        </p>

                        {/* Summary */}
                        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                            <p className="mb-4 text-[11px] font-medium uppercase tracking-[1.2px] text-[#647076]">
                                Your Sonic setup
                            </p>

                            <div className="space-y-3 text-[12px]">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#69757a]">
                                        Genres
                                    </span>
                                    <span className="text-right text-[#c4cbce]">
                                        {selectedGenres.length
                                            ? selectedGenres.join(", ")
                                            : "Not selected"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#69757a]">
                                        Artists
                                    </span>
                                    <span className="text-[#c4cbce]">
                                        {selectedArtists.length} selected
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[#69757a]">
                                        Language
                                    </span>
                                    <span className="text-[#c4cbce]">
                                        {selectedLanguages.length
                                            ? selectedLanguages.join(", ")
                                            : "Not selected"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Bottom Actions */}
                <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
                    <button
                        type="button"
                        onClick={previousStep}
                        disabled={step === 1}
                        className={`flex h-11 items-center gap-2 rounded-xl px-4 text-[13px] transition ${step === 1
                            ? "cursor-not-allowed text-[#343d41]"
                            : "text-[#8b969b] hover:bg-white/[0.04] hover:text-white"
                            }`}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={nextStep}
                        disabled={isFinishing}
                        className={`flex h-11 items-center gap-2 rounded-xl bg-[#10aaa9] px-6 text-[13px] font-medium text-white transition hover:bg-[#0e9998] active:scale-[0.98] ${isFinishing ? "cursor-not-allowed opacity-70" : ""
                            }`}
                    >
                        {isFinishing ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Saving...
                            </>
                        ) : (
                            <>
                                {step === 3 ? "Finish Setup" : "Continue"}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}