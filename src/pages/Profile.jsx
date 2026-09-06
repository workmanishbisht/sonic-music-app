import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    User,
    UserRound,
    Mail,
    Lock,
    Camera,
    Pencil,
    ChevronRight,
    LogOut,
    ShieldCheck,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import {
    updateProfile,
    sendPasswordResetEmail,
    signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   TOAST
========================================================= */

function Toast({ type = "success", message, onClose }) {
    const isSuccess = type === "success";

    return (
        <div className="pointer-events-none fixed bottom-[105px] left-1/2 z-[9999] w-full -translate-x-1/2 px-5">
            <div className="pointer-events-auto mx-auto flex w-full max-w-[390px] items-center gap-3 rounded-[8px] border border-white/[0.08] bg-[#151d21] px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
                            ? "bg-[#10aaa9]/10 text-[#10aaa9]"
                            : "bg-red-500/10 text-red-400"
                        }`}
                >
                    {isSuccess ? (
                        <CheckCircle2 size={21} strokeWidth={2} />
                    ) : (
                        <XCircle size={21} strokeWidth={2} />
                    )}
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

/* =========================================================
   MODAL
========================================================= */

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

/* =========================================================
   PROFILE
========================================================= */

export default function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [toast, setToast] = useState(null);

    /* =====================================================
       AUTH PROVIDER
    ===================================================== */

    const authProvider =
        user?.providerData?.find(
            (provider) =>
                provider.providerId === "google.com" ||
                provider.providerId === "facebook.com" ||
                provider.providerId === "password"
        )?.providerId || "password";

    const isPasswordAccount = authProvider === "password";

    const providerName =
        authProvider === "google.com"
            ? "Google"
            : authProvider === "facebook.com"
                ? "Facebook"
                : "email and password";

    /* =====================================================
       SOCIAL PROFILE PHOTO
    ===================================================== */

    const hasSocialProfilePhoto =
        !!user?.photoURL &&
        user?.providerData?.some(
            (provider) =>
                provider.providerId === "google.com" ||
                provider.providerId === "facebook.com"
        );

    /* =====================================================
       USER DATA
    ===================================================== */

    useEffect(() => {
        if (!user) return;

        const currentName =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Sonic User";

        setName(currentName);
        setEmail(user.email || "");
        setEditName(currentName);
    }, [user]);

    /* =====================================================
       TOAST AUTO CLOSE
    ===================================================== */

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast]);

    /* =====================================================
       EDIT PROFILE
    ===================================================== */

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

    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    const handleChangePassword = async () => {
        if (!isPasswordAccount) {
            setIsPasswordOpen(true);
            return;
        }

        if (!email) {
            setToast({
                type: "error",
                message: "No email address is available for this account.",
            });
            return;
        }

        try {
            setIsSendingReset(true);

            await sendPasswordResetEmail(auth, email);

            setToast({
                type: "success",
                message: `A password reset link has been sent to ${email}.`,
            });
        } catch (error) {
            console.error("Password Reset Error:", error);

            let message =
                "Unable to send the password reset email. Please try again.";

            if (error?.code === "auth/invalid-email") {
                message = "Your account email address is invalid.";
            } else if (error?.code === "auth/user-not-found") {
                message = "No account was found with this email address.";
            }

            setToast({
                type: "error",
                message,
            });
        } finally {
            setIsSendingReset(false);
        }
    };

    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = async () => {
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);

            await signOut(auth);

            localStorage.removeItem("sonicLoggedIn");
            localStorage.removeItem("sonicUser");

            setToast({
                type: "success",
                message: "You're logged out successfully.",
            });

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (error) {
            console.error("Profile Logout Error:", error);

            setToast({
                type: "error",
                message: "Unable to log out. Please try again.",
            });

            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <div className="mx-auto w-full max-w-5xl py-8 sm:py-10">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        Profile
                    </h1>

                    <p className="mt-1 text-sm text-[#7f8a8f]">
                        Manage your Sonic account and profile information.
                    </p>
                </div>

                {/* Profile Hero */}
                <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#10171b]">
                    <div className="h-28 bg-gradient-to-r from-[#102b2d] via-[#12383a] to-[#10171b]" />

                    <div className="px-5 pb-6 sm:px-7">
                        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-end gap-4">
                                {/* Avatar */}
                                <div className="relative">
                                    {hasSocialProfilePhoto ? (
                                        <img
                                            src={user.photoURL}
                                            alt={name || "Profile"}
                                            className="h-24 w-24 rounded-full border-4 border-[#10171b] object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#10171b] bg-[#10aaa9]">
                                            <UserRound
                                                size={30}
                                                strokeWidth={1.7}
                                                className="text-white"
                                            />
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

                                {/* User Info */}
                                <div className="pb-1">
                                    <h2 className="text-xl font-semibold text-white">
                                        {name || "Sonic User"}
                                    </h2>

                                    <p className="mt-1 text-sm text-[#7f8a8f]">
                                        {email}
                                    </p>
                                </div>
                            </div>

                            {/* Edit Profile */}
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

                {/* Personal Information */}
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
                        {/* Display Name */}
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

                        {/* Email */}
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

                {/* Account Settings */}
                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b] p-5 sm:p-7">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">
                            Account Settings
                        </h2>

                        <p className="mt-1 text-sm text-[#7f8a8f]">
                            Manage your account preferences and security.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Change Password */}
                        <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isSendingReset}
                            className="group flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-[#151d21] p-4 text-left transition hover:border-white/[0.1] hover:bg-[#1a2327] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d272b] text-[#9aa6aa]">
                                    <Lock size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Change Password
                                    </p>

                                    <p className="mt-1 text-xs text-[#707b80]">
                                        {isPasswordAccount
                                            ? "Send a secure password reset link to your email"
                                            : `Password is managed by ${providerName}`}
                                    </p>
                                </div>
                            </div>

                            {isPasswordAccount && isSendingReset ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#10aaa9]" />
                            ) : (
                                <ChevronRight
                                    size={18}
                                    className="text-[#596469] transition group-hover:translate-x-0.5 group-hover:text-white"
                                />
                            )}
                        </button>

                        {/* Account Security */}
                        <div className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-[#151d21] p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d272b] text-[#10aaa9]">
                                    <ShieldCheck size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Account Security
                                    </p>

                                    <p className="mt-1 text-xs text-[#707b80]">
                                        Signed in with {providerName}
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full bg-[#10aaa9]/10 px-3 py-1 text-xs font-medium text-[#10aaa9]">
                                Active
                            </span>
                        </div>
                    </div>
                </section>

                {/* Logout */}
                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b] p-5 sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Sign out
                            </h2>

                            <p className="mt-1 text-sm text-[#7f8a8f]">
                                Sign out of your Sonic account on this device.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#171f23] px-5 text-sm font-medium text-[#d5dbde] transition hover:border-white/[0.14] hover:bg-[#20292e] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoggingOut ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            ) : (
                                <LogOut size={16} />
                            )}

                            {isLoggingOut ? "Logging out..." : "Log Out"}
                        </button>
                    </div>
                </section>
            </div>

            {/* Edit Profile Modal */}
            {isEditOpen && (
                <Modal
                    onClose={() =>
                        !isSavingProfile && setIsEditOpen(false)
                    }
                >
                    <div className="pr-8">
                        <h2 className="text-xl font-semibold text-white">
                            Edit Profile
                        </h2>

                        <p className="mt-1 text-sm text-[#7f8a8f]">
                            Update your Sonic display name.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSaveProfile}
                        className="mt-6 space-y-5"
                    >
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
                                onChange={(event) =>
                                    setEditName(event.target.value)
                                }
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

                            {isSavingProfile
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </form>
                </Modal>
            )}

            {/* Social Account Password Modal */}
            {isPasswordOpen && !isPasswordAccount && (
                <Modal
                    onClose={() => setIsPasswordOpen(false)}
                >
                    <div className="pr-8">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                            <Lock size={20} />
                        </div>

                        <h2 className="text-xl font-semibold text-white">
                            Password Managed by {providerName}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#7f8a8f]">
                            This Sonic account is connected through{" "}
                            {providerName}. Your password is managed by{" "}
                            {providerName}, so there is no separate Sonic
                            password to change here.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsPasswordOpen(false)}
                        className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#1d272b] text-sm font-semibold text-white transition hover:bg-[#263136]"
                    >
                        Got it
                    </button>
                </Modal>
            )}

            {/* Toast */}
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
