const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    console.log(`Routing request to: ${provider}`);

    try {
        if (provider === 'Gemini') {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                }
            );
            res.json({ reply: response.data.candidates[0].content.parts[0].text });
        } else {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                { model: "gpt-4o-mini", messages: messages },
                { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } }
            );
            res.json({ reply: response.data.choices[0].message.content });
        }
    } catch (error) {
        res.status(500).json({ error: "AI Call Failed" });
    }
});

app.listen(process.env.PORT || 3000);