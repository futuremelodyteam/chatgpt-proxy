const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;

    try {
        if (provider === 'Gemini') {
            // --- ROUTE TO GEMINI ---
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                }
            );
            const reply = response.data.candidates[0].content.parts[0].text;
            res.json({ reply });

        } else {
            // --- ROUTE TO CHATGPT (Default) ---
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-4o-mini",
                    messages: messages
                },
                {
                    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
                }
            );
            const reply = response.data.choices[0].message.content;
            res.json({ reply });
        }
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch AI response" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));