import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());

console.log("🚀 Server file loaded");

// --------------------
// ROOT HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "ChatGPT proxy server is running"
  });
});

// --------------------
// CHAT ENDPOINT
// --------------------
app.post("/chat", async (req, res) => {
  console.log("📩 Incoming /chat request");

  try {
    const { messages } = req.body;

    if (!messages) {
      console.error("❌ No messages provided");
      return res.status(400).json({ error: "messages is required" });
    }

    console.log("➡️ Sending request to OpenAI");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages
      })
    });

    const data = await response.json();

    console.log("⬅️ OpenAI response received");

    res.json(data);
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
