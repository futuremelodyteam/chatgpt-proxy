import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ STATUS ROUTE (Fixes your "Offline" issue)
app.get('/status', (req, res) => {
    res.status(200).json({ status: "online" });
});

// ✅ CHAT ROUTE (Fixes your "AI not responding" issue)
app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    // Get the last message sent by the user
    const userPrompt = messages[messages.length - 1].content;

    try {
        if (provider === "Gemini") {
            const API_KEY = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
            
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: userPrompt }] }]
            });

            const aiReply = response.data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: aiReply });
        } else {
            res.status(400).json({ error: "Only Gemini is supported right now" });
        }
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        res.status(500).json({ error: "AI failed to respond" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});