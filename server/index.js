const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { GoogleGenAI } = require("@google/genai");
const authMiddleware = require("./middleware/authMiddleware");
const Lead = require("./models/Lead");
const Task = require("./models/Task");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before starting the server.");
}

const app = express();
connectDB();

const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      const isLocalDevelopmentOrigin =
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");

      if (!origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("IndieCRM Backend Running");
});

// ================= LEADS ROUTES =================

const leadFields = ["name", "company", "status", "notes", "tags", "score"];
const taskFields = ["title", "lead", "status", "dueDate"];

function pickFields(body, allowedFields) {
  return Object.fromEntries(
    allowedFields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]])
  );
}

function hasValidId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

// GET all leads
app.get("/api/leads", authMiddleware, async (req, res, next) => {
  try {
    const leads = await Lead.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    next(error);
  }
});

// CREATE lead
app.post("/api/leads", authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.create({
      ...pickFields(req.body, leadFields),
      userId: req.user.id,
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create lead.",
    });
  }
});

// UPDATE lead
app.put("/api/leads/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!hasValidId(req.params.id)) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      pickFields(req.body, leadFields),
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// DELETE lead
app.delete("/api/leads/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!hasValidId(req.params.id)) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted" });
  } catch (error) {
    next(error);
  }
});

// ================= TASKS ROUTES =================

// GET all tasks
app.get("/api/tasks", authMiddleware, async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// CREATE task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const task = await Task.create({
      ...pickFields(req.body, taskFields),
      userId: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Task creation failed.",
    });
  }
});
// Update task
app.put("/api/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!hasValidId(req.params.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      pickFields(req.body, taskFields),
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!hasValidId(req.params.id)) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ================= AI ROUTES =================

// AI TAGS GENERATION
app.post("/api/ai-tags", authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: "Notes are required to generate tags." });
    }

    const prompt = `
You are a CRM assistant.
Read the lead notes below and return 3 to 4 short, comma-separated tags describing the lead's intent, budget, or requirements.

Lead Notes:
${notes}

Return ONLY the tags separated by commas (e.g. E-commerce, High Budget, Urgent, High Intent). No extra explanation or numbering.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const rawText = response.text || "";
    const tags = rawText
      .split(/[\n,]+/)
      .map((t) => t.trim().replace(/^[-*•0-9.]+\s*/, ""))
      .filter(Boolean);

    res.json({ tags });
  } catch (err) {
    console.error("AI Generation Error:", err);
    res.status(500).json({
      error: "AI failed to generate tags",
    });
  }
});

// AI SCORE GENERATION
app.post("/api/ai-score", authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({
        error: "Notes are required.",
      });
    }

    const prompt = `
You are a CRM sales assistant.

Read these lead notes and give ONLY one number between 0 and 100.

Scoring guide:
- 90-100: Ready to buy
- 70-89: Strong lead
- 40-69: Medium interest
- 0-39: Weak lead

Lead Notes:
${notes}

Return ONLY the number.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const score = parseInt(response.text.trim());

    res.json({
      score: isNaN(score) ? 50 : score,
    });
  } catch (err) {
    console.error("Lead Score Error:", err);

    res.status(500).json({
      error: "AI score failed.",
    });
  }
});

app.post("/api/ai-followup", authMiddleware, async (req, res) => {
  try {
    const { name, notes } = req.body;

    const prompt = `
You are a CRM assistant.

Lead Name: ${name}

Lead Notes:
${notes}

Create ONE follow-up task.

Return ONLY valid JSON like this:
{
  "title":"Prepare Ecommerce Proposal",
  "status":"Todo"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const text = response.text.trim();

    const task = JSON.parse(text);

    res.json(task);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to generate follow-up task",
    });
  }
});

app.use((error, req, res, next) => {
  console.error("Unhandled request error:", error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
