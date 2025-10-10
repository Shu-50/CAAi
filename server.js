import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

// File upload config
const upload = multer({ dest: "uploads/" });

// Initialize GenAI with API key
const ai = new GoogleGenAI({
  apiKey: "AIzaSyBqEacagNr06IHE9SvkZSJauZxoGAqdvjY" // replace with your key
});

app.post("/extract", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const imageData = fs.readFileSync(filePath);
    const base64Image = Buffer.from(imageData).toString("base64");

    // Send to GenAI for structured extraction
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: base64Image,
          },
        },
        {
          text: `
You are an OCR + data extraction engine. 
Extract details from this bill/receipt/cheque and return ONLY raw JSON.

JSON schema:
{
  "vendor": "string or null",
  "date": "string or null",
  "total": number or 0,
  "items": [
    {
      "name": "string or null",
      "qty": number or 0,
      "price": number or 0,
      "gst": number or 0,
      "cgst": number or 0,
      "sgst": number or 0,
      "category": "Food/Clothes/Travel/Other"
    }
  ]
}

⚠️ Rules:
- Always return "items" as an array (even if empty).
- No extra text, no explanation, no markdown — ONLY valid JSON.
          `
        }
      ]
    });

    fs.unlinkSync(filePath); // remove uploaded image

    // Normalize response
    let extractedJson = {};
    try {
      // Some models wrap JSON in ```json ... ```
      let cleanText = result.text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      extractedJson = JSON.parse(cleanText);

      // Guarantee structure
      if (!extractedJson.items || !Array.isArray(extractedJson.items)) {
        extractedJson.items = [];
      }

    } catch (err) {
      console.error("JSON parsing failed:", err);
      extractedJson = { error: "Failed to parse JSON", raw: result.text };
    }

    res.json({ extractedData: extractedJson });

  } catch (err) {
    console.error("Error extracting data:", err);
    res.status(500).json({ error: "Failed to extract data" });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
