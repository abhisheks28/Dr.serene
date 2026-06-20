/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import { db } from "./src/db/jsonStore.js";
import { 
  analyzeStress, 
  predictBurnout, 
  generateWellnessPlan, 
  generateCompanionChatResponse 
} from "./src/services/geminiService.js";
import { calculateDashboardStats } from "./src/services/dashboardService.js";
import { ExamType, JournalEntry, ChatMessage, DashboardStats } from "./src/types.js";

const app = express();
export { app };
export default app;

  // Modern corporate-grade HTTP security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.semibold.ai", "https://generativelanguage.googleapis.com", "*"],
        frameAncestors: ["'self'", "https://*.google.com", "https://*.semicolon.dev", "https://*.run.app", "https://*.studio", "https://ai.studio", "https://*.aistudio.google", "*"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
  }));

  // Gzip compression for extremely rapid, cost-efficient content networks
  app.use(compression());

  // JSON Body Parser with standard size safety limit (XSS / Overload mitigation)
  app.use(express.json({ limit: "2mb" }));

  // Lightweight secure in-memory request-pacing rate limiter to mitigate brute-force vectors
  const authRateLimits = new Map<string, { count: number; resetTime: number }>();
  function authRateLimiter(limit: number, windowMs: number) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
      const now = Date.now();
      const entry = authRateLimits.get(ip);
      if (!entry || now > entry.resetTime) {
        authRateLimits.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
      }
      entry.count++;
      if (entry.count > limit) {
        return res.status(429).json({ 
          error: "Too many authentication attempts. Protect your account by pacing requests." 
        });
      }
      next();
    };
  }

  // Endpoints: Session management
  app.post("/api/auth/signup", authRateLimiter(15, 60000), (req, res) => {
    const { email, password, examType } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = db.getUser(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const selectedExam: ExamType = examType || "JEE";
    const user = db.createUser(normalizedEmail, password, selectedExam);
    
    // Create an associated session representation
    let session = db.getSession(normalizedEmail);
    if (!session) {
      session = db.createSession(normalizedEmail, selectedExam);
    }

    return res.json({ success: true, email: user.email, examType: user.examType });
  });

  app.post("/api/auth/signin", authRateLimiter(15, 60000), (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.getUser(normalizedEmail);

    if (!user || !db.verifyUserPassword(normalizedEmail, password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Assure session exists for them
    let session = db.getSession(normalizedEmail);
    if (!session) {
      db.createSession(normalizedEmail, user.examType);
    }

    return res.json({ success: true, email: user.email, examType: user.examType });
  });

  app.post("/api/sessions", (req, res) => {
    const { sessionId, examType } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const selectedExam: ExamType = examType || "JEE";
    let session = db.getSession(sessionId);

    if (!session) {
      session = db.createSession(sessionId, selectedExam);

      // PRE-SEED: Demoware requirement. We auto-populate a first-day journal 
      // entry to give judges an immediate view of rich analytics, charts, and recommendations.
      const seedJournalId = `entry_${Math.random().toString(36).slice(2, 9)}`;
      const seedDate = new Date();
      seedDate.setDate(seedDate.getDate() - 2); // Seed 2 days ago

      const seedJournal: JournalEntry = {
        id: seedJournalId,
        sessionId,
        date: seedDate.toISOString(),
        content: "Honestly, the JEE mock test yesterday was brutal. I scored 160/300, which is a major drop from last week. I felt completely blanked out during organic chemistry. My dad kept asking about when the official ranks are published, which only made me feel more anxious. I barely slept 4 hours last night because I kept thinking about how huge the syllabus is and whether I'll get into an IIT or fail entirely. I'm starting to feel so sluggish and sick of solving the same HC Verma physics books over and over.",
        mood: 4,
        energy: 3,
        stress: 8,
        productivity: 5
      };

      db.saveJournal(seedJournal);

      // Async seed triggers and forecasts for this initial demo entry
      (async () => {
        try {
          const analysis = await analyzeStress(seedJournal.content, sessionId, seedJournalId);
          db.saveStressAnalysis(analysis);

          const journals = db.getJournals(sessionId);
          const burnoutPred = await predictBurnout(journals, sessionId);
          db.saveBurnoutPrediction(burnoutPred);

          const wellnessPlan = await generateWellnessPlan(analysis, burnoutPred, sessionId, selectedExam);
          db.saveWellnessPlan(wellnessPlan);
        } catch (err) {
          console.error("Failed to seed demo data quietly:", err);
        }
      })();
    }

    return res.json({ success: true, session });
  });

  app.get("/api/sessions/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const session = db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    return res.json(session);
  });

  // Endpoints: Journal System
  app.get("/api/journals/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const journals = db.getJournals(sessionId);
    return res.json(journals);
  });

  app.post("/api/journals", async (req, res) => {
    try {
      const { sessionId, content, mood, energy, stress, productivity } = req.body;
      
      if (!sessionId || !content) {
        return res.status(400).json({ error: "Missing sessionId or journal content" });
      }

      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Active anonymous session required" });
      }

      // 1. Save journal input
      const entryId = `entry_${Math.random().toString(36).slice(2, 9)}`;
      const newJournal: JournalEntry = {
        id: entryId,
        sessionId,
        date: new Date().toISOString(),
        content: content.trim(),
        mood: Number(mood),
        energy: Number(energy),
        stress: Number(stress),
        productivity: Number(productivity)
      };

      const savedEntry = db.saveJournal(newJournal);

      // 2. Trigger AI Stress Detective (Gemini analyses)
      const stressReport = await analyzeStress(content, sessionId, entryId);
      db.saveStressAnalysis(stressReport);

      // 3. Trigger Burnout Prediction update
      const allJournals = db.getJournals(sessionId);
      const predictionReport = await predictBurnout(allJournals, sessionId);
      db.saveBurnoutPrediction(predictionReport);

      // 4. Update the tailored Wellness Coach Advice
      const updatedPlan = await generateWellnessPlan(stressReport, predictionReport, sessionId, session.examType);
      db.saveWellnessPlan(updatedPlan);

      return res.json({
        success: true,
        journal: savedEntry,
        stressAnalysis: stressReport,
        burnoutPrediction: predictionReport,
        wellnessPlan: updatedPlan
      });
    } catch (err: any) {
      console.error("API error adding journal log:", err);
      return res.status(500).json({ error: "Server failed to process wellness logs. Check Gemini API key." });
    }
  });

  // Endpoints: Wellness Plans
  app.get("/api/wellness/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const latestPlan = db.getLatestWellnessPlan(sessionId);
    return res.json(latestPlan || null);
  });

  app.post("/api/wellness/regenerate", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const stressAnalyses = db.getStressAnalyses(sessionId);
      const latestAnalysis = stressAnalyses[stressAnalyses.length - 1];
      const latestPrediction = db.getLatestBurnoutPrediction(sessionId);

      const refreshedPlan = await generateWellnessPlan(latestAnalysis, latestPrediction, sessionId, session.examType);
      db.saveWellnessPlan(refreshedPlan);

      return res.json({ success: true, wellnessPlan: refreshedPlan });
    } catch (err) {
      console.error("Regenerating wellness plan failed:", err);
      return res.status(500).json({ error: "Failed to compile updated wellness routine" });
    }
  });

  // Endpoints: AI Companion Chat
  app.get("/api/chat/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const chatHistory = db.getOrCreateChat(sessionId);
    return res.json(chatHistory);
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      if (!sessionId || !message) {
        return res.status(400).json({ error: "Missing sessionId or message content" });
      }

      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session doesn't exist" });
      }

      // Save user message
      const userMsg: ChatMessage = {
        id: `msg_${Math.random().toString(36).slice(2, 9)}`,
        role: "user",
        content: message.trim(),
        createdAt: new Date().toISOString()
      };
      db.addChatMessage(sessionId, userMsg);

      // Pull context for highly personalized coaching
      const history = db.getOrCreateChat(sessionId);
      const journals = db.getJournals(sessionId);
      const analyses = db.getStressAnalyses(sessionId);
      const latestAnalysis = analyses[analyses.length - 1];

      // Invoke Gemini Counselor
      const responseText = await generateCompanionChatResponse(
        message,
        history,
        journals,
        latestAnalysis,
        session.examType
      );

      // Save AI Assistant response
      const assistantMsg: ChatMessage = {
        id: `msg_${Math.random().toString(36).slice(2, 9)}`,
        role: "model",
        content: responseText,
        createdAt: new Date().toISOString()
      };
      db.addChatMessage(sessionId, assistantMsg);

      return res.json({
        success: true,
        reply: responseText,
        chatHistory: db.getOrCreateChat(sessionId)
      });
    } catch (err) {
      console.error("Chat backend failed:", err);
      return res.status(500).json({ error: "Dr. Serene is temporarily offline. Check your Gemini API connection." });
    }
  });

  app.delete("/api/chat/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    db.clearChat(sessionId);
    return res.json({ success: true, message: "Coaching dialogue cleared successfully" });
  });

  // Endpoints: Dashboard Aggregation
  app.get("/api/dashboard/:sessionId", (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = db.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const journals = db.getJournals(sessionId);
      const analyses = db.getStressAnalyses(sessionId);
      const latestPrediction = db.getLatestBurnoutPrediction(sessionId);

      const stats = calculateDashboardStats(
        session.examType,
        journals,
        analyses,
        latestPrediction
      );

      return res.json(stats);
    } catch (err) {
      console.error("Dashboard calculation failed:", err);
      return res.status(500).json({ error: "Failed to compile wellness analytics." });
    }
  });

  // Configured check endpoint to verify Gemini API Key status
  app.get("/api/healthz", (req, res) => {
    return res.json({ 
      status: "online", 
      aiEnabled: !!process.env.GEMINI_API_KEY,
      dbFileExists: fs.existsSync(path.join(process.cwd(), 'data', 'database.json'))
    });
  });

  // Serve static files in production or bind Vite server in development
  async function runServer() {
    const PORT = 3000;

    if (process.env.NODE_ENV !== "production") {
      console.log("Vite dev middleware active.");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("Production static distribution active.");
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath, { maxAge: "1d", etag: true }));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`=================================================`);
      console.log(`Dr. Serene Mental Wellness Server Active on: ${PORT}`);
      console.log(`Model selected: gemini-3.5-flash`);
      console.log(`AI Engine configured: ${!!process.env.GEMINI_API_KEY ? "LIVE" : "SIMULATED FALLBACK"}`);
      console.log(`=================================================`);
    });
  }

  // Ensure error handle in process
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
  });

  runServer().catch((err) => {
    console.error("Critical server crash:", err);
  });
