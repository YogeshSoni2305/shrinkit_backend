import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
const PORT = process.env.PORT || 5002; // Use environment PORT or default to 5002

app.use(express.json());
app.use(cors()); // Adjust CORS for production if needed

// Logging middleware (optional, remove in production if not needed)
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ message: "Server is alive" });
});

const urlMap = new Map();

// Shorten endpoint
app.post("/shorten", (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const shortId = nanoid(6);
        urlMap.set(shortId, url);

        // Use req.headers.host for the base URL
        const baseUrl = `${req.protocol}://${req.headers.host}`;
        const shortUrl = `${baseUrl}/${shortId}`;
        res.json({ shortUrl });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Redirect endpoint
app.get("/:shortId", (req, res) => {
    try {
        const originalUrl = urlMap.get(req.params.shortId);
        if (originalUrl) {
            res.redirect(originalUrl);
        } else {
            res.status(404).json({ error: "URL not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});