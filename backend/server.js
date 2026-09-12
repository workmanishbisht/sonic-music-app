import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// Middleware
// ================================

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    })
);

app.use(express.json());

// ================================
// Razorpay
// ================================

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    process.exit(1);
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================================
// Health Check
// ================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Sonic Razorpay backend is running",
    });
});

// ================================
// Create Razorpay Order
// ================================

app.post("/api/payment/create-order", async (req, res) => {
    try {
        const {
            amount,
            planId,
            planName,
            billingCycle,
        } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        const amountInPaise = Math.round(Number(amount) * 100);

        if (amountInPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount",
            });
        }

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `sonic_${Date.now()}`,
            notes: {
                planId: planId || "",
                planName: planName || "",
                billingCycle: billingCycle || "",
            },
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order",
            error:
                error?.error?.description ||
                error?.message ||
                "Unknown error",
        });
    }
});

// ================================
// Verify Razorpay Payment
// ================================

app.post("/api/payment/verify", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is incomplete",
            });
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        const isValid =
            generatedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({
                success: false,
                verified: false,
                message: "Payment signature verification failed",
            });
        }

        return res.status(200).json({
            success: true,
            verified: true,
            message: "Payment verified successfully",
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            verified: false,
            message: "Unable to verify payment",
        });
    }
});

// ================================
// 404
// ================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// ================================
// Start Server
// ================================

app.listen(PORT);