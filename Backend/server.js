import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// 📂 File upload (Multer)
const upload = multer({ dest: "uploads/" });

// 🤖 Google GenAI setup
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

/**
 * Helper: classify category based on item name
 */
function classifyCategory(name) {
  const lower = name.toLowerCase();
  if (name.match(/shirt|pant|jeans|tshirt|dress|kurta/)) return "clothes";
  if (name.match(/pan|pot|spoon|plate|bowl/)) return "utensils";
  if (name.match(/hammer|screwdriver|drill|tool/)) return "tools";
  if (name.match(/phone|laptop|charger|tv|earphones/)) return "electronics";
  if (name.match(/lipstick|cream|makeup|shampoo|soap/)) return "makeup";
  if (name.match(/rice|bread|milk|snack|food|biscuit/)) return "food";
  if (name.match(/toothpaste|toothbrush|sanitizer/)) return "personal care";

  return "others";
}


// 1️⃣ Extract data from bill image
app.post("/extract", upload.single("image"), async (req, res) => {
  try {
    console.log("📥 File received:", req.file);

    const filePath = req.file.path;
    const imageData = fs.readFileSync(filePath);
    const base64Image = Buffer.from(imageData).toString("base64");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: req.file.mimetype, data: base64Image } },
        {
          text: `
Extract details from this bill / receipt.
Return JSON only with keys:
vendor, date, total, 
items:[{name, qty, price, gst, cgst, sgst, category}]

Where "category" should be one of:
["clothes", "utensils", "tools", "electronics", "makeup", "food", "personal care", "others"].
Do NOT include explanations or extra text.
          `,
        },
      ],
    });

    fs.unlinkSync(filePath);

    // ✅ Parse AI output
    let extractedJson;
    try {
      let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("📦 Raw AI Text:", text);

      // Strip markdown ```json ``` fences
      text = text.replace(/```json|```/g, "").trim();
      extractedJson = JSON.parse(text);

      // ✅ Let Gemini decide category
      // Fallback only if category is missing
      if (extractedJson.items) {
        extractedJson.items = extractedJson.items.map((item) => ({
          ...item,
          category:
            item.category ||
            classifyCategory(item.name || ""), // fallback only
        }));
      }
    } catch (err) {
      console.error("❌ JSON parse failed:", err);
      return res.status(500).json({ error: "Failed to parse AI response", raw: result });
    }

    res.json({ extractedData: extractedJson });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// 2️⃣ Save bill to DB
app.post("/bills", async (req, res) => {
  try {
    const { vendor, date, total, items } = req.body;

    const bill = await prisma.bill.create({
      data: {
        vendor,
        date: date ? new Date(date) : null,
        total: total ? parseFloat(total) : null,
        items: {
          create: items?.map((it) => ({
            name: it.name,
            qty: it.qty,
            price: it.price,
            gst: it.gst,
            cgst: it.cgst,
            sgst: it.sgst,
            category: it.category || classifyCategory(it.name || ""),
          })) || [],
        },
      },
      include: { items: true },
    });

    res.json(bill);
  } catch (err) {
    console.error("❌ Error saving bill:", err);
    res.status(500).json({ error: "Failed to save bill" });
  }
});
// 4️⃣ Delete bill by ID
app.delete("/bills/:id", async (req, res) => {
  try {
    const billId = parseInt(req.params.id);

    // Delete all items first (because of foreign key constraint)
    await prisma.item.deleteMany({
      where: { billId: billId },
    });

    // Then delete the bill
    await prisma.bill.delete({
      where: { id: billId },
    });

    res.json({ message: `🗑️ Bill ${billId} deleted successfully` });
  } catch (err) {
    console.error("❌ Delete bill error:", err);
    res.status(500).json({ error: "Failed to delete bill" });
  }
});

// 3️⃣ Get all bills
app.get("/bills", async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({ include: { items: true } });
    res.json(bills);
  } catch (err) {
    console.error("❌ Error fetching bills:", err);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

// Update bill by ID
// Update bill by ID (PATCH-style)
app.put("/bills/:id", async (req, res) => {
  try {
    const billId = parseInt(req.params.id);
    const { vendor, date, total, items } = req.body;

    // Update bill core info
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        vendor,
        date: date ? new Date(date) : null,
        total: total ? parseFloat(total) : null,
      },
    });

    // Update each item (if id exists → update, else → create)
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          await prisma.item.update({
            where: { id: item.id },
            data: {
              name: item.name,
              qty: item.qty,
              price: item.price,
              gst: item.gst,
              cgst: item.cgst,
              sgst: item.sgst,
            },
          });
        } else {
          await prisma.item.create({
            data: {
              name: item.name,
              qty: item.qty,
              price: item.price,
              gst: item.gst,
              cgst: item.cgst,
              sgst: item.sgst,
              billId: billId,
            },
          });
        }
      }
    }

    // Return updated bill with items
    const finalBill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { items: true },
    });

    res.json(finalBill);
  } catch (err) {
    console.error("Update bill error:", err);
    res.status(500).json({ error: "Failed to update bill" });
  }
});



// 5️⃣ Chatbot endpoint for CA Assistant
app.post("/chat", async (req, res) => {
  try {
    const { message, bills } = req.body;

    // Prepare context about user's bills for AI
    const billsContext = bills ? `
User's financial data:
- Total bills: ${bills.length}
- Total spending: ₹${bills.reduce((sum, bill) => sum + (bill.total || 0), 0)}
- Recent bills: ${bills.slice(-3).map(bill => `${bill.vendor}: ₹${bill.total}`).join(', ')}
- Categories: ${[...new Set(bills.flatMap(bill => bill.items?.map(item => item.category) || []))].join(', ')}
` : 'No financial data available yet.';

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `
You are a helpful CA (Chartered Accountant) Assistant for a bill tracking app. 
Provide financial advice, analyze spending patterns, and help with budgeting.

${billsContext}

User question: ${message}

Respond as a professional financial advisor. Be helpful, concise, and provide actionable advice.
If the user asks about their spending, use the provided financial data.
Keep responses under 200 words and use a friendly, professional tone.
          `,
        },
      ],
    });

    const response = result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help with your financial questions. Could you please be more specific?";

    res.json({ response });
  } catch (err) {
    console.error("🔥 Chat error:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// 6️⃣ Analytics endpoint
app.get("/analytics", async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({ include: { items: true } });

    // Calculate analytics
    const totalSpent = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const totalBills = bills.length;

    // Category breakdown
    const categoryData = {};
    bills.forEach(bill => {
      bill.items?.forEach(item => {
        const category = item.category || 'others';
        categoryData[category] = (categoryData[category] || 0) + (item.price || 0);
      });
    });

    // Monthly spending
    const monthlyData = {};
    bills.forEach(bill => {
      if (!bill.date) return;
      const monthKey = new Date(bill.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (bill.total || 0);
    });

    // Top vendors
    const vendorData = {};
    bills.forEach(bill => {
      const vendor = bill.vendor || 'Unknown';
      vendorData[vendor] = (vendorData[vendor] || 0) + (bill.total || 0);
    });

    res.json({
      totalSpent,
      totalBills,
      averageBill: totalBills > 0 ? totalSpent / totalBills : 0,
      categoryData,
      monthlyData,
      vendorData,
      recentBills: bills.slice(-5).reverse()
    });
  } catch (err) {
    console.error("❌ Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// 7️⃣ Delete item by ID
app.delete("/items/:id", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);

    await prisma.item.delete({
      where: { id: itemId },
    });

    res.json({ message: `🗑️ Item ${itemId} deleted successfully` });
  } catch (err) {
    console.error("❌ Delete item error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
