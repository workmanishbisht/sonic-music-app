import { Link } from "react-router-dom";
import { X, LogIn, UserPlus, Music2 } from "lucide-react";

export default function LoginRequiredModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 px-5 backdrop-blur-[3px]">

            <div className="relative w-full max-w-[760px] overflow-hidden rounded-[6px] border border-white/[0.08] bg-[#202a27] shadow-[0_25px_80px_rgba(0,0,0,0.55)]">

                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#9ba5a2] transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className="grid min-h-[440px] grid-cols-1 md:grid-cols-2">

                    {/* Left */}
                    <div className="flex flex-col items-center justify-center bg-[#17201e] px-10 py-12 text-center">

                        <div className="mb-6 flex h-[86px] w-[86px] items-center justify-center rounded-[20px] bg-[#10aaa9]/10">
                            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#10aaa9] shadow-[0_0_35px_rgba(16,170,169,0.25)]">
                                <Music2
                                    size={32}
                                    strokeWidth={1.8}
                                    className="text-white"
                                />
                            </div>
                        </div>

                        <h2 className="text-[28px] font-bold leading-tight text-white">
                            Keep the music going
                        </h2>

                        <p className="mt-4 max-w-[300px] text-[13px] leading-6 text-[#9aa5a1]">
                            Create a free Sonic account to start listening to your favorite songs.
                        </p>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col justify-center px-10 py-12 md:px-12">

                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#10aaa9]">
                            Almost there
                        </p>

                        <h3 className="mt-3 text-[25px] font-bold leading-[1.25] text-white">
                            Start listening with a free Sonic account
                        </h3>

                        <p className="mt-4 text-[13px] leading-6 text-[#8e9995]">
                            Sign up or log in to play songs, save favorites and build your personal music library.
                        </p>

                        <div className="mt-7 flex flex-col gap-3">

                            <Link
                                to="/signup"
                                onClick={onClose}
                                className="flex h-[52px] items-center justify-center gap-2 rounded-[4px] bg-[#10aaa9] text-[13px] font-semibold text-white shadow-[0_8px_25px_rgba(16,170,169,0.14)] transition hover:bg-[#12bfbd]"
                            >
                                <UserPlus size={17} />
                                Sign up free
                            </Link>

                            <Link
                                to="/login"
                                onClick={onClose}
                                className="flex h-[52px] items-center justify-center gap-2 rounded-[4px] border border-white/[0.18] text-[13px] font-semibold text-white transition hover:border-white/[0.3] hover:bg-white/[0.04]"
                            >
                                <LogIn size={17} />
                                Log in
                            </Link>

                        </div>

                        <p className="mt-6 text-center text-[11px] text-[#78837f]">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="font-semibold text-white underline underline-offset-2 hover:text-[#10aaa9]"
                            >
                                Log in
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}