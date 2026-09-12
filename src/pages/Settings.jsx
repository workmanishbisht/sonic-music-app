import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Bell,
    ChevronDown,
    Check,
    Lock,
    LogOut,
    Music2,
    Play,
    Settings as SettingsIcon,
    ShieldCheck,
    Sparkles,
    Volume2,
    X,
    CheckCircle2,
    XCircle,
    Crown,
    CreditCard,
} from "lucide-react";

import {
    sendPasswordResetEmail,
    signOut,
} from "firebase/auth";

import {
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   TOAST
========================================================= */

function Toast({ type = "success", message, onClose }) {
    const isSuccess = type === "success";

    return (
        <div className="pointer-events-none fixed bottom-[105px] left-1/2 z-[9999] w-full -translate-x-1/2 px-5">
            <div className="pointer-events-auto mx-auto flex w-full max-w-[390px] items-center gap-3 rounded-[10px] border border-white/[0.08] bg-[#151d21] px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSuccess
                        ? "bg-[#10aaa9]/10 text-[#10aaa9]"
                        : "bg-red-500/10 text-red-400"
                        }`}
                >
                    {isSuccess ? (
                        <CheckCircle2 size={21} />
                    ) : (
                        <XCircle size={21} />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white">
                        {isSuccess
                            ? "Success"
                            : "Something went wrong"}
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
            <div className="relative w-full max-w-[430px] rounded-2xl border border-white/[0.08] bg-[#11181d] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.65)]">
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
   TOGGLE
========================================================= */

function Toggle({ enabled, onChange }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled
                ? "bg-[#10aaa9]"
                : "bg-[#303a3f]"
                }`}
        >
            <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled
                    ? "left-6"
                    : "left-1"
                    }`}
            />
        </button>
    );
}

/* =========================================================
   SETTINGS
========================================================= */

export default function Settings() {
    const navigate = useNavigate();
    const { user } = useAuth();

    /* =====================================================
       SETTINGS STATE
    ===================================================== */

    const [autoplay, setAutoplay] = useState(true);
    const [newReleases, setNewReleases] = useState(true);
    const [playlistUpdates, setPlaylistUpdates] =
        useState(true);
    const [promotionalNotifications, setPromotionalNotifications] =
        useState(false);

    const [audioQuality, setAudioQuality] =
        useState("High");

    const [toast, setToast] = useState(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] =
        useState(false);

    const [isSendingReset, setIsSendingReset] =
        useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    const [subscription, setSubscription] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const [isCancellingSubscription, setIsCancellingSubscription] =
        useState(false);

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

    const isPasswordAccount =
        authProvider === "password";

    const providerName =
        authProvider === "google.com"
            ? "Google"
            : authProvider === "facebook.com"
                ? "Facebook"
                : "email and password";

    /* =====================================================
       SUBSCRIPTION
    ===================================================== */

    useEffect(() => {
        if (!user) {
            setSubscription(null);
            setSubscriptionLoading(false);
            return;
        }

        setSubscriptionLoading(true);

        const userRef = doc(db, "users", user.uid);

        const unsubscribe = onSnapshot(
            userRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setSubscription(
                        snapshot.data()?.subscription || null
                    );
                } else {
                    setSubscription(null);
                }

                setSubscriptionLoading(false);
            },
            (error) => {
                console.error(
                    "Settings subscription loading error:",
                    error
                );
                setSubscription(null);
                setSubscriptionLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const subscriptionEndDate = subscription?.endDate?.toDate
        ? subscription.endDate.toDate()
        : subscription?.endDate
            ? new Date(subscription.endDate)
            : null;

    const isSubscriptionActive =
        subscription?.status === "active" &&
        (!subscriptionEndDate ||
            subscriptionEndDate > new Date());

    const formatSubscriptionDate = (value) => {
        if (!value) return "—";

        const date = value?.toDate
            ? value.toDate()
            : value instanceof Date
                ? value
                : new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleCancelSubscription = async () => {
        if (!user || !isSubscriptionActive || isCancellingSubscription) {
            return;
        }

        try {
            setIsCancellingSubscription(true);

            await setDoc(
                doc(db, "users", user.uid),
                {
                    subscription: {
                        ...subscription,
                        cancelAtPeriodEnd: true,
                        updatedAt: serverTimestamp(),
                    },
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            setToast({
                type: "success",
                message:
                    "Your subscription will be cancelled at the end of the billing period.",
            });
        } catch (error) {
            console.error(
                "Settings subscription cancellation error:",
                error
            );

            setToast({
                type: "error",
                message:
                    "Unable to update your subscription. Please try again.",
            });
        } finally {
            setIsCancellingSubscription(false);
        }
    };

    /* =====================================================
       LOAD SAVED SETTINGS
    ===================================================== */

    useEffect(() => {
        const savedAutoplay =
            localStorage.getItem("sonicAutoplay");

        const savedNewReleases =
            localStorage.getItem("sonicNewReleases");

        const savedPlaylistUpdates =
            localStorage.getItem(
                "sonicPlaylistUpdates"
            );

        const savedPromotionalNotifications =
            localStorage.getItem(
                "sonicPromotionalNotifications"
            );

        const savedAudioQuality =
            localStorage.getItem(
                "sonicAudioQuality"
            );

        if (savedAutoplay !== null) {
            setAutoplay(
                savedAutoplay === "true"
            );
        }

        if (savedNewReleases !== null) {
            setNewReleases(
                savedNewReleases === "true"
            );
        }

        if (savedPlaylistUpdates !== null) {
            setPlaylistUpdates(
                savedPlaylistUpdates === "true"
            );
        }

        if (
            savedPromotionalNotifications !==
            null
        ) {
            setPromotionalNotifications(
                savedPromotionalNotifications ===
                "true"
            );
        }

        if (savedAudioQuality) {
            setAudioQuality(savedAudioQuality);
        }
    }, []);

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
       SETTING HANDLERS
    ===================================================== */

    const handleAutoplay = (value) => {
        setAutoplay(value);

        localStorage.setItem(
            "sonicAutoplay",
            String(value)
        );

        setToast({
            type: "success",
            message: value
                ? "Autoplay has been enabled."
                : "Autoplay has been disabled.",
        });
    };

    const handleNewReleases = (value) => {
        setNewReleases(value);

        localStorage.setItem(
            "sonicNewReleases",
            String(value)
        );

        setToast({
            type: "success",
            message: value
                ? "New release notifications enabled."
                : "New release notifications disabled.",
        });
    };

    const handlePlaylistUpdates = (value) => {
        setPlaylistUpdates(value);

        localStorage.setItem(
            "sonicPlaylistUpdates",
            String(value)
        );

        setToast({
            type: "success",
            message: value
                ? "Playlist notifications enabled."
                : "Playlist notifications disabled.",
        });
    };

    const handlePromotionalNotifications = (
        value
    ) => {
        setPromotionalNotifications(value);

        localStorage.setItem(
            "sonicPromotionalNotifications",
            String(value)
        );

        setToast({
            type: "success",
            message: value
                ? "Promotional notifications enabled."
                : "Promotional notifications disabled.",
        });
    };

    const handleAudioQuality = (value) => {
        setAudioQuality(value);

        localStorage.setItem(
            "sonicAudioQuality",
            value
        );

        setToast({
            type: "success",
            message: `Audio quality set to ${value}.`,
        });
    };

    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    const handleChangePassword = async () => {
        if (!isPasswordAccount) {
            setIsPasswordModalOpen(true);
            return;
        }

        if (!user?.email) {
            setToast({
                type: "error",
                message:
                    "No email address is available for this account.",
            });

            return;
        }

        try {
            setIsSendingReset(true);

            await sendPasswordResetEmail(
                auth,
                user.email
            );

            setToast({
                type: "success",
                message: `A password reset link has been sent to ${user.email}.`,
            });
        } catch (error) {
            console.error(
                "Password Reset Error:",
                error
            );

            let message =
                "Unable to send the password reset email. Please try again.";

            if (
                error?.code ===
                "auth/invalid-email"
            ) {
                message =
                    "Your account email address is invalid.";
            }

            if (
                error?.code ===
                "auth/user-not-found"
            ) {
                message =
                    "No account was found with this email address.";
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

            localStorage.removeItem(
                "sonicLoggedIn"
            );

            localStorage.removeItem(
                "sonicUser"
            );

            setToast({
                type: "success",
                message:
                    "You're logged out successfully.",
            });

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (error) {
            console.error(
                "Settings Logout Error:",
                error
            );

            setToast({
                type: "error",
                message:
                    "Unable to log out. Please try again.",
            });

            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <div className="mx-auto w-full max-w-5xl py-8 sm:py-10">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                            <SettingsIcon size={21} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                Settings
                            </h1>

                            <p className="mt-1 text-sm text-[#7f8a8f]">
                                Customize your Sonic experience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    PLAYBACK
                ================================================= */}

                <section className="rounded-2xl border border-white/[0.06] bg-[#10171b]">

                    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                                <Music2 size={19} />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Playback
                                </h2>

                                <p className="mt-0.5 text-xs text-[#707b80]">
                                    Control how music plays in Sonic.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-white/[0.05]">

                        {/* Autoplay */}
                        <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-7">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151d21] text-[#89959a]">
                                    <Play size={16} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Autoplay
                                    </p>

                                    <p className="mt-1 max-w-[520px] text-xs leading-5 text-[#707b80]">
                                        Automatically continue playing the next song when the current song ends.
                                    </p>
                                </div>
                            </div>

                            <Toggle
                                enabled={autoplay}
                                onChange={handleAutoplay}
                            />
                        </div>

                        {/* Audio Quality */}
                        <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-7">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151d21] text-[#89959a]">
                                    <Volume2 size={16} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Audio Quality
                                    </p>

                                    <p className="mt-1 max-w-[520px] text-xs leading-5 text-[#707b80]">
                                        Choose the preferred quality for music playback.
                                    </p>
                                </div>
                            </div>

                            <div className="relative shrink-0">
                                <select
                                    value={audioQuality}
                                    onChange={(event) =>
                                        handleAudioQuality(
                                            event.target.value
                                        )
                                    }
                                    className="h-9 min-w-[105px] appearance-none rounded-lg border border-white/[0.08] bg-[#151d21] pl-3 pr-8 text-xs font-medium text-white outline-none transition hover:border-white/[0.14] focus:border-[#10aaa9]/60"
                                >
                                    <option value="Low">
                                        Low
                                    </option>

                                    <option value="Normal">
                                        Normal
                                    </option>

                                    <option value="High">
                                        High
                                    </option>
                                </select>

                                <ChevronDown
                                    size={14}
                                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7d898e]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b]">

                    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                                <Bell size={19} />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Notifications
                                </h2>

                                <p className="mt-0.5 text-xs text-[#707b80]">
                                    Decide which Sonic updates you receive.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-white/[0.05]">

                        {/* New Releases */}
                        <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-7">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151d21] text-[#89959a]">
                                    <Sparkles size={16} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        New Releases
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#707b80]">
                                        Get notified when new music is released.
                                    </p>
                                </div>
                            </div>

                            <Toggle
                                enabled={newReleases}
                                onChange={handleNewReleases}
                            />
                        </div>

                        {/* Playlist Updates */}
                        <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-7">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151d21] text-[#89959a]">
                                    <Music2 size={16} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Playlist Updates
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#707b80]">
                                        Receive updates related to your playlists.
                                    </p>
                                </div>
                            </div>

                            <Toggle
                                enabled={playlistUpdates}
                                onChange={handlePlaylistUpdates}
                            />
                        </div>

                        {/* Promotional Notifications */}
                        <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-7">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#151d21] text-[#89959a]">
                                    <Bell size={16} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Promotional Updates
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#707b80]">
                                        Receive occasional offers and Sonic updates.
                                    </p>
                                </div>
                            </div>

                            <Toggle
                                enabled={
                                    promotionalNotifications
                                }
                                onChange={
                                    handlePromotionalNotifications
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* =================================================
                    SUBSCRIPTION
                ================================================= */}

                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b]">
                    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                                <Crown size={19} />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Subscription
                                </h2>

                                <p className="mt-0.5 text-xs text-[#707b80]">
                                    Manage your Sonic Premium membership.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-5 sm:px-7">
                        {subscriptionLoading ? (
                            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#151d21] px-4 py-4">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#10aaa9]" />
                                <p className="text-xs text-[#7f8a8f]">
                                    Loading subscription...
                                </p>
                            </div>
                        ) : isSubscriptionActive ? (
                            <div className="rounded-xl border border-[#10aaa9]/20 bg-[#10aaa9]/[0.04] p-4">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                                            <Crown size={18} />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-white">
                                                    {subscription?.planName ||
                                                        "Sonic Premium"}
                                                </p>

                                                <span className="rounded-full bg-[#10aaa9]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#10aaa9]">
                                                    Active
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-[#7f8a8f]">
                                                {subscription?.billingCycle ===
                                                    "yearly"
                                                    ? "Yearly"
                                                    : "Monthly"}{" "}
                                                · ₹
                                                {subscription?.price ?? "—"}
                                                /month
                                            </p>

                                            <p className="mt-1 text-[11px] text-[#68747a]">
                                                {subscription?.cancelAtPeriodEnd
                                                    ? "Cancels on "
                                                    : "Valid until "}
                                                {formatSubscriptionDate(
                                                    subscriptionEndDate
                                                )}
                                            </p>

                                            {subscription?.cancelAtPeriodEnd && (
                                                <p className="mt-2 text-[10px] text-amber-400">
                                                    Premium benefits remain
                                                    active until the end of your
                                                    billing period.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                                        {!subscription?.cancelAtPeriodEnd && (
                                            <button
                                                type="button"
                                                onClick={handleCancelSubscription}
                                                disabled={
                                                    isCancellingSubscription
                                                }
                                                className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 text-[11px] font-medium text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isCancellingSubscription ? (
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400/20 border-t-red-400" />
                                                ) : (
                                                    <XCircle size={14} />
                                                )}
                                                {isCancellingSubscription
                                                    ? "Cancelling..."
                                                    : "Cancel Subscription"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate("/premium")
                                            }
                                            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-[#151d21] px-4 text-[11px] font-medium text-white transition hover:border-[#10aaa9]/30 hover:text-[#10aaa9]"
                                        >
                                            <CreditCard size={14} />
                                            Manage Premium
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5 rounded-xl border border-white/[0.05] bg-[#151d21] p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#182126] text-[#68747a]">
                                        <Crown size={18} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            Free Plan
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#707b80]">
                                            Upgrade to enjoy ad-free music,
                                            unlimited skips and high quality
                                            audio.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate("/premium")}
                                    className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#10aaa9] px-5 text-[11px] font-semibold text-white transition hover:bg-[#12c1bf]"
                                >
                                    <Crown size={14} />
                                    Upgrade to Premium
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* =================================================
                    SECURITY
                ================================================= */}

                <section className="mt-6 rounded-2xl border border-white/[0.06] bg-[#10171b]">

                    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                                <ShieldCheck size={19} />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Security
                                </h2>

                                <p className="mt-0.5 text-xs text-[#707b80]">
                                    Manage your Sonic account security.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-5 sm:px-7">

                        <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isSendingReset}
                            className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#151d21] p-4 text-left transition hover:border-white/[0.1] hover:bg-[#192125] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d272b] text-[#9aa6aa]">
                                    <Lock size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Change Password
                                    </p>

                                    <p className="mt-1 text-xs text-[#707b80]">
                                        {isPasswordAccount
                                            ? "Send a secure password reset link to your email."
                                            : `Your password is managed by ${providerName}.`}
                                    </p>
                                </div>
                            </div>

                            {isSendingReset ? (
                                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-[#10aaa9]" />
                            ) : (
                                <ChevronDown
                                    size={17}
                                    className="rotate-[-90deg] shrink-0 text-[#596469] transition group-hover:translate-x-0.5 group-hover:text-white"
                                />
                            )}
                        </button>

                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#151d21]/60 px-4 py-3">
                            <Check
                                size={16}
                                className="text-[#10aaa9]"
                            />

                            <p className="text-xs text-[#7f8a8f]">
                                Your account is protected by Firebase Authentication.
                            </p>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    ACCOUNT / LOGOUT
                ================================================= */}

                <section className="mt-6 rounded-2xl border border-red-500/[0.12] bg-[#10171b]">

                    <div className="border-b border-white/[0.06] px-5 py-5 sm:px-7">
                        <h2 className="text-base font-semibold text-white">
                            Account
                        </h2>

                        <p className="mt-0.5 text-xs text-[#707b80]">
                            Manage your Sonic session.
                        </p>
                    </div>

                    <div className="px-5 py-5 sm:px-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Log out of Sonic
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#707b80]">
                                    Sign out of your account on this device.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-5 text-sm font-medium text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoggingOut ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400/20 border-t-red-400" />
                                ) : (
                                    <LogOut size={16} />
                                )}

                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Log Out"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Bottom spacing */}
                <div className="h-4" />
            </div>

            {/* =====================================================
                SOCIAL ACCOUNT PASSWORD MODAL
            ===================================================== */}

            {isPasswordModalOpen &&
                !isPasswordAccount && (
                    <Modal
                        onClose={() =>
                            setIsPasswordModalOpen(
                                false
                            )
                        }
                    >
                        <div className="pr-8">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                                <Lock size={20} />
                            </div>

                            <h2 className="text-xl font-semibold text-white">
                                Password Managed by{" "}
                                {providerName}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#7f8a8f]">
                                This Sonic account is connected
                                through {providerName}. Your
                                password is managed by{" "}
                                {providerName}, so there is no
                                separate Sonic password to
                                change here.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setIsPasswordModalOpen(
                                    false
                                )
                            }
                            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-[#1d272b] text-sm font-semibold text-white transition hover:bg-[#263136]"
                        >
                            Got it
                        </button>
                    </Modal>
                )}

            {/* =====================================================
                TOAST
            ===================================================== */}

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