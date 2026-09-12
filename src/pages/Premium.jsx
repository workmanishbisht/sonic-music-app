import { useEffect, useMemo, useRef, useState } from "react";
import {
    Check,
    Crown,
    Headphones,
    Music2,
    Download,
    Sparkles,
    ShieldCheck,
    Zap,
    HelpCircle,
    Loader2,
    CreditCard,
    X,
} from "lucide-react";
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";


const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), {
                once: true,
            });
            existingScript.addEventListener("error", () => resolve(false), {
                once: true,
            });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });

const getCheckoutAmount = (price, billing) => {
    const numericPrice = Number(price) || 0;

    // Send the amount in rupees to the backend.
    // The backend converts rupees to paise before creating
    // the Razorpay order.
    return billing === "yearly"
        ? numericPrice * 12
        : numericPrice;
};

const plans = [
    {
        id: "monthly",
        name: "Premium",
        description: "Everything you need for a better music experience.",
        monthlyPrice: 99,
        yearlyPrice: 79,
        period: "/ month",
        popular: true,
        features: [
            "Ad-free music",
            "Unlimited skips",
            "High quality audio",
            "Offline listening",
            "Unlimited playlists",
        ],
    },
    {
        id: "family",
        name: "Premium Family",
        description: "Premium music for everyone in your family.",
        monthlyPrice: 179,
        yearlyPrice: 149,
        period: "/ month",
        popular: false,
        features: [
            "Everything in Premium",
            "Up to 6 accounts",
            "Individual music libraries",
            "Family-friendly controls",
            "Offline listening",
        ],
    },
];

const benefits = [
    {
        icon: Headphones,
        title: "Ad-Free Music",
        description:
            "Enjoy your favorite songs without interruptions.",
    },
    {
        icon: Download,
        title: "Listen Offline",
        description:
            "Download songs and enjoy them anywhere, anytime.",
    },
    {
        icon: Music2,
        title: "High Quality Audio",
        description:
            "Experience your music with rich and detailed sound.",
    },
    {
        icon: Zap,
        title: "Unlimited Skips",
        description:
            "Skip any song and play exactly what you want.",
    },
];

const faqs = [
    {
        question: "Can I cancel my Premium subscription anytime?",
        answer:
            "Yes. You can cancel your subscription anytime. Your Premium benefits will remain active until the end of your billing period.",
    },
    {
        question: "Can I listen to music offline?",
        answer:
            "Yes. Premium members can download supported songs and listen to them offline.",
    },
    {
        question: "What happens when my subscription ends?",
        answer:
            "Your account will return to the Free plan. Your playlists and saved music will remain available.",
    },
    {
        question: "Can I switch between monthly and yearly plans?",
        answer:
            "Yes. You can change your subscription plan whenever the option is available for your account.",
    },
];

const getSubscriptionEndDate = (billing) => {
    const date = new Date();

    if (billing === "yearly") {
        date.setFullYear(date.getFullYear() + 1);
    } else {
        date.setMonth(date.getMonth() + 1);
    }

    return date;
};

