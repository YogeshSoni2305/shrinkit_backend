import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
const PORT = process.env.PORT || 5002;

// Explicit CORS configuration
app.use(cors({
  origin: "*", // Allow all origins (for testing), or specify your frontend origin (e.g., "http://localhost:3000")
  methods: ["GET", "POST", "OPTIONS"], // Explicitly allow these methods
  allowedHeaders: ["Content-Type"], // Allow this header
}));

// Handle OPTIONS preflight requests explicitly (redundant with cors(), but ensures compatibility)
app.options("*", cors());

// Custom JSON parsing with error handling
app.use((req, res, next) => {
    express.json()(req, res, (err) => {
        if (err) {
            console.error("Invalid JSON:", err.message, "Body:", req.body);
            return res.status(400).json({ error: "Invalid JSON payload" });
        }
        next();
    });
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url} Body:`, req.body);
    next();
});

// Test endpoint
app.get("/test", (req, res) => {
    console.log("API call received at /test endpoint");
    res.json({ message: "Server is alive" });
});

const urlMap = new Map();

// Shorten endpoint
app.post("/shorten", (req, res) => {
    try {
        console.log("Received /shorten request with body:", req.body);
        const { url } = req.body;
        if (!url) {
            console.log("Missing URL in request body");
            return res.status(400).json({ error: "URL is required" });
        }

        console.log("Original URL received:", url);
        const shortId = nanoid(6);
        urlMap.set(shortId, url);

        const baseUrl = "https://shrinkit-backend-nmzi.onrender.com";
        const shortUrl = `${baseUrl}/${shortId}`;
        
        console.log(`Generated short URL: ${shortUrl}`);
        res.json({ shortUrl });
    } catch (error) {
        console.error("Error in /shorten:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Redirect endpoint
app.get("/:shortId", (req, res) => {
    try {
        const shortId = req.params.shortId;
        const originalUrl = urlMap.get(shortId);
        console.log(`Redirecting ${shortId} to ${originalUrl}`);
        if (originalUrl) {
            res.redirect(originalUrl);
        } else {
            res.status(404).json({ error: "URL not found" });
        }
    } catch (error) {
        console.error("Error in redirect:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/", (req, res) => {
    res.json({ status: "OK" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});