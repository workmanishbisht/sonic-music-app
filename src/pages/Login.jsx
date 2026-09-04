import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Mail,
    LockKeyhole,
    ArrowLeft,
} from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove error while typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const email = formData.email.trim();
        const password = formData.password;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = "Email is required.";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        // Temporary authentication
        // Firebase Auth baad mein yahan connect hoga
        localStorage.setItem("sonicLoggedIn", "true");

        // Login ke baad Home par redirect
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#04090b] p-4 md:p-6">
            <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1465px] overflow-hidden rounded-[16px] border border-white/[0.10] bg-[#0b1114]">

                {/* ================= LEFT SECTION ================= */}
                <div className="relative hidden w-1/2 overflow-hidden lg:block">

                    {/* Background */}
                    <div className="absolute inset-0 bg-[#031316]" />

                    {/* Teal Glow */}
                    <div className="absolute left-[35%] top-[20%] h-[450px] w-[450px] rounded-full bg-[#10aaa9]/20 blur-[100px]" />

                    {/* Artist Image */}
                    <img
                        src="/login-artist.png"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#031316]/20 via-[#031316]/10 to-[#04090b]" />

                    {/* Sonic Logo */}
                    <div className="relative z-10 px-9 pt-9">
                        <img
                            src="/sonic.png"
                            alt="Sonic"
                            className="h-auto w-[155px] object-contain"
                        />
                    </div>

                    {/* Left Bottom Content */}
                    <div className="absolute bottom-16 left-9 z-10 max-w-[580px]">
                        <h2 className="text-[46px] font-semibold leading-[1.15] tracking-[-1.8px] text-white">
                            Feel the{" "}
                            <span className="text-[#10aaa9]">melody.</span>
                            <br />
                            Live the moment.
                        </h2>

                        <div className="mt-7 h-[3px] w-11 bg-[#10aaa9]" />

                        <p className="mt-6 max-w-[500px] text-[17px] leading-7 text-[#b7c0c4]">
                            Sonic brings timeless classics and modern hits together in one
                            place.
                        </p>
                    </div>
                </div>

                {/* ================= RIGHT SECTION ================= */}
                <div className="flex w-full items-center justify-center bg-[#0b1114] px-6 py-8 md:px-10 lg:w-1/2 lg:px-12 xl:px-14">
                    <div className="w-full max-w-[600px]">

                        {/* Mobile Back */}
                        <Link
                            to="/"
                            className="mb-6 inline-flex items-center gap-2 text-[12px] text-[#7f8a90] transition hover:text-white lg:hidden"
                        >
                            <ArrowLeft size={15} />
                            Back to Sonic
                        </Link>

                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-[34px] font-semibold tracking-[-1.1px] text-white md:text-[36px]">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-[16px] text-[#aab3b7]">
                                Log in to continue to{" "}
                                <span className="text-[#10aaa9]">Sonic</span>
                            </p>
                        </div>

                        {/* ================= LOGIN FORM ================= */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                            noValidate
                        >

                            {/* Email */}
                            <div>
                                <label className="mb-2.5 block text-[14px] font-medium text-white">
                                    Email
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={19}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email
                                            ? "text-red-400"
                                            : "text-[#909b9f]"
                                            }`}
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        className={`h-[58px] w-full rounded-[10px] border bg-[#11181c] pl-[56px] pr-5 text-[14px] text-white outline-none transition placeholder:text-[#899398] hover:border-white/[0.16] focus:bg-[#131c20] ${errors.email
                                            ? "border-red-500/70 focus:border-red-500"
                                            : "border-white/[0.10] focus:border-[#10aaa9]"
                                            }`}
                                    />
                                </div>

                                {errors.email && (
                                    <p className="mt-2 text-[12px] text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2.5 block text-[14px] font-medium text-white">
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={19}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password
                                            ? "text-red-400"
                                            : "text-[#909b9f]"
                                            }`}
                                    />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className={`h-[58px] w-full rounded-[10px] border bg-[#11181c] pl-[56px] pr-[56px] text-[14px] text-white outline-none transition placeholder:text-[#899398] hover:border-white/[0.16] focus:bg-[#131c20] ${errors.password
                                            ? "border-red-500/70 focus:border-red-500"
                                            : "border-white/[0.10] focus:border-[#10aaa9]"
                                            }`}
                                    />

                                    {/* Show / Hide Password */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#909b9f] transition hover:text-white"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-2 text-[12px] text-red-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password */}
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    className="text-[13px] font-medium text-[#10aaa9] transition hover:text-[#16c7c4]"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="h-[58px] w-full rounded-[10px] bg-[#10aaa9] text-[15px] font-semibold text-white shadow-[0_8px_30px_rgba(16,170,169,0.14)] transition hover:bg-[#12bdbc] active:scale-[0.99]"
                            >
                                Log In
                            </button>
                        </form>

                        {/* ================= DIVIDER ================= */}
                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/[0.10]" />

                            <span className="whitespace-nowrap text-[13px] text-[#8f999d]">
                                or continue with
                            </span>

                            <div className="h-px flex-1 bg-white/[0.10]" />
                        </div>

                        {/* ================= SOCIAL LOGIN ================= */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                            {/* Google */}
                            <button
                                type="button"
                                className="flex h-[58px] items-center justify-center gap-3 rounded-[10px] border border-white/[0.10] bg-[#11181c] text-[13px] font-medium text-white transition hover:border-white/[0.18] hover:bg-[#151e22]"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
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

                            {/* Facebook */}
                            <button
                                type="button"
                                className="flex h-[58px] items-center justify-center gap-3 rounded-[10px] border border-white/[0.10] bg-[#11181c] text-[13px] font-medium text-white transition hover:border-white/[0.18] hover:bg-[#151e22]"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
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

                        {/* ================= SIGN UP ================= */}
                        <div className="mt-7 text-center text-[13px] text-[#a4adb1]">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-medium text-[#10aaa9] transition hover:text-[#16c7c4]"
                            >
                                Create account
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}