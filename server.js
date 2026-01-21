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

// ✅ STATUS ROUTE: Used by your app to check if the server is awake
app.get('/status', (req, res) => {
    res.status(200).json({ status: "online" });
});

// ✅ CHAT ROUTE: Handles the AI logic
app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;

    // Validation
    if (!messages || messages.length === 0) {
        return res.status(400).json({ error: "No messages provided" });
    }

    // Extract the latest user prompt
    const userPrompt = messages[messages.length - 1].content;

    try {
        if (provider === "Gemini") {
            const API_KEY = process.env.GEMINI_API_KEY;
            
            // ✅ Updated Model Name: gemini-1.5-flash is stable and supported
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
            
            const response = await axios.post(url, {
                contents: [{
                    parts: [{ text: userPrompt }]
                }]
            });

            // Navigate the Google response object safely
            const aiReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiReply) {
                res.status(200).json({ reply: aiReply });
            } else {
                throw new Error("Gemini returned an empty response structure.");
            }
        } else {
            res.status(400).json({ error: "Only Gemini is currently supported." });
        }
    } catch (error) {
        // This logs the SPECIFIC error (like the 404 you saw) to your Render Dashboard
        console.error("❌ Google API Error:", error.response?.data || error.message);
        
        res.status(500).json({ 
            error: "AI failed to respond", 
            details: error.response?.data?.error?.message || error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});