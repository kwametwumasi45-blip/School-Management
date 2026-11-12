
const express = require("express");
const path = require("path");

const studentsRouter = require("./routes/students");
const teachersRouter = require("./routes/teachers");
const classesRouter = require("./routes/classes");
const subjectsRouter = require("./routes/subjects");
const attendanceRouter = require("./routes/attendance");
const examinationsRouter = require("./routes/examinations");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Emena School System server is running"
  });
});

// API routes
app.use("/api/students", studentsRouter);
app.use("/api/teachers", teachersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/examinations", examinationsRouter);

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message:
      "API route not found: " + req.method + " " + req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack || err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: "An unexpected server error occurred"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    "Emena School Management System running at http://localhost:" + PORT
  );
});
