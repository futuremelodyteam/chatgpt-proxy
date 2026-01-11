// ✅ Use 'import' instead of 'require' for ES Modules
import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(express.json());

// Root route to check if server is alive
app.get('/', (req, res) => res.send('Xber Proxy Server is running!'));

app.post('/chat', async (req, res) => {
    const { messages, provider } = req.body;
    console.log(`Incoming request. Provider: ${provider}`);

    try {
        if (provider === 'Gemini') {
            if (!process.env.GEMINI_API_KEY) {
                return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
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
            
            const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
            res.json({ reply });

        } else {
            if (!process.env.OPENAI_API_KEY) {
                return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
            }

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                { model: "gpt-4o-mini", messages: messages },
                { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } }
            );

            const reply = response.data.choices[0].message.content;
            res.json({ reply });
        }
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "The AI provider returned an error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is live on port ${PORT}`);
    console.log(`Active APIs: ${process.env.OPENAI_API_KEY ? 'OpenAI' : 'MISSING'} | ${process.env.GEMINI_API_KEY ? 'Gemini' : 'MISSING'}`);
});