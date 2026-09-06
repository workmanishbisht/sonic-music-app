import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    User,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    X,
} from "lucide-react";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

/* =========================================================
   TOAST
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
                        <CheckCircle2 size={21} strokeWidth={2} />
                    ) : (
                        <XCircle size={21} strokeWidth={2} />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-white">
                        {isSuccess
                            ? "Account Created"
                            : "Signup failed"}
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
        case "auth/email-already-in-use":
            return "An account already exists with this email.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password is too weak. Use at least 6 characters.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/operation-not-allowed":
            return "Email and password signup is not enabled.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        default:
            return "Unable to create your account. Please try again.";
    }
}

/* =========================================================
   SIGNUP PAGE
========================================================= */

export default function Signup() {
    const navigate = useNavigate();

    /* =====================================================
       STATES
    ===================================================== */

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    const [errors, setErrors] = useState({});

    const [firebaseError, setFirebaseError] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [toast, setToast] = useState(null);

    /* =====================================================
       HANDLE CHANGE
    ===================================================== */

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (firebaseError) {
            setFirebaseError("");
        }
    };

    /* =====================================================
       VALIDATE FORM
    ===================================================== */

    const validateForm = () => {
        const newErrors = {};

        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;
        const confirmPassword =
            formData.confirmPassword;

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        /* Full Name */

        if (!name) {
            newErrors.name =
                "Full name is required.";
        } else if (name.length < 2) {
            newErrors.name =
                "Name must be at least 2 characters.";
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            newErrors.name =
                "Name can only contain letters.";
        }

        /* Email */

        if (!email) {
            newErrors.email =
                "Email is required.";
        } else if (!emailRegex.test(email)) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        /* Password */

        if (!password) {
            newErrors.password =
                "Password is required.";
        } else if (password.length < 6) {
            newErrors.password =
                "Password must be at least 6 characters.";
        }

        /* Confirm Password */

        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password.";
        } else if (
            confirmPassword !== password
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        /* Terms */

        if (!formData.terms) {
            newErrors.terms =
                "Please accept the Terms of Service and Privacy Policy.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    /* =====================================================
       CREATE ACCOUNT
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setFirebaseError("");
        setToast(null);

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        try {
            setIsLoading(true);

            /* Create Firebase account */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    formData.email.trim(),
                    formData.password
                );

            const user = userCredential.user;

            /* Save user's name in Firebase */

            await updateProfile(user, {
                displayName:
                    formData.name.trim(),
            });

            console.log(
                "Firebase Signup Successful:",
                user
            );

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
                    name: formData.name.trim(),
                    email:
                        user.email ||
                        formData.email.trim(),
                    photoURL:
                        user.photoURL || "",
                })
            );

            /* =================================================
               SUCCESS TOAST
            ================================================= */

            setToast({
                type: "success",
                message:
                    "Your Sonic account has been created successfully.",
            });

            /* =================================================
               REDIRECT
            ================================================= */

            setTimeout(() => {
                navigate("/");
            }, 1400);
        } catch (error) {
            console.error(
                "Firebase Signup Error:",
                error
            );

            const message =
                getFirebaseErrorMessage(error);

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
       GOOGLE SIGNUP
    ===================================================== */

    const handleGoogleSignup = async () => {
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

            setToast({
                type: "success",
                message: "Your Sonic account is ready.",
            });

            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (error) {
            console.error("Google Signup Error:", error);

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
       FACEBOOK SIGNUP
    ===================================================== */

    const handleFacebookSignup = async () => {
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

            setToast({
                type: "success",
                message: "Your Sonic account is ready.",
            });

            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (error) {
            console.error("Facebook Signup Error:", error);

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
       JSX
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#04090b] p-4 md:p-6">

            <div
                className="
                    mx-auto
                    flex
                    min-h-[calc(100vh-32px)]
                    max-w-[1465px]
                    overflow-hidden
                    rounded-[16px]
                    border
                    border-white/[0.10]
                    bg-[#0b1114]
                "
            >

                {/* =================================================
                    LEFT SECTION
                ================================================= */}

                <div className="relative hidden w-1/2 overflow-hidden lg:block">

                    {/* Background */}

                    <div className="absolute inset-0 bg-[#031316]" />

                    {/* Glow */}

                    <div
                        className="
                            absolute
                            left-[35%]
                            top-[20%]
                            h-[450px]
                            w-[450px]
                            rounded-full
                            bg-[#10aaa9]/20
                            blur-[100px]
                        "
                    />

                    {/* Artist Image */}

                    <img
                        src="/signup-artist.png"
                        alt=""
                        className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                            object-center
                            opacity-90
                        "
                    />

                    {/* Overlay */}

                    <div
                        className="
                            absolute
                            inset-0
                            bg-gradient-to-b
                            from-[#031316]/20
                            via-[#031316]/10
                            to-[#04090b]
                        "
                    />

                    {/* Sonic Logo */}

                    <div
                        className="
                            relative
                            z-10
                            px-9
                            pt-9
                        "
                    >
                        <img
                            src="/sonic.png"
                            alt="Sonic"
                            className="
                                h-auto
                                w-[155px]
                                object-contain
                            "
                        />
                    </div>

                    {/* Bottom Content */}

                    <div
                        className="
                            absolute
                            bottom-16
                            left-9
                            z-10
                            max-w-[580px]
                        "
                    >
                        <h2
                            className="
                                text-[46px]
                                font-semibold
                                leading-[1.15]
                                tracking-[-1.8px]
                                text-white
                            "
                        >
                            Your music.
                            <br />

                            <span className="text-[#10aaa9]">
                                Your moment.
                            </span>
                        </h2>

                        <div
                            className="
                                mt-7
                                h-[3px]
                                w-11
                                bg-[#10aaa9]
                            "
                        />

                        <p
                            className="
                                mt-6
                                max-w-[500px]
                                text-[17px]
                                leading-7
                                text-[#b7c0c4]
                            "
                        >
                            Create your Sonic account and
                            discover music that feels like you.
                        </p>
                    </div>
                </div>

                {/* =================================================
                    RIGHT SECTION
                ================================================= */}

                <div
                    className="
                        flex
                        w-full
                        items-center
                        justify-center
                        bg-[#0b1114]
                        px-6
                        py-8
                        md:px-10
                        lg:w-1/2
                        lg:px-12
                        xl:px-14
                    "
                >

                    <div className="w-full max-w-[600px]">

                        {/* =================================================
                            MOBILE BACK
                        ================================================= */}

                        <Link
                            to="/"
                            className="
                                mb-6
                                inline-flex
                                items-center
                                gap-2
                                text-[12px]
                                text-[#7f8a90]
                                transition
                                hover:text-white
                                lg:hidden
                            "
                        >
                            <ArrowLeft size={15} />
                            Back to Sonic
                        </Link>

                        {/* =================================================
                            HEADING
                        ================================================= */}

                        <div className="mb-7">

                            <h2
                                className="
                                    text-[34px]
                                    font-semibold
                                    tracking-[-1.1px]
                                    text-white
                                    md:text-[36px]
                                "
                            >
                                Create your account
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-[16px]
                                    text-[#aab3b7]
                                "
                            >
                                Join Sonic and start your
                                musical journey
                            </p>

                        </div>

                        {/* =================================================
                            FIREBASE ERROR
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
                            FORM
                        ================================================= */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            noValidate
                        >

                            {/* =================================================
                                FULL NAME
                            ================================================= */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-[12px]
                                        font-medium
                                        text-[#b2b9bc]
                                    "
                                >
                                    Full name
                                </label>

                                <div
                                    className={`
                                        relative
                                        flex
                                        h-[50px]
                                        items-center
                                        rounded-[5px]
                                        border
                                        bg-[#10171b]
                                        transition
                                        ${errors.name
                                            ? "border-red-500/70"
                                            : "border-white/[0.08] focus-within:border-[#10aaa9]/60"
                                        }
                                    `}
                                >

                                    <User
                                        size={17}
                                        strokeWidth={1.7}
                                        className={`
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            ${errors.name
                                                ? "text-red-400"
                                                : "text-[#68747a]"
                                            }
                                        `}
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                        disabled={isLoading}
                                        className="
                                            h-full
                                            w-full
                                            min-w-0
                                            bg-transparent
                                            pl-[48px]
                                            pr-4
                                            text-[13px]
                                            text-white
                                            outline-none
                                            placeholder:text-[#566168]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    />

                                </div>

                                {errors.name && (
                                    <p
                                        className="
                                            mt-1.5
                                            text-[11px]
                                            text-red-400
                                        "
                                    >
                                        {errors.name}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-[12px]
                                        font-medium
                                        text-[#b2b9bc]
                                    "
                                >
                                    Email
                                </label>

                                <div
                                    className={`
                                        relative
                                        flex
                                        h-[50px]
                                        items-center
                                        rounded-[5px]
                                        border
                                        bg-[#10171b]
                                        transition
                                        ${errors.email
                                            ? "border-red-500/70"
                                            : "border-white/[0.08] focus-within:border-[#10aaa9]/60"
                                        }
                                    `}
                                >

                                    <Mail
                                        size={17}
                                        strokeWidth={1.7}
                                        className={`
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            ${errors.email
                                                ? "text-red-400"
                                                : "text-[#68747a]"
                                            }
                                        `}
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        disabled={isLoading}
                                        className="
                                            h-full
                                            w-full
                                            min-w-0
                                            bg-transparent
                                            pl-[48px]
                                            pr-4
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

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-[12px]
                                        font-medium
                                        text-[#b2b9bc]
                                    "
                                >
                                    Password
                                </label>

                                <div
                                    className={`
                                        relative
                                        flex
                                        h-[50px]
                                        items-center
                                        rounded-[5px]
                                        border
                                        bg-[#10171b]
                                        transition
                                        ${errors.password
                                            ? "border-red-500/70"
                                            : "border-white/[0.08] focus-within:border-[#10aaa9]/60"
                                        }
                                    `}
                                >

                                    <LockKeyhole
                                        size={17}
                                        strokeWidth={1.7}
                                        className={`
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            ${errors.password
                                                ? "text-red-400"
                                                : "text-[#68747a]"
                                            }
                                        `}
                                    />

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                        className="
                                            h-full
                                            w-full
                                            min-w-0
                                            bg-transparent
                                            pl-[48px]
                                            pr-[48px]
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
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            flex
                                            h-7
                                            w-7
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-[#68747a]
                                            transition
                                            hover:bg-white/[0.05]
                                            hover:text-white
                                            disabled:opacity-40
                                        "
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
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
                                CONFIRM PASSWORD
                            ================================================= */}

                            <div>

                                <label
                                    className="
                                        mb-2
                                        block
                                        text-[12px]
                                        font-medium
                                        text-[#b2b9bc]
                                    "
                                >
                                    Confirm password
                                </label>

                                <div
                                    className={`
                                        relative
                                        flex
                                        h-[50px]
                                        items-center
                                        rounded-[5px]
                                        border
                                        bg-[#10171b]
                                        transition
                                        ${errors.confirmPassword
                                            ? "border-red-500/70"
                                            : "border-white/[0.08] focus-within:border-[#10aaa9]/60"
                                        }
                                    `}
                                >

                                    <LockKeyhole
                                        size={17}
                                        strokeWidth={1.7}
                                        className={`
                                            absolute
                                            left-4
                                            top-1/2
                                            -translate-y-1/2
                                            ${errors.confirmPassword
                                                ? "text-red-400"
                                                : "text-[#68747a]"
                                            }
                                        `}
                                    />

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                        className="
                                            h-full
                                            w-full
                                            min-w-0
                                            bg-transparent
                                            pl-[48px]
                                            pr-[48px]
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
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        disabled={isLoading}
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            flex
                                            h-7
                                            w-7
                                            -translate-y-1/2
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-[#68747a]
                                            transition
                                            hover:bg-white/[0.05]
                                            hover:text-white
                                            disabled:opacity-40
                                        "
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>

                                </div>

                                {errors.confirmPassword && (
                                    <p
                                        className="
                                            mt-1.5
                                            text-[11px]
                                            text-red-400
                                        "
                                    >
                                        {errors.confirmPassword}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                TERMS
                            ================================================= */}

                            <div>

                                <label
                                    className="
                                        flex
                                        cursor-pointer
                                        items-start
                                        gap-2.5
                                        pt-1
                                    "
                                >

                                    <input
                                        type="checkbox"
                                        name="terms"
                                        checked={formData.terms}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        className="
                                            mt-[2px]
                                            h-4
                                            w-4
                                            shrink-0
                                            accent-[#10aaa9]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[11px]
                                            leading-5
                                            text-[#7f8a90]
                                        "
                                    >
                                        I agree to the{" "}

                                        <button
                                            type="button"
                                            className="
                                                text-[#10aaa9]
                                                transition
                                                hover:text-[#16c7c4]
                                            "
                                        >
                                            Terms of Service
                                        </button>{" "}

                                        and{" "}

                                        <button
                                            type="button"
                                            className="
                                                text-[#10aaa9]
                                                transition
                                                hover:text-[#16c7c4]
                                            "
                                        >
                                            Privacy Policy
                                        </button>
                                    </span>

                                </label>

                                {errors.terms && (
                                    <p
                                        className="
                                            mt-1.5
                                            text-[11px]
                                            text-red-400
                                        "
                                    >
                                        {errors.terms}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                CREATE ACCOUNT
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
                                            Creating account...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Create Account
                                        </span>

                                        <ArrowLeft
                                            size={0}
                                            className="hidden"
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
                                my-6
                                flex
                                items-center
                                gap-4
                            "
                        >

                            <div
                                className="
                                    h-px
                                    flex-1
                                    bg-white/[0.10]
                                "
                            />

                            <span
                                className="
                                    whitespace-nowrap
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
                                    bg-white/[0.10]
                                "
                            />

                        </div>

                        {/* =================================================
                            SOCIAL LOGIN
                        ================================================= */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-3
                                sm:grid-cols-2
                            "
                        >

                            {/* =================================================
                                GOOGLE
                            ================================================= */}

                            <button
                                type="button"
                                onClick={
                                    handleGoogleSignup
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
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M21.805 12.23c0-.79-.07-1.55-.205-2.28H12v4.31h5.49a4.69 4.69 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.055-4.4 3.055-7.67Z"
                                        fill="#4285F4"
                                    />

                                    <path
                                        d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.3-2.56c-.91.61-2.07.97-3.47.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10.22 10.22 0 0 0 12 22Z"
                                        fill="#34A853"
                                    />

                                    <path
                                        d="M6.25 13.72A6.14 6.14 0 0 1 5.93 12c0-.6.11-1.18.32-1.72V7.64H2.84A10 10 0 0 0 1.78 12c0 1.61.39 3.13 1.06 4.36l3.41-2.64Z"
                                        fill="#FBBC05"
                                    />

                                    <path
                                        d="M12 6.06c1.5 0 2.85.52 3.91 1.54l2.93-2.93C17.08 3.05 14.76 2 12 2a10.22 10.22 0 0 0-9.16 5.64l3.41 2.64C7.06 7.86 9.33 6.06 12 6.06Z"
                                        fill="#EA4335"
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
                                    handleFacebookSignup
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
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M24 12C24 5.373 18.627 0 12 0S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953h-1.514c-1.49 0-1.955.925-1.955 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12Z"
                                        fill="#1877F2"
                                    />

                                    <path
                                        d="M16.671 15.469L17.203 12h-3.328V9.75c0-.95.465-1.875 1.955-1.875h1.514V4.922s-1.374-.234-2.686-.234c-2.741 0-4.533 1.661-4.533 4.668V12H7.078v3.469h3.047v8.385a12.08 12.08 0 0 0 3.75 0v-8.385h2.796Z"
                                        fill="#FFFFFF"
                                    />
                                </svg>

                                Continue with Facebook
                            </button>

                        </div>

                        {/* =================================================
                            LOGIN LINK
                        ================================================= */}

                        <div
                            className="
                                mt-6
                                text-center
                                text-[12px]
                                text-[#69757b]
                            "
                        >
                            Already have an account?{" "}

                            <Link
                                to="/login"
                                className="
                                    font-medium
                                    text-[#10aaa9]
                                    transition
                                    hover:text-[#12c1bf]
                                "
                            >
                                Log in
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* =================================================
                CENTER TOAST
            ================================================= */}

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

        </div>
    );
}