export default function Premium() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [billing, setBilling] = useState("monthly");
    const [openFaq, setOpenFaq] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [toast, setToast] = useState(null);
    const paymentCompletedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const loadSubscription = async () => {
            if (!user) {
                setSubscription(null);
                setLoadingSubscription(false);
                return;
            }

            try {
                setLoadingSubscription(true);

                const userSnap = await getDoc(
                    doc(db, "users", user.uid)
                );

                if (!cancelled && userSnap.exists()) {
                    const data = userSnap.data();

                    setSubscription(
                        data.subscription || null
                    );
                }
            } catch (error) {
                console.error(
                    "Subscription loading error:",
                    error
                );
            } finally {
                if (!cancelled) {
                    setLoadingSubscription(false);
                }
            }
        };

        loadSubscription();

        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast]);

    const activeSubscription = useMemo(() => {
        if (!subscription) return null;

        const endDate = subscription.endDate?.toDate
            ? subscription.endDate.toDate()
            : subscription.endDate
                ? new Date(subscription.endDate)
                : null;

        if (endDate && endDate < new Date()) {
            return null;
        }

        return subscription;
    }, [subscription]);

    const selectedPlanData = plans.find(
        (plan) => plan.id === selectedPlan
    );

    const getPlanPrice = (plan) =>
        billing === "monthly"
            ? plan.monthlyPrice
            : plan.yearlyPrice;

    const handleUpgrade = (plan) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (activeSubscription) {
            setToast({
                type: "info",
                message: "You already have an active Premium subscription.",
            });
            return;
        }

        setSelectedPlan(plan.id);
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (!user || !selectedPlanData) return;

        if (!RAZORPAY_KEY_ID) {
            setToast({
                type: "error",
                message:
                    "Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to your .env file.",
            });
            return;
        }

        try {
            setProcessingPayment(true);
            paymentCompletedRef.current = false;

            const price = getPlanPrice(selectedPlanData);
            const amount = getCheckoutAmount(price, billing);

            // 1. Create a Razorpay order on the secure backend.
            const orderResponse = await fetch(
                `${API_BASE_URL}/api/payment/create-order`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount,
                        currency: "INR",
                        planId: selectedPlanData.id,
                        planName: selectedPlanData.name,
                        billingCycle: billing,
                        userId: user.uid,
                    }),
                }
            );

            const orderData = await orderResponse.json();

            if (!orderResponse.ok || !orderData?.order?.id) {
                throw new Error(
                    orderData?.message || "Unable to create Razorpay order."
                );
            }

            const razorpayLoaded = await loadRazorpayScript();

            if (!razorpayLoaded || !window.Razorpay) {
                throw new Error(
                    "Razorpay Checkout could not be loaded. Check your internet connection."
                );
            }

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: orderData.order.currency || "INR",
                name: "Sonic",
                description: `${selectedPlanData.name} - ${billing === "yearly" ? "Yearly" : "Monthly"
                    }`,
                order_id: orderData.order.id,

                prefill: {
                    name:
                        user.displayName ||
                        user.email?.split("@")[0] ||
                        "Sonic User",
                    email: user.email || "",
                },

                notes: {
                    userId: user.uid,
                    planId: selectedPlanData.id,
                    billingCycle: billing,
                },

                theme: {
                    color: "#10aaa9",
                },

                modal: {
                    ondismiss: () => {
                        if (!paymentCompletedRef.current) {
                            setProcessingPayment(false);
                            setToast({
                                type: "info",
                                message: "Payment cancelled.",
                            });
                        }
                    },
                },

                handler: async (response) => {
                    try {
                        setProcessingPayment(true);

                        // 2. Verify the Razorpay signature on the backend.
                        const verifyResponse = await fetch(
                            `${API_BASE_URL}/api/payment/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_signature:
                                        response.razorpay_signature,
                                    userId: user.uid,
                                    planId: selectedPlanData.id,
                                    planName: selectedPlanData.name,
                                    billingCycle: billing,
                                    price,
                                }),
                            }
                        );

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData?.verified) {
                            throw new Error(
                                verifyData?.message ||
                                "Payment verification failed."
                            );
                        }

                        // 3. Only after successful verification, activate
                        // the subscription in the user's Firestore document.
                        const startDate = new Date();
                        const endDate = getSubscriptionEndDate(billing);

                        const subscriptionData = {
                            status: "active",
                            planId: selectedPlanData.id,
                            planName: selectedPlanData.name,
                            billingCycle: billing,
                            price,
                            currency: "INR",
                            startDate,
                            endDate,
                            paymentStatus: "paid",
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId:
                                response.razorpay_payment_id,
                            updatedAt: serverTimestamp(),
                        };

                        await setDoc(
                            doc(db, "users", user.uid),
                            {
                                subscription: subscriptionData,
                                updatedAt: serverTimestamp(),
                            },
                            { merge: true }
                        );

                        paymentCompletedRef.current = true;
                        setSubscription(subscriptionData);
                        setShowPaymentModal(false);
                        setSelectedPlan(null);

                        setToast({
                            type: "success",
                            message: `${selectedPlanData.name} activated successfully.`,
                        });
                    } catch (error) {
                        console.error(
                            "Razorpay payment verification error:",
                            error
                        );

                        setToast({
                            type: "error",
                            message:
                                error?.message ||
                                "Payment verification failed. Please contact support if your amount was deducted.",
                        });
                    } finally {
                        setProcessingPayment(false);
                    }
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                console.error("Razorpay payment failed:", response?.error);

                setProcessingPayment(false);
                setToast({
                    type: "error",
                    message:
                        response?.error?.description ||
                        "Payment failed. Please try again.",
                });
            });

            razorpay.open();
        } catch (error) {
            console.error("Razorpay checkout error:", error);

            setProcessingPayment(false);

            setToast({
                type: "error",
                message:
                    error?.message ||
                    "Unable to start payment. Please try again.",
            });
        }
    };

    const handleCancelSubscription = async () => {
        if (!user || !activeSubscription) return;

        try {
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

            setSubscription((current) => ({
                ...current,
                cancelAtPeriodEnd: true,
            }));

            setToast({
                type: "success",
                message:
                    "Subscription cancellation scheduled for the end of your billing period.",
            });
        } catch (error) {
            console.error(
                "Subscription cancellation error:",
                error
            );

            setToast({
                type: "error",
                message:
                    "Unable to update your subscription.",
            });
        }
    };

    const formatDate = (value) => {
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

    return (
        <div className="relative overflow-hidden py-8 sm:py-10 lg:py-12">
            {/* BACKGROUND GLOW */}
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#10aaa9]/[0.06] blur-[120px]" />

            {/* HERO */}
            <section className="mx-auto max-w-5xl text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#10aaa9]/20 bg-[#10aaa9]/10 text-[#10aaa9]">
                    <Crown size={23} />
                </div>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#10aaa9]/20 bg-[#10aaa9]/10 px-3 py-1.5">
                    <Sparkles size={12} className="text-[#10aaa9]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#10aaa9]">
                        Sonic Premium
                    </span>
                </div>

                <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Music without
                    <span className="text-[#10aaa9]"> limits.</span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-[12px] leading-6 text-[#7f8a90] sm:text-[13px]">
                    Upgrade to Sonic Premium and enjoy your favorite music
                    without ads, with better sound quality and the freedom
                    to listen anywhere.
                </p>
            </section>

            {/* ACTIVE SUBSCRIPTION */}
            {activeSubscription && (
                <section className="mx-auto mt-8 max-w-4xl">
                    <div className="rounded-[8px] border border-[#10aaa9]/25 bg-[#10aaa9]/[0.06] p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[#10aaa9]/10 text-[#10aaa9]">
                                    <Crown size={19} />
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-[13px] font-semibold text-white">
                                            {activeSubscription.planName}
                                        </h2>

                                        <span className="rounded-full bg-[#10aaa9]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#10aaa9]">
                                            Active
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[10px] text-[#7f8a90]">
                                        {activeSubscription.billingCycle === "yearly"
                                            ? "Yearly"
                                            : "Monthly"}{" "}
                                        · ₹
                                        {activeSubscription.price}/month
                                        {" · "}
                                        Renews until{" "}
                                        {formatDate(
                                            activeSubscription.endDate
                                        )}
                                    </p>

                                    {activeSubscription.cancelAtPeriodEnd && (
                                        <p className="mt-2 text-[10px] text-amber-400">
                                            Cancellation is scheduled for the end
                                            of your billing period.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {!activeSubscription.cancelAtPeriodEnd && (
                                <button
                                    type="button"
                                    onClick={handleCancelSubscription}
                                    className="h-9 shrink-0 rounded-[4px] border border-white/[0.08] px-4 text-[10px] font-medium text-[#a3adb2] transition hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300"
                                >
                                    Cancel Subscription
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* BILLING TOGGLE */}
            <div className="mt-8 flex justify-center">
                <div className="flex items-center rounded-full border border-white/[0.08] bg-[#11181d] p-1">
                    <button
                        type="button"
                        onClick={() => setBilling("monthly")}
                        className={`rounded-full px-5 py-2 text-[11px] font-medium transition ${billing === "monthly"
                            ? "bg-[#10aaa9] text-white"
                            : "text-[#7f8a90] hover:text-white"
                            }`}
                    >
                        Monthly
                    </button>

                    <button
                        type="button"
                        onClick={() => setBilling("yearly")}
                        className={`flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-medium transition ${billing === "yearly"
                            ? "bg-[#10aaa9] text-white"
                            : "text-[#7f8a90] hover:text-white"
                            }`}
                    >
                        Yearly
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-[#10aaa9]">
                            SAVE
                        </span>
                    </button>
                </div>
            </div>

            {/* PRICING CARDS */}
            <section className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
                {plans.map((plan) => {
                    const price = getPlanPrice(plan);
                    const isCurrentPlan =
                        activeSubscription?.planId === plan.id &&
                        activeSubscription?.billingCycle === billing;

                    return (
                        <div
                            key={plan.id}
                            className={`relative overflow-hidden rounded-[8px] border bg-[#11181d] p-6 transition duration-300 hover:-translate-y-1 ${plan.popular
                                ? "border-[#10aaa9]/40 shadow-[0_20px_60px_rgba(16,170,169,0.08)]"
                                : "border-white/[0.06]"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#10aaa9]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#10aaa9]">
                                    <Sparkles size={10} />
                                    Popular
                                </div>
                            )}

                            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#182126] text-[#10aaa9]">
                                {plan.popular ? (
                                    <Crown size={19} />
                                ) : (
                                    <Music2 size={19} />
                                )}
                            </div>

                            <h2 className="mt-5 text-lg font-semibold text-white">
                                {plan.name}
                            </h2>

                            <p className="mt-2 max-w-sm text-[11px] leading-5 text-[#68747a]">
                                {plan.description}
                            </p>

                            <div className="mt-6 flex items-end gap-1">
                                <span className="text-3xl font-semibold tracking-tight text-white">
                                    ₹{price}
                                </span>

                                <span className="mb-1 text-[11px] text-[#68747a]">
                                    {plan.period}
                                </span>
                            </div>

                            {billing === "yearly" && (
                                <p className="mt-1 text-[10px] text-[#10aaa9]">
                                    Billed yearly
                                </p>
                            )}

                            <button
                                type="button"
                                disabled={!!activeSubscription || loadingSubscription}
                                onClick={() => handleUpgrade(plan)}
                                className={`mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isCurrentPlan
                                    ? "bg-[#182126] text-[#10aaa9]"
                                    : plan.popular
                                        ? "bg-[#10aaa9] text-white hover:bg-[#12c1bf]"
                                        : "border border-white/[0.08] bg-white/[0.03] text-white hover:border-[#10aaa9]/30 hover:bg-[#10aaa9]/10 hover:text-[#10aaa9]"
                                    }`}
                            >
                                <Crown size={14} />
                                {isCurrentPlan
                                    ? "Current Plan"
                                    : activeSubscription
                                        ? "Premium Active"
                                        : `Upgrade to ${plan.name}`}
                            </button>

                            <div className="my-6 h-px bg-white/[0.06]" />

                            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-[#68747a]">
                                What's included
                            </p>

                            <div className="space-y-3">
                                {plan.features.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#10aaa9]/10 text-[#10aaa9]">
                                            <Check size={10} />
                                        </div>

                                        <span className="text-[11px] text-[#a3adb2]">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* BENEFITS */}
            <section className="mx-auto mt-16 max-w-5xl">
                <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#10aaa9]">
                        Premium Benefits
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        Everything you love. Better.
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-[11px] text-[#68747a]">
                        Get more from every song with Sonic Premium.
                    </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;

                        return (
                            <div
                                key={benefit.title}
                                className="rounded-[7px] border border-white/[0.06] bg-[#11181d] p-5 transition hover:border-[#10aaa9]/20"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[#10aaa9]/10 text-[#10aaa9]">
                                    <Icon size={17} />
                                </div>

                                <h3 className="mt-4 text-[12px] font-semibold text-white">
                                    {benefit.title}
                                </h3>

                                <p className="mt-2 text-[10px] leading-5 text-[#68747a]">
                                    {benefit.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* TRUST BANNER */}
            <section className="mx-auto mt-12 max-w-4xl">
                <div className="flex flex-col items-center justify-between gap-5 rounded-[7px] border border-[#10aaa9]/15 bg-[#10aaa9]/[0.05] p-5 text-center sm:flex-row sm:text-left">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10aaa9]/10 text-[#10aaa9]">
                            <ShieldCheck size={19} />
                        </div>

                        <div>
                            <h3 className="text-[12px] font-semibold text-white">
                                Simple & secure
                            </h3>

                            <p className="mt-1 text-[10px] text-[#68747a]">
                                Cancel anytime. No hidden charges.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#68747a]">
                        <Check size={13} className="text-[#10aaa9]" />
                        Secure payments
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="mx-auto mt-16 max-w-3xl">
                <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#10aaa9]">
                        FAQ
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        Frequently asked questions
                    </h2>
                </div>

                <div className="mt-7 space-y-2">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;

                        return (
                            <div
                                key={faq.question}
                                className="overflow-hidden rounded-[6px] border border-white/[0.06] bg-[#11181d]"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenFaq(
                                            isOpen ? null : index
                                        )
                                    }
                                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle
                                            size={15}
                                            className="shrink-0 text-[#10aaa9]"
                                        />

                                        <span className="text-[11px] font-medium text-white">
                                            {faq.question}
                                        </span>
                                    </div>

                                    <span
                                        className={`text-lg font-light text-[#68747a] transition ${isOpen ? "rotate-45" : ""
                                            }`}
                                    >
                                        +
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
                                        <p className="pl-7 text-[10px] leading-5 text-[#68747a]">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="mx-auto mt-16 max-w-4xl pb-4">
                <div className="relative overflow-hidden rounded-[8px] border border-[#10aaa9]/20 bg-[#11181d] px-6 py-10 text-center sm:px-10">
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#10aaa9]/10 blur-[80px]" />

                    <div className="relative">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#10aaa9]/10 text-[#10aaa9]">
                            <Crown size={19} />
                        </div>

                        <h2 className="mt-4 text-xl font-semibold text-white sm:text-2xl">
                            Ready to upgrade your music?
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-[#68747a]">
                            Join Sonic Premium and enjoy music the way
                            it was meant to be heard.
                        </p>

                        <button
                            type="button"
                            onClick={() => handleUpgrade(plans[0])}
                            disabled={!!activeSubscription}
                            className="mt-6 inline-flex h-10 items-center gap-2 rounded-[4px] bg-[#10aaa9] px-6 text-[11px] font-semibold text-white transition hover:bg-[#12c1bf] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Crown size={14} />
                            {activeSubscription
                                ? "Premium Active"
                                : "Get Premium"}
                        </button>
                    </div>
                </div>
            </section>

            {/* PAYMENT MODAL */}
            {showPaymentModal && selectedPlanData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-[420px] overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#10171b] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <div>
                                <h2 className="text-[14px] font-semibold text-white">
                                    Complete your upgrade
                                </h2>
                                <p className="mt-1 text-[10px] text-[#68747a]">
                                    Secure Sonic Premium checkout
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!processingPayment) {
                                        setShowPaymentModal(false);
                                        setSelectedPlan(null);
                                    }
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[#68747a] transition hover:bg-white/[0.05] hover:text-white"
                            >
                                <X size={17} />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="rounded-[6px] border border-white/[0.06] bg-[#11181d] p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#10aaa9]/10 text-[#10aaa9]">
                                        <Crown size={18} />
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-semibold text-white">
                                            {selectedPlanData.name}
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#68747a]">
                                            {billing === "yearly"
                                                ? "Yearly billing"
                                                : "Monthly billing"}
                                        </p>
                                    </div>

                                    <div className="ml-auto text-right">
                                        <p className="text-lg font-semibold text-white">
                                            ₹
                                            {getPlanPrice(
                                                selectedPlanData
                                            )}
                                        </p>
                                        <p className="text-[9px] text-[#68747a]">
                                            {billing === "yearly"
                                                ? `₹${getPlanPrice(
                                                    selectedPlanData
                                                ) * 12} / year`
                                                : "/ month"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3 rounded-[6px] border border-white/[0.06] bg-white/[0.02] p-3">
                                <CreditCard
                                    size={16}
                                    className="text-[#10aaa9]"
                                />
                                <p className="text-[10px] leading-5 text-[#7f8a90]">
                                    You will be redirected to Razorpay's
                                    secure checkout. Your subscription is
                                    activated only after payment verification.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayment}
                                disabled={processingPayment}
                                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-[#10aaa9] text-[11px] font-semibold text-white transition hover:bg-[#12c1bf] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processingPayment ? (
                                    <>
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={15} />
                                        Continue to Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast && (
                <div className="fixed bottom-[105px] left-1/2 z-[110] -translate-x-1/2">
                    <div
                        className={`flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-[6px] border px-4 py-3 shadow-xl backdrop-blur ${toast.type === "success"
                            ? "border-[#10aaa9]/30 bg-[#111d1d] text-[#b9f1ef]"
                            : toast.type === "error"
                                ? "border-red-400/20 bg-[#1d1111] text-red-200"
                                : "border-white/10 bg-[#151b1f] text-[#d7dcdf]"
                            }`}
                    >
                        {toast.type === "success" ? (
                            <Check
                                size={15}
                                className="shrink-0 text-[#10aaa9]"
                            />
                        ) : (
                            <ShieldCheck
                                size={15}
                                className="shrink-0 text-[#10aaa9]"
                            />
                        )}

                        <span className="whitespace-nowrap text-[10px]">
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
