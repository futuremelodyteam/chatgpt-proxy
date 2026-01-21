import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ STATUS CHECK: Used by SettingsView
app.get('/status', (req, res) => {
    res.status(200).json({ status: "online" });
});

// ✅ CHAT LOGIC
app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    
    // Case-insensitive check to prevent "Only Gemini supported" error
    const selectedProvider = provider ? provider.toLowerCase() : "";

    if (selectedProvider === "gemini") {
        try {
            const API_KEY = process.env.GEMINI_API_KEY;
            
            // ✅ UPDATED FOR 2026: Gemini 3 Flash is the high-speed standard
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
            
            const userPrompt = messages[messages.length - 1].content;

            const response = await axios.post(url, {
                contents: [{ 
                    parts: [{ text: userPrompt }] 
                }]
            });

            // Extract the reply from Google's response structure
            const aiReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiReply) {
                res.status(200).json({ reply: aiReply });
            } else {
                throw new Error("AI returned an empty content block.");
            }

        } catch (error) {
            // Logs detailed error messages to the Render Dashboard
            console.error("❌ Google API Error:", error.response?.data || error.message);
            
            const errorMessage = error.response?.data?.error?.message || error.message;
            res.status(500).json({ error: "AI failed to respond", details: errorMessage });
        }
    } else {
        res.status(400).json({ error: `Provider '${provider}' not recognized. Use 'Gemini'.` });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});