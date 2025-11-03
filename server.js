const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Routes
const docsRouter = require("./routes/docs");
const controlsRouter = require("./routes/controls");
const soaRouter = require("./routes/soa");
const gapsRouter = require("./routes/gaps");
const risksRouter = require("./routes/risks");
const taskRouter = require("./routes/tasks");
const usersRouter = require("./routes/users");

const app = express();

const PORT = process.env.PORT || 4000;
const DB_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "production_db";
const CLIENT_URL = process.env.CLIENT_URL || "*";

// Required env check (for safety)
if (!DB_URI) {
  console.error("❌ MONGO_URI is missing. Set it in environment variables.");
  process.exit(1);
}

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// Ensure folders exist
const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use("/api/documents", docsRouter);
app.use("/api/controls", controlsRouter);
app.use("/api/soa", soaRouter);
app.use("/api/gaps", gapsRouter);
app.use("/api/risks", risksRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/users", usersRouter);

app.use("/uploads", express.static(uploadsDir));

// Serve frontend build if exists
const clientBuildPath = path.join(__dirname, "client", "build");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// DB connect
mongoose
  .connect(DB_URI, { dbName: DB_NAME })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server live on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error("❌ DB error:");
    console.error(err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("♻️ Closing server...");
  mongoose.connection.close();
  process.exit(0);
});
