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

console.log("🚀 Server loaded");

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
  console.log("📩 /chat request received");

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid request: messages array is required"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY");
      return res.status(500).json({
        error: "Server misconfiguration"
      });
    }

    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7
        })
      }
    );

    const rawText = await openAIResponse.text();

    if (!openAIResponse.ok) {
      console.error("❌ OpenAI error:", rawText);
      return res.status(openAIResponse.status).json({
        error: "OpenAI API error",
        details: rawText
      });
    }

    const data = JSON.parse(rawText);

    const reply =
      data?.choices?.[0]?.message?.content ?? "No response";

    console.log("✅ Reply sent to client");

    // 🔥 IMPORTANT: return SIMPLE JSON Swift can decode
    res.json({
      reply
    });
  } catch (err) {
    console.error("🔥 Server exception:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
