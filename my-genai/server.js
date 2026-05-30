require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Free AI API - Hugging Face Inference API
const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const API_TOKEN = process.env.HF_API_TOKEN || "hf_YourTokenHere";

app.post("/chat", async (req, res) => {

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: "Please provide a message" });
  }

  try {

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${userMessage} [/INST]`,
        parameters: {
          max_new_tokens: 256,
          return_full_text: false
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ reply: data.error });
    }

    // Handle both array and object responses
    const reply = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

    res.json({
      reply: reply || "No response generated"
    });

  } catch (error) {

    console.error("Error:", error.message);

    res.status(500).json({
      reply: "Error: " + error.message
    });
  }

});

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
  console.log("\n📝 To use AI, set your Hugging Face token:");
  console.log("   Windows (PowerShell): $env:HF_API_TOKEN = 'hf_your_token'");
  console.log("   Or create a .env file with: HF_API_TOKEN=hf_your_token\n");
});