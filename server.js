import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Root route for health checks
app.get('/', (req, res) => res.send('Xber Proxy Server is live!'));

app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    console.log(`Request received for provider: ${provider}`);

    try {
        if (provider === 'Gemini') {
            // Check for Gemini Key
            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({ error: "Missing GEMINI_API_KEY on server." });
            }

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                }
            );
            
            const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini returned an empty response.";
            res.json({ reply });

        } else {
            // Default to ChatGPT
            if (!process.env.OPENAI_API_KEY) {
                return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
            }

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
        res.status(500).json({ error: "The AI provider failed to respond." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});