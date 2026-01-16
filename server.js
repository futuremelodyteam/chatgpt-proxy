import express from 'express';
import axios from 'axios';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
app.use(express.json());

// --- 1. EMAIL CONFIGURATION ---
// This uses the environment variables you set in your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // 16-character App Password (no spaces)
    }
});

// --- 2. AI CHAT ENDPOINT ---
// Handles requests from Xber app to either Gemini 3 or GPT-4o-mini
app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;

    try {
        if (provider === 'Gemini') {
            // Updated to use the 2026 stable Gemini 3 Flash model
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                }
            );
            const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
            res.json({ reply });
        } else {
            // Fallback to OpenAI GPT-4o-mini
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                { model: "gpt-4o-mini", messages: messages },
                { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } }
            );
            res.json({ reply: response.data.choices[0].message.content });
        }
    } catch (error) {
        console.error("AI API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "AI Provider Error" });
    }
});

// --- 3. FEEDBACK & PROBLEM REPORTING ---
// Receives reports from the app and emails them directly to you
app.post('/feedback', async (req, res) => {
    const { nickname, message, device, os, severity } = req.body;

    console.log(`Incoming report: [${severity}] from ${nickname}`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sends the email to your own inbox
        subject: `[${severity}] Xber Feedback from ${nickname}`,
        text: `
            SYSTEM REPORT
            --------------
            User: ${nickname}
            Severity: ${severity}
            Device: ${device}
            OS Version: ${os}
            
            USER MESSAGE:
            "${message}"
            
            -- End of Report --
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Feedback email sent successfully.");
        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("❌ Email Relay Error:", error);
        res.status(500).json({ error: "Internal Server Error: Email failed to send." });
    }
});

// --- 4. SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Xber Production Server is live on port ${PORT}`);
    console.log(`📧 Email Relay active for: ${process.env.EMAIL_USER}`);
});