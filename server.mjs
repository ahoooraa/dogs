import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

app.post("/ask", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "کلید API تنظیم نشده است. فایل .env را بساز و OPENAI_API_KEY را وارد کن."
      });
    }

    const question = String(req.body?.question || "").trim().slice(0, 2000);
    const language = ["fa", "en", "both"].includes(req.body?.language)
      ? req.body.language
      : "both";

    if (!question) {
      return res.status(400).json({ error: "لطفاً سؤال خود را بنویس." });
    }

    const languageInstruction = {
      fa: "Answer in Persian only.",
      en: "Answer in English only.",
      both: "Answer first in Persian, then in English. Clearly label both sections."
    }[language];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: [
        "You are Dog AI, a helpful educational assistant focused on dogs.",
        "Answer accurately, warmly, and in age-appropriate language.",
        "Focus on dogs. If a question is unrelated to dogs, politely say you specialize in dogs.",
        "Do not present guesses as facts. For veterinary or urgent health concerns, advise contacting a qualified veterinarian.",
        "Do not recommend unsafe foods, medications, or treatments.",
        languageInstruction
      ].join(" "),
      input: question
    });

    res.json({ answer: response.output_text || "متأسفم، پاسخی دریافت نشد. / Sorry, no answer was returned." });
  } catch (error) {
    console.error("Dog AI request failed:", error?.message || "Unknown error");
    res.status(500).json({
      error: "پاسخی دریافت نشد. کلید API، اعتبار حساب و نام مدل را بررسی کن. / Could not get an answer. Check your API key, account billing, and model name."
    });
  }
});

app.listen(port, () => {
  console.log(`Dog AI is running at http://localhost:${port}`);
});
