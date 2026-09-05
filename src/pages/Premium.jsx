import { useState } from "react";
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
} from "lucide-react";

const plans = [
    {
        id: "monthly",
        name: "Premium",
        description: "Everything you need for a better music experience.",
        monthlyPrice: "₹99",
        yearlyPrice: "₹79",
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
        monthlyPrice: "₹179",
        yearlyPrice: "₹149",
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
        description: "Enjoy your favorite songs without interruptions.",
    },
    {
        icon: Download,
        title: "Listen Offline",
        description: "Download songs and enjoy them anywhere, anytime.",
    },
    {
        icon: Music2,
        title: "High Quality Audio",
        description: "Experience your music with rich and detailed sound.",
    },
    {
        icon: Zap,
        title: "Unlimited Skips",
        description: "Skip any song and play exactly what you want.",
    },
];

const faqs = [
    {
        question: "Can I cancel my Premium subscription anytime?",
        answer: "Yes. You can cancel your subscription anytime. Your Premium benefits will remain active until the end of your billing period.",
    },
    {
        question: "Can I listen to music offline?",
        answer: "Yes. Premium members can download supported songs and listen to them offline.",
    },
    {
        question: "What happens when my subscription ends?",
        answer: "Your account will return to the Free plan. Your playlists and saved music will remain available.",
    },
    {
        question: "Can I switch between monthly and yearly plans?",
        answer: "Yes. You can change your subscription plan whenever the option is available for your account.",
    },
];

export default function Premium() {
    const [billing, setBilling] = useState("monthly");
    const [openFaq, setOpenFaq] = useState(null);

    const handleUpgrade = (planName) => {
        // Payment integration can be connected here later.
        console.log(`Upgrade selected: ${planName}`);
    };

    return (
        <div className="relative overflow-hidden py-8 sm:py-10 lg:py-12">

            {/* ==========================================
                BACKGROUND GLOW
            ========================================== */}

            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#10aaa9]/[0.06] blur-[120px]" />

            {/* ==========================================
                HERO
            ========================================== */}

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

            {/* ==========================================
                BILLING TOGGLE
            ========================================== */}

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

            {/* ==========================================
                PRICING CARDS
            ========================================== */}

            <section className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">

                {plans.map((plan) => {
                    const price =
                        billing === "monthly"
                            ? plan.monthlyPrice
                            : plan.yearlyPrice;

                    return (
                        <div
                            key={plan.id}
                            className={`relative overflow-hidden rounded-[8px] border bg-[#11181d] p-6 transition duration-300 hover:-translate-y-1 ${plan.popular
                                    ? "border-[#10aaa9]/40 shadow-[0_20px_60px_rgba(16,170,169,0.08)]"
                                    : "border-white/[0.06]"
                                }`}
                        >

                            {/* Popular Badge */}

                            {plan.popular && (
                                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#10aaa9]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#10aaa9]">
                                    <Sparkles size={10} />
                                    Popular
                                </div>
                            )}

                            {/* Plan Icon */}

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

                            {/* Price */}

                            <div className="mt-6 flex items-end gap-1">

                                <span className="text-3xl font-semibold tracking-tight text-white">
                                    {price}
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

                            {/* Upgrade */}

                            <button
                                type="button"
                                onClick={() => handleUpgrade(plan.name)}
                                className={`mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] text-[11px] font-semibold transition ${plan.popular
                                        ? "bg-[#10aaa9] text-white hover:bg-[#12c1bf]"
                                        : "border border-white/[0.08] bg-white/[0.03] text-white hover:border-[#10aaa9]/30 hover:bg-[#10aaa9]/10 hover:text-[#10aaa9]"
                                    }`}
                            >
                                <Crown size={14} />
                                Upgrade to {plan.name}
                            </button>

                            {/* Divider */}

                            <div className="my-6 h-px bg-white/[0.06]" />

                            <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-[#68747a]">
                                What's included
                            </p>

                            {/* Features */}

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

            {/* ==========================================
                BENEFITS
            ========================================== */}

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

            {/* ==========================================
                TRUST BANNER
            ========================================== */}

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

            {/* ==========================================
                FAQ
            ========================================== */}

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
                                        className={`text-lg font-light text-[#68747a] transition ${isOpen
                                                ? "rotate-45"
                                                : ""
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

            {/* ==========================================
                FINAL CTA
            ========================================== */}

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
                            onClick={() =>
                                handleUpgrade("Premium")
                            }
                            className="mt-6 inline-flex h-10 items-center gap-2 rounded-[4px] bg-[#10aaa9] px-6 text-[11px] font-semibold text-white transition hover:bg-[#12c1bf]"
                        >
                            <Crown size={14} />
                            Get Premium
                        </button>

                    </div>

                </div>

            </section>

        </div>
    );
}