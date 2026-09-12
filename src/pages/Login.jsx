import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    XCircle,
    X,
} from "lucide-react";

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

/* =========================================================
   TOAST COMPONENT
========================================================= */

function Toast({ type = "success", message, onClose }) {
    const isSuccess = type === "success";

    return (
        <div
            className="
                pointer-events-none
                fixed
                bottom-8
                left-1/2
                z-[9999]
                w-full
                -translate-x-1/2
                px-5
            "
        >
            <div
                className="
                    pointer-events-auto
                    mx-auto
                    flex
                    w-full
                    max-w-[390px]
                    items-center
                    gap-3
                    rounded-[8px]
                    border
                    border-white/[0.08]
                    bg-[#151d21]
                    px-5
                    py-4
                    shadow-[0_20px_70px_rgba(0,0,0,0.55)]
                    animate-[toastIn_0.35s_ease-out]
                "
            >
                <div
                    className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        ${isSuccess
                            ? "bg-[#10aaa9]/10 text-[#10aaa9]"
                            : "bg-red-500/10 text-red-400"
                        }
                    `}
                >
                    {isSuccess ? (
                        <CheckCircle2
                            size={21}
                            strokeWidth={2}
                        />
                    ) : (
                        <XCircle
                            size={21}
                            strokeWidth={2}
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white">
                        {isSuccess
                            ? "Success"
                            : "Login failed"}
                    </p>

                    <p className="mt-0.5 text-[12px] leading-5 text-[#8b969d]">
                        {message}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-[#68747a]
                        transition
                        hover:bg-white/[0.05]
                        hover:text-white
                    "
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
}

/* =========================================================
   FIREBASE ERROR HANDLER
========================================================= */

function getFirebaseErrorMessage(error) {
    switch (error?.code) {
        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-login-credentials":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "The password you entered is incorrect.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:
            return "Unable to log in. Please try again.";
    }
}

/* =========================================================
   ONBOARDING CHECK
========================================================= */

async function getPostAuthRoute(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
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
                setupCompleted: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        return "/onboarding";
    }

    return userSnap.data()?.setupCompleted === true
        ? "/"
        : "/onboarding";
}

/* =========================================================
   AUTH VERIFICATION SCREEN
========================================================= */

function AuthVerificationScreen({ title = "Verifying your account" }) {
    return (
        <div className="fixed inset-0 z-[10000] flex min-h-screen items-center justify-center bg-[#070c0f] px-5 text-white">
            <div className="flex w-full max-w-[360px] flex-col items-center text-center">
                <div className="relative mb-7 flex h-[76px] w-[76px] items-center justify-center rounded-2xl border border-[#10aaa9]/20 bg-[#10aaa9]/[0.06]">
                    <span className="absolute inset-0 animate-ping rounded-2xl bg-[#10aaa9]/[0.04]" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#10aaa9]/10 text-[#10aaa9]">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#10aaa9]/20 border-t-[#10aaa9]" />
                    </div>
                </div>

                <img
                    src="/sonic.png"
                    alt="Sonic"
                    className="mb-7 h-[38px] w-auto object-contain"
                />

                <h2 className="text-[20px] font-semibold tracking-[-0.3px] text-white">
                    {title}
                </h2>

                <p className="mt-2 text-[12px] leading-5 text-[#707b80]">
                    Please wait while we securely verify your account.
                </p>

                <div className="mt-6 flex items-center gap-2 text-[10px] text-[#59656b]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10aaa9]" />
                    <span>Connecting to Sonic</span>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function Login() {
    const navigate = useNavigate();

    /* =====================================================
       STATES
    ===================================================== */

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const [firebaseError, setFirebaseError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const [isVerifying, setIsVerifying] =
        useState(false);

    const [toast, setToast] = useState(null);

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        const newErrors = {
            email: "",
            password: "",
        };

        let isValid = true;

        if (!email.trim()) {
            newErrors.email =
                "Email is required.";

            isValid = false;
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.trim()
            )
        ) {
            newErrors.email =
                "Please enter a valid email address.";

            isValid = false;
        }

        if (!password) {
            newErrors.password =
                "Password is required.";

            isValid = false;
        } else if (password.length < 6) {
            newErrors.password =
                "Password must be at least 6 characters.";

            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    /* =====================================================
       LOGIN
    ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFirebaseError("");
        setToast(null);

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email.trim(),
                    password
                );

            const user =
                userCredential.user;
            /* =================================================
                           LOCAL STORAGE
                        ================================================= */

            localStorage.setItem(
                "sonicLoggedIn",
                "true"
            );

            localStorage.setItem(
                "sonicUser",
                JSON.stringify({
                    uid: user.uid,

                    name:
                        user.displayName ||
                        user.email?.split("@")[0] ||
                        "Sonic User",

                    email:
                        user.email ||
                        email.trim(),

                    photoURL:
                        user.photoURL || "",
                })
            );
            /* =================================================
               VERIFY FIREBASE SESSION
            ================================================= */

            await user.getIdToken(true);

            setIsVerifying(true);

            const destination = await getPostAuthRoute(user);

            setTimeout(() => {
                navigate(destination, { replace: true });
            }, 2500);

        } catch (error) {
            const message =
                getFirebaseErrorMessage(
                    error
                );

            setFirebaseError(message);

            setToast({
                type: "error",
                message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    /* =====================================================
       EMAIL CHANGE
    ===================================================== */

    const handleEmailChange = (event) => {
        setEmail(event.target.value);

        if (errors.email) {
            setErrors((previous) => ({
                ...previous,
                email: "",
            }));
        }

        if (firebaseError) {
            setFirebaseError("");
        }
    };

    /* =====================================================
       PASSWORD CHANGE
    ===================================================== */

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);

        if (errors.password) {
            setErrors((previous) => ({
                ...previous,
                password: "",
            }));
        }

        if (firebaseError) {
            setFirebaseError("");
        }
    };

    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

    const handleForgotPassword = () => {
        setToast({
            type: "error",
            message:
                "Password reset will be available soon.",
        });
    };

    /* =====================================================
       GOOGLE LOGIN
    ===================================================== */

    const handleGoogleLogin = async () => {
        setFirebaseError("");
        setToast(null);

        try {
            setIsLoading(true);

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: "select_account",
            });

            const userCredential = await signInWithPopup(
                auth,
                provider
            );

            const user = userCredential.user;

            localStorage.setItem("sonicLoggedIn", "true");
            localStorage.setItem(
                "sonicUser",
                JSON.stringify({
                    uid: user.uid,
                    name:
                        user.displayName ||
                        user.email?.split("@")[0] ||
                        "Sonic User",
                    email: user.email || "",
                    photoURL: user.photoURL || "",
                })
            );
            /* =================================================
               VERIFY FIREBASE SESSION
            ================================================= */

            await user.getIdToken(true);

            const destination = await getPostAuthRoute(user);

            setIsVerifying(true);

            setTimeout(() => {
                navigate(destination, { replace: true });
            }, 2500);
        } catch (error) {
            const message = getSocialAuthErrorMessage(error);

            setFirebaseError(message);
            setToast({
                type: "error",
                message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    /* =====================================================
       FACEBOOK LOGIN
    ===================================================== */

    const handleFacebookLogin = async () => {
        setFirebaseError("");
        setToast(null);

        try {
            setIsLoading(true);

            const provider = new FacebookAuthProvider();
            provider.setCustomParameters({
                display: "popup",
            });

            const userCredential = await signInWithPopup(
                auth,
                provider
            );

            const user = userCredential.user;

            localStorage.setItem("sonicLoggedIn", "true");
            localStorage.setItem(
                "sonicUser",
                JSON.stringify({
                    uid: user.uid,
                    name:
                        user.displayName ||
                        user.email?.split("@")[0] ||
                        "Sonic User",
                    email: user.email || "",
                    photoURL: user.photoURL || "",
                })
            );
            /* =================================================
               VERIFY FIREBASE SESSION
            ================================================= */

            await user.getIdToken(true);

            const destination = await getPostAuthRoute(user);

            setIsVerifying(true);

            setTimeout(() => {
                navigate(destination, { replace: true });
            }, 2500);
        } catch (error) {
            const message = getSocialAuthErrorMessage(error);

            setFirebaseError(message);
            setToast({
                type: "error",
                message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    /* =====================================================
       RETURN
    ===================================================== */

    if (isVerifying) {
        return <AuthVerificationScreen />;
    }

    return (
        <div className="min-h-screen bg-[#070c0f] text-white">
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 1000px #10171b inset !important;
                    box-shadow: 0 0 0 1000px #10171b inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    caret-color: #ffffff !important;
                    border: none !important;
                    transition: background-color 9999s ease-in-out 0s !important;
                }

                input:-moz-autofill {
                    background-color: #10171b !important;
                    color: #ffffff !important;
                }
            `}</style>

            <div className="grid min-h-screen lg:grid-cols-2">

                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <div className="relative hidden overflow-hidden lg:block">

                    {/* Background Image */}

                    <img
                        src="/login-artist.png"
                        alt="Sonic"
                        className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                        "
                    />

                    {/* Gradient */}

                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-[#070c0f]
                            via-[#070c0f]/45
                            to-transparent
                        "
                    />

                    {/* Overlay */}

                    <div
                        className="
                            absolute
                            inset-0
                            bg-black/15
                        "
                    />

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <div
                        className="
                            absolute
                            left-10
                            top-10
                            z-10
                        "
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center"
                        >
                            <img
                                src="/sonic.png"
                                alt="Sonic"
                                className="
                                    h-[42px]
                                    w-auto
                                    object-contain
                                "
                            />
                        </Link>
                    </div>

                    {/* =================================================
                        LEFT CONTENT
                    ================================================= */}

                    <div
                        className="
                            absolute
                            bottom-12
                            left-10
                            right-10
                            z-10
                        "
                    >
                        <p
                            className="
                                mb-3
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-[0.25em]
                                text-[#10aaa9]
                            "
                        >
                            SONIC MUSIC
                        </p>

                        <h1
                            className="
                                max-w-[560px]
                                text-[42px]
                                font-bold
                                leading-[1.08]
                                tracking-[-0.02em]
                                text-white
                                xl:text-[50px]
                            "
                        >
                            Feel the melody.
                            <br />
                            Live the moment.
                        </h1>

                        <p
                            className="
                                mt-5
                                max-w-[430px]
                                text-[14px]
                                leading-6
                                text-white/60
                            "
                        >
                            Discover new sounds, save your
                            favorite tracks and enjoy music
                            made for every moment.
                        </p>
                    </div>

                </div>

                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div
                    className="
                        relative
                        flex
                        min-h-screen
                        items-center
                        justify-center
                        px-5
                        py-10
                        sm:px-8
                        lg:px-12
                    "
                >

                    {/* =================================================
                        MOBILE LOGO
                    ================================================= */}

                    <div
                        className="
                            absolute
                            left-6
                            top-6
                            lg:hidden
                        "
                    >
                        <Link to="/">
                            <img
                                src="/sonic.png"
                                alt="Sonic"
                                className="
                                    h-[38px]
                                    w-auto
                                    object-contain
                                "
                            />
                        </Link>
                    </div>

                    {/* =================================================
                        FORM WRAPPER
                    ================================================= */}

                    <div
                        className="
                            w-full
                            max-w-[440px]
                            pt-10
                            lg:pt-0
                        "
                    >

                        {/* =================================================
                            HEADING
                        ================================================= */}

                        <div className="mb-8">

                            <p
                                className="
                                    mb-3
                                    text-[11px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.2em]
                                    text-[#10aaa9]
                                "
                            >
                                WELCOME BACK
                            </p>

                            <h2
                                className="
                                    text-[30px]
                                    font-bold
                                    tracking-[-0.02em]
                                    text-white
                                    sm:text-[34px]
                                "
                            >
                                Welcome back
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-[13px]
                                    leading-6
                                    text-[#7f8a90]
                                "
                            >
                                Log in to continue listening to
                                your favorite music.
                            </p>

                        </div>

                        {/* =================================================
                            ERROR BOX
                        ================================================= */}

                        {firebaseError && !toast && (
                            <div
                                className="
                                    mb-5
                                    rounded-[6px]
                                    border
                                    border-red-500/15
                                    bg-red-500/[0.06]
                                    px-4
                                    py-3
                                "
                            >
                                <p
                                    className="
                                        text-[12px]
                                        leading-5
                                        text-red-400
                                    "
                                >
                                    {firebaseError}
                                </p>
                            </div>
                        )}

                        {/* =================================================
                            LOGIN FORM
                        ================================================= */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="
                                        mb-2
                                        block
                                        text-[12px]
                                        font-medium
                                        text-[#b2b9bc]
                                    "
                                >
                                    Email address
                                </label>

                                <div
                                    className={`
                                        flex
                                        h-[50px]
                                        items-center
                                        gap-3
                                        rounded-[5px]
                                        border
                                        bg-[#10171b]
                                        px-4
                                        transition

                                        ${errors.email
                                            ? "border-red-500/50"
                                            : "border-white/[0.08] focus-within:border-[#10aaa9]/60"
                                        }
                                    `}
                                >

                                    <Mail
                                        size={17}
                                        strokeWidth={1.7}
                                        className="
                                            shrink-0
                                            text-[#68747a]
                                        "
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={
                                            handleEmailChange
                                        }
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        disabled={isLoading}
                                        className="
                                            h-full
                                            min-w-0
                                            flex-1
                                            bg-transparent
                                            text-[13px]
                                            text-white
                                            outline-none
                                            placeholder:text-[#566168]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    />

                                </div>

                                {errors.email && (
                                    <p
                                        className="
                                            mt-1.5
                                            text-[11px]
                                            text-red-400
                                        "
                                    >
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                PASSWORD
                            ================================================= */}

                            <div>

                                <div
                                    className="
                                        mb-2
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <label
                                        htmlFor="password"
                                        className="
                                            block
                                            text-[12px]
                                            font-medium
                                            text-[#b2b9bc]
                                        "
                                    >
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        onClick={
                                            handleForgotPassword
                                        }
                                        className="
                                            text-[11px]
                                            font-medium
                                            text-[#10aaa9]
                                            transition
                                            hover:text-[#12c1bf]
                                        "
                                    >
                                        Forgot password?
                                    </button>

                                </div>

                                <div
                                    className={`
                                        flex
                                        h-[50px]
                                        items-center
                                        gap-3
                                        rounded-[5px]
                                        border
                                        bg-[#10171b]
                                        px-4
                                        transition

                                        ${errors.password
                                            ? "border-red-500/50"
                                            : "border-white/[0.08] focus-within:border-[#10aaa9]/60"
                                        }
                                    `}
                                >

                                    <Lock
                                        size={17}
                                        strokeWidth={1.7}
                                        className="
                                            shrink-0
                                            text-[#68747a]
                                        "
                                    />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        className="
                                            h-full
                                            min-w-0
                                            flex-1
                                            bg-transparent
                                            text-[13px]
                                            text-white
                                            outline-none
                                            placeholder:text-[#566168]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        disabled={isLoading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="
                                            flex
                                            h-7
                                            w-7
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-[#68747a]
                                            transition
                                            hover:bg-white/[0.05]
                                            hover:text-white
                                            disabled:opacity-40
                                        "
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>

                                </div>

                                {errors.password && (
                                    <p
                                        className="
                                            mt-1.5
                                            text-[11px]
                                            text-red-400
                                        "
                                    >
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                LOGIN BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="
                                    flex
                                    h-[50px]
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-[5px]
                                    bg-[#10aaa9]
                                    text-[13px]
                                    font-semibold
                                    text-white
                                    shadow-[0_8px_30px_rgba(16,170,169,0.12)]
                                    transition-all
                                    duration-200
                                    hover:bg-[#12b9b8]
                                    hover:shadow-[0_10px_35px_rgba(16,170,169,0.18)]
                                    active:scale-[0.99]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >

                                {isLoading ? (
                                    <>
                                        <span
                                            className="
                                                h-4
                                                w-4
                                                animate-spin
                                                rounded-full
                                                border-2
                                                border-white/30
                                                border-t-white
                                            "
                                        />

                                        <span>
                                            Logging in...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Log in
                                        </span>

                                        <ArrowRight
                                            size={16}
                                        />
                                    </>
                                )}

                            </button>

                        </form>

                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div
                            className="
                                my-7
                                flex
                                items-center
                                gap-4
                            "
                        >

                            <div
                                className="
                                    h-px
                                    flex-1
                                    bg-white/[0.07]
                                "
                            />

                            <span
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-[0.15em]
                                    text-[#59646a]
                                "
                            >
                                Or continue with
                            </span>

                            <div
                                className="
                                    h-px
                                    flex-1
                                    bg-white/[0.07]
                                "
                            />

                        </div>

                        {/* =================================================
                            SOCIAL BUTTONS
                        ================================================= */}

                        <div className="grid grid-cols-2 gap-3">

                            {/* =================================================
                                GOOGLE
                            ================================================= */}

                            <button
                                type="button"
                                onClick={
                                    handleGoogleLogin
                                }
                                className="
                                    flex
                                    h-[48px]
                                    items-center
                                    justify-center
                                    gap-2.5
                                    rounded-[5px]
                                    border
                                    border-white/[0.08]
                                    bg-[#10171b]
                                    text-[12px]
                                    font-medium
                                    text-[#c5cbce]
                                    transition
                                    hover:border-white/[0.14]
                                    hover:bg-[#141d21]
                                    hover:text-white
                                "
                            >

                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 48 48"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="shrink-0"
                                >
                                    <path
                                        fill="#FFC107"
                                        d="M43.6 20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11.6 0 19.3-8.1 19.3-19.5 0-1.3-.1-2.7-.3-4.5h.6z"
                                    />

                                    <path
                                        fill="#FF3D00"
                                        d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"
                                    />

                                    <path
                                        fill="#4CAF50"
                                        d="M24 44c5.1 0 9.8-1.9 13.3-5.1l-6.2-5.2C29.1 35.2 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"
                                    />

                                    <path
                                        fill="#1976D2"
                                        d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.7l6.2 5.2C40.9 35.6 44 30 44 24c0-1.3-.1-2.7-.4-4z"
                                    />
                                </svg>

                                Continue with Google
                            </button>

                            {/* =================================================
                                FACEBOOK
                            ================================================= */}

                            <button
                                type="button"
                                onClick={
                                    handleFacebookLogin
                                }
                                className="
                                    flex
                                    h-[48px]
                                    items-center
                                    justify-center
                                    gap-2.5
                                    rounded-[5px]
                                    border
                                    border-white/[0.08]
                                    bg-[#10171b]
                                    text-[12px]
                                    font-medium
                                    text-[#c5cbce]
                                    transition
                                    hover:border-white/[0.14]
                                    hover:bg-[#141d21]
                                    hover:text-white
                                "
                            >

                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="shrink-0"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="12"
                                        fill="#1877F2"
                                    />

                                    <path
                                        fill="#FFFFFF"
                                        d="M13.6 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.8v8h3.4z"
                                    />
                                </svg>

                                Continue with Facebook
                            </button>

                        </div>

                        {/* =================================================
                            SIGNUP
                        ================================================= */}

                        <p
                            className="
                                mt-7
                                text-center
                                text-[12px]
                                text-[#69757b]
                            "
                        >
                            Don't have an account?{" "}

                            <Link
                                to="/signup"
                                className="
                                    font-medium
                                    text-[#10aaa9]
                                    transition
                                    hover:text-[#12c1bf]
                                "
                            >
                                Sign up
                            </Link>
                        </p>

                        {/* =================================================
                            CONTINUE WITHOUT LOGIN
                        ================================================= */}

                        <div className="mt-5 text-center">

                            <Link
                                to="/"
                                className="
                                    text-[11px]
                                    text-[#59656b]
                                    transition
                                    hover:text-[#8b969d]
                                "
                            >
                                Continue browsing without login
                            </Link>

                        </div>

                    </div>
                </div>

            </div>

            {/* =================================================
                BOTTOM CENTER TOAST
            ================================================= */}

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() =>
                        setToast(null)
                    }
                />
            )}

        </div>
    );
}