import { useEffect, useState } from "react";
import {
    User,
    UserRound,
    Mail,
    Camera,
    Pencil,
    X,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Music2,
    Headphones,
    Languages,
} from "lucide-react";

import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";

function Toast({ type = "success", message, onClose }) {
    const isSuccess = type === "success";

    return (
        <div className="pointer-events-none fixed bottom-[105px] left-1/2 z-[9999] w-full -translate-x-1/2 px-5">
            <div className="pointer-events-auto mx-auto flex w-full max-w-[390px] items-center gap-3 rounded-[8px] border border-white/[0.08] bg-[#151d21] px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
                        ? "bg-[#10aaa9]/10 text-[#10aaa9]"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                    {isSuccess ? <CheckCircle2 size={21} /> : <XCircle size={21} />}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white">
                        {isSuccess ? "Success" : "Something went wrong"}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-5 text-[#8b969d]">
                        {message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#68747a] transition hover:bg-white/[0.05] hover:text-white"
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
}

function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[440px] rounded-2xl border border-white/[0.08] bg-[#11181d] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.65)]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#68747a] transition hover:bg-white/[0.05] hover:text-white"
                >
                    <X size={17} />
                </button>
                {children}
            </div>
        </div>
    );
}

export default function Profile() {
    const { user } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [genres, setGenres] = useState([]);
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [profileLoading, setProfileLoading] = useState(true);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [toast, setToast] = useState(null);

    const hasSocialProfilePhoto =
        !!user?.photoURL &&
        user?.providerData?.some(
            (provider) =>
                provider.providerId === "google.com" ||
                provider.providerId === "facebook.com"
        );

    useEffect(() => {
        if (!user) {
            setProfileLoading(false);
            return;
        }

        const loadProfile = async () => {
            const currentName =
                user.displayName ||
                user.email?.split("@")[0] ||
                "Sonic User";

            setName(currentName);
            setEmail(user.email || "");
            setEditName(currentName);

            try {
                const userSnap = await getDoc(doc(db, "users", user.uid));

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    setName(data.name || currentName);
                    setEditName(data.name || currentName);
                    setEmail(data.email || user.email || "");
                    setGenres(Array.isArray(data.genres) ? data.genres : []);
                    setSelectedArtists(
                        Array.isArray(data.artists) ? data.artists : []
                    );
                    setLanguages(
                        Array.isArray(data.languages)
                            ? data.languages
                            : data.language
                                ? [data.language]
                                : []
                    );
                }
            } catch (error) {
                console.error("Profile Firestore Error:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const openEditProfile = () => {
        setEditName(name);
        setIsEditOpen(true);
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();

        const trimmedName = editName.trim();

        if (!trimmedName) {
            setToast({
                type: "error",
                message: "Please enter your display name.",
            });
            return;
        }

        if (!auth.currentUser) {
            setToast({
                type: "error",
                message: "Your session has expired. Please log in again.",
            });
            return;
        }

        try {
            setIsSavingProfile(true);

            await updateProfile(auth.currentUser, {
                displayName: trimmedName,
            });

            await setDoc(
                doc(db, "users", auth.currentUser.uid),
                {
                    name: trimmedName,
                    email: auth.currentUser.email || email,
                    photoURL: auth.currentUser.photoURL || "",
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            await auth.currentUser.reload();

            setName(auth.currentUser.displayName || trimmedName);
            setEditName(auth.currentUser.displayName || trimmedName);
            setIsEditOpen(false);

            setToast({
                type: "success",
                message: "Your profile has been updated successfully.",
            });
        } catch (error) {
            console.error("Profile Update Error:", error);

            setToast({
                type: "error",
                message: "Unable to update your profile. Please try again.",
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <>
            <div className="mx-auto w-full max-w-5xl py-8 sm:py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        Profile
                    </h1>
                    <p className="mt-1 text-sm text-[#7f8a8f]">
                        Manage your Sonic profile information.
                    </p>
                </div>

                <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#10171b]">
                    <div className="h-28 bg-gradient-to-r from-[#102b2d] via-[#12383a] to-[#10171b]" />

                    <div className="px-5 pb-6 sm:px-7">
                        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-end gap-4">
                                <div className="relative">
                                    {hasSocialProfilePhoto ? (
                                        <img
                                            src={user.photoURL}
                                            alt={name || "Profile"}
                                            className="h-24 w-24 rounded-full border-4 border-[#10171b] object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#10171b] bg-[#10aaa9]">
                                            <UserRound size={30} strokeWidth={1.7} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={openEditProfile}
                                        aria-label="Edit profile"
                                        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#10171b] bg-[#20282c] text-[#aab4b8] transition hover:bg-[#293338] hover:text-white"
                                    >
                                        <Camera size={15} />
                                    </button>
                                </div>

                                <div className="pb-1">
                                    <h2 className="text-xl font-semibold text-white">
                                        {name || "Sonic User"}
                                    </h2>
                                    <p className="mt-1 text-sm text-[#7f8a8f]">
                                        {email}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openEditProfile}
                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#1b2327] px-4 text-sm font-medium text-white transition hover:bg-[#252e32]"
                            >
                                <Pencil size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b] p-5 sm:p-7">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">
                            Personal Information
                        </h2>
                        <p className="mt-1 text-sm text-[#7f8a8f]">
                            Your basic account information.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                            <div className="mb-3 flex items-center gap-2 text-[#7f8a8f]">
                                <User size={17} />
                                <span className="text-xs font-medium uppercase tracking-wide">
                                    Display Name
                                </span>
                            </div>
                            <p className="text-sm font-medium text-white">
                                {name || "Sonic User"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                            <div className="mb-3 flex items-center gap-2 text-[#7f8a8f]">
                                <Mail size={17} />
                                <span className="text-xs font-medium uppercase tracking-wide">
                                    Email Address
                                </span>
                            </div>
                            <p className="break-all text-sm font-medium text-white">
                                {email || "No email available"}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b] p-5 sm:p-7">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">
                            Music Preferences
                        </h2>
                        <p className="mt-1 text-sm text-[#7f8a8f]">
                            Your preferences selected during Sonic setup.
                        </p>
                    </div>

                    {profileLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#10aaa9]" />
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                                <div className="mb-3 flex items-center gap-2 text-[#7f8a8f]">
                                    <Music2 size={17} />
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        Genres
                                    </span>
                                </div>
                                <p className="text-sm leading-6 text-white">
                                    {genres.length
                                        ? genres.join(", ")
                                        : "Not selected"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                                <div className="mb-3 flex items-center gap-2 text-[#7f8a8f]">
                                    <Headphones size={17} />
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        Artists
                                    </span>
                                </div>
                                <p className="text-sm leading-6 text-white">
                                    {selectedArtists.length
                                        ? selectedArtists.length === 1
                                            ? "1 artist selected"
                                            : `${selectedArtists.length} artists selected`
                                        : "Not selected"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                                <div className="mb-3 flex items-center gap-2 text-[#7f8a8f]">
                                    <Languages size={17} />
                                    <span className="text-xs font-medium uppercase tracking-wide">
                                        Languages
                                    </span>
                                </div>
                                <p className="text-sm leading-6 text-white">
                                    {languages.length
                                        ? languages.join(", ")
                                        : "Not selected"}
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b] p-5 sm:p-7">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">
                            Account Information
                        </h2>
                        <p className="mt-1 text-sm text-[#7f8a8f]">
                            Information about your Sonic account.
                        </p>
                    </div>

                    <div className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d272b] text-[#10aaa9]">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Account Status
                                </p>
                                <p className="mt-1 text-xs text-[#707b80]">
                                    Your Sonic account is active and secure.
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full bg-[#10aaa9]/10 px-3 py-1 text-xs font-medium text-[#10aaa9]">
                            Active
                        </span>
                    </div>
                </section>
            </div>

            {isEditOpen && (
                <Modal
                    onClose={() => !isSavingProfile && setIsEditOpen(false)}
                >
                    <div className="pr-8">
                        <h2 className="text-xl font-semibold text-white">
                            Edit Profile
                        </h2>
                        <p className="mt-1 text-sm text-[#7f8a8f]">
                            Update your Sonic display name.
                        </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                        <div>
                            <label
                                htmlFor="profile-name"
                                className="mb-2 block text-xs font-medium text-[#aab4b8]"
                            >
                                Display Name
                            </label>
                            <input
                                id="profile-name"
                                type="text"
                                value={editName}
                                onChange={(event) => setEditName(event.target.value)}
                                maxLength={50}
                                autoFocus
                                className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151d21] px-4 text-sm text-white outline-none transition placeholder:text-[#68747a] focus:border-[#10aaa9]/60"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="profile-email"
                                className="mb-2 block text-xs font-medium text-[#aab4b8]"
                            >
                                Email Address
                            </label>
                            <input
                                id="profile-email"
                                type="email"
                                value={email}
                                readOnly
                                className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#10171b] px-4 text-sm text-[#6f7a80] outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#10aaa9] text-sm font-semibold text-white transition hover:bg-[#12c1bf] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSavingProfile ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            ) : (
                                <CheckCircle2 size={16} />
                            )}
                            {isSavingProfile ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </Modal>
            )}

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
