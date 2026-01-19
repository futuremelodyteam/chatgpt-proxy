const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MARK: - Middleware
app.use(cors()); // Allows your iOS app to communicate with this server
app.use(bodyParser.json());

// MARK: - Status Route
// This fixes the "Cannot GET /status" error in your app
app.get('/status', (req, res) => {
    console.log("📡 Status check received");
    res.status(200).json({
        status: "online",
        server: "Xber Proxy",
        timestamp: new Date().toISOString()
    });
});

// MARK: - Feedback Route
// This receives the bug reports from your SettingsView
app.post('/feedback', (req, res) => {
    const feedback = req.body;
    
    // For now, we just log it to the Render console. 
    // In the future, you can connect this to a database or email service.
    console.log("📩 New Feedback Received:");
    console.log(`From: ${feedback.nickname || 'Unknown'}`);
    console.log(`Severity: ${feedback.severity}`);
    console.log(`Message: ${feedback.message}`);
    console.log(`Device: ${feedback.device} (OS: ${feedback.os})`);
    
    res.status(200).json({ message: "Feedback received successfully" });
});

// MARK: - AI Proxy Route (Example)
// This is where your ChatView will eventually send messages
app.post('/chat', async (req, res) => {
    const { message, provider } = req.body;
    console.log(`🤖 Chat request for ${provider}: ${message}`);
    
    // Logic for calling Gemini or OpenAI would go here
    res.status(200).json({ reply: "Server received your message!" });
});

// MARK: - Root Route
app.get('/', (req, res) => {
    res.send('Xber Proxy Server is running. Use /status for health checks.');
});

// MARK: - Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});