import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import axios from "axios";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import userRoute from "./routes/user.js";

import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import messageRoutes from "./routes/message.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();
const app = express();
app.set("trust proxy", 1);


// ---------- CORS CONFIGURATION ----------
const allowedOrigins = [
  "http://localhost:3000",
  "https://sheshri.netlify.app",
  process.env.CLIENT_URL,
].filter(Boolean);

// ---------- CORS CONFIGURATION ----------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ---------- MIDDLEWARE ----------
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// ---------- SOCKET.IO SERVER ----------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---------- MONGODB CONNECTION ----------
const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB…");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
    });

    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.log("❌ MongoDB connection error:");
    console.error(error.message);

    if (error.message.includes("queryTxt ETIMEOUT")) {
      console.log("\n⚠ DNS Timeout: Atlas SRV record not resolving.");
      console.log("👉 FIX: Set DNS to 8.8.8.8 / 8.8.4.4\n");
    }

    setTimeout(connectDB, 5000); // Retry
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("⚠ MongoDB disconnected!");
});

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoute);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);


// // ---------- OPENROUTER AI CHAT ROUTE ----------
// const PROVIDER_URL = "https://api.openrouter.ai/v1/chat/completions";
// const MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
// const API_KEY = process.env.OPENROUTER_API_KEY;

// if (!API_KEY) {
//   console.error("❌ Missing OPENROUTER_API_KEY in .env");
// }

// app.post("/api/chat", async (req, res) => {
//   try {
//     const { messages } = req.body;

//     if (!Array.isArray(messages)) {
//       return res.status(400).json({ error: "messages must be an array" });
//     }

//     console.log("📩 Sending message to OpenRouter:", MODEL);

//     const response = await axios.post(
//       PROVIDER_URL,
//       {
//         model: MODEL,
//         messages,
//         max_tokens: 800,
//         temperature: 0.2,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${API_KEY}`,
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error("💥 OpenRouter Error:", err.response?.data || err.message);
//     res.status(500).json({
//       error: err.response?.data || "AI request failed",
//     });
//   }
// });

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  res.status(status).json({
    success: false,
    status,
    message,
  });
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
