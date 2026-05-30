import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Resume from "./models/Resume.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/resume-builder")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ============ AI ENDPOINT FOR ATS OPTIMIZATION ============
app.post("/api/ats-optimize", async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const prompt = `You are an ATS (Applicant Tracking System) expert. Optimize the following resume content to match the job description.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
Personal Info: ${JSON.stringify(resumeData.personalInfo)}
Summary: ${resumeData.summary || ""}
Experience: ${JSON.stringify(resumeData.experience)}
Education: ${JSON.stringify(resumeData.education)}
Skills: ${resumeData.skills?.join(", ") || ""}

Based on the job description, provide:
1. ATS Score (0-100)
2. Optimized Summary (2-3 sentences, keyword-rich)
3. Optimized Experience bullets (use action verbs, quantify achievements)
4. Key Skills to highlight (prioritize matching keywords)
5. Missing Keywords that should be added
6. Suggestions for improvement

Format your response as JSON with this structure:
{
  "atsScore": number,
  "optimizedSummary": string,
  "optimizedExperience": string,
  "highlightedSkills": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}`;

    // ---- GPT-5 call (JSON-only) ----
    if (!process.env.GPT5_API_KEY) {
      return res.status(500).json({
        error: "Missing GPT5_API_KEY environment variable"
      });
    }

    const promptForModel = `${prompt}\n\nIMPORTANT: Output ONLY valid JSON. No markdown. No trailing commas.`;

    const response = await fetch(process.env.GPT5_API_URL || "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GPT5_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // OpenAI Responses API compatible shape
        model: process.env.GPT5_MODEL || "gpt-5",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: promptForModel }
            ]
          }
        ],
        // Ask for strict JSON
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    const data = await response.json();

    // Attempt to extract JSON
    const jsonCandidate =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.choices?.[0]?.message?.content;

    let atsResult;
    try {
      if (typeof jsonCandidate === "string") {
        const match = jsonCandidate.match(/\{[\s\S]*\}/);
        atsResult = match ? JSON.parse(match[0]) : JSON.parse(jsonCandidate);
      } else if (typeof data === "object" && data?.atsScore !== undefined) {
        atsResult = data;
      } else {
        throw new Error("Could not extract model JSON");
      }
    } catch (parseError) {
      throw new Error(`Failed to parse GPT response as JSON: ${parseError.message}`);
    }

    // Basic shape validation + defaults
    atsResult = {
      atsScore: Number(atsResult.atsScore ?? 0),
      optimizedSummary: String(atsResult.optimizedSummary ?? ""),
      optimizedExperience: String(atsResult.optimizedExperience ?? ""),
      highlightedSkills: Array.isArray(atsResult.highlightedSkills) ? atsResult.highlightedSkills : [],
      missingKeywords: Array.isArray(atsResult.missingKeywords) ? atsResult.missingKeywords : [],
      suggestions: Array.isArray(atsResult.suggestions) ? atsResult.suggestions : []
    };

    res.json(atsResult);

  } catch (error) {
    console.error("ATS Optimization Error:", error);
    res.status(500).json({
      error: "Failed to optimize resume",
      message: error.message
    });
  }
});

// ============ RESUME CRUD ROUTES ============

// Create a new resume
app.post("/api/resumes", async (req, res) => {
  try {
    const resume = new Resume(req.body);
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all resumes
app.get("/api/resumes", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single resume
app.get("/api/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a resume
app.put("/api/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a resume
app.delete("/api/resumes/:id", async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ATS Score Check
app.post("/api/resumes/:id/ats-check", async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Optimize by calling the existing endpoint logic directly (no localhost recursion)
    const atsResult = await (async () => {
      const payload = {
        resumeData: {
          personalInfo: resume.personalInfo,
          summary: resume.summary,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills
        },
        jobDescription
      };

      // Re-use the same route contract by calling our own function via fetch
      // NOTE: This still uses HTTP, but avoids calling /api/resumes/:id/ats-check again.
      // Keeping fetch here is simpler than refactoring the whole handler.
      const response = await fetch("http://localhost:5000/api/ats-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return response.json();
    })();

    // Save ATS score to resume
    resume.atsScore = atsResult.atsScore || 0;
    resume.atsOptimizedContent = {
      summary: atsResult.optimizedSummary,
      experience: atsResult.optimizedExperience,
      skills: (atsResult.highlightedSkills || []).join(", ")
    };
    await resume.save();

    res.json({ resume, atsResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
