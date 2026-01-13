import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Chat Endpoint
app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    try {
        if (provider === 'Gemini') {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                { contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })) }
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
    } catch (e) { res.status(500).json({ error: "API Failure" }); }
});

// Feedback Endpoint
app.post('/feedback', (req, res) => {
    console.log("FEEDBACK RECEIVED:", req.body);
    // In a real app, save to a DB here
    res.status(200).send("OK");
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));