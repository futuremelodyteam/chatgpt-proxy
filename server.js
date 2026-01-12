import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Server is active.'));

app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    console.log(`--- New Request ---`);
    console.log(`Provider: ${provider}`);

    try {
        if (provider === 'Gemini') {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

            // ✅ Updated to v1 and ensured model name is correct
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    contents: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                }
            );
            
            const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini returned empty.";
            res.json({ reply });

        } else {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-4o-mini",
                    messages: messages
                },
                {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                }
            );

            const reply = response.data.choices[0].message.content;
            res.json({ reply });
        }
    } catch (error) {
        const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error("CRITICAL API ERROR:", errorDetail);
        
        res.status(500).json({ 
            error: "The AI provider failed to respond.",
            details: errorDetail 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server monitoring on port ${PORT}`));