
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const authRouter = require("./routes/auth");
const requireAuth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from .env");
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters.");
}

// Request middleware
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  name: "emena.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Emena School System server is running"
  });
});

// Authentication routes
app.use("/api/auth", authRouter);

// Login page
app.get("/login", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Protect dashboard pages
app.get("/", (req, res) => {
  if (!req.session || req.session.authenticated !== true) {
    return res.redirect("/login");
  }

  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", (req, res) => {
  if (!req.session || req.session.authenticated !== true) {
    return res.redirect("/login");
  }

  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve CSS, JavaScript and other public assets.
// index.html is excluded because it is protected above.
app.use(express.static(path.join(__dirname, "public"), {
  index: false
}));

// Protect all remaining API endpoints.
// Future school module routes will be mounted after this middleware.
app.use("/api", requireAuth);

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found: " + req.method + " " + req.originalUrl
  });
});

// Unknown page
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: "An unexpected server error occurred."
  });
});

app.listen(PORT, () => {
  console.log(
    "Emena School Management System running at http://localhost:" + PORT
  );
});
