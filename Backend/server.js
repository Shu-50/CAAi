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

// 8️⃣ Database utilities (Development only)
app.post("/dev/reset-sequences", async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "Not allowed in production" });
    }

    // Reset Bill sequence
    const maxBillId = await prisma.bill.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    const nextBillId = maxBillId ? maxBillId.id + 1 : 1;
    await prisma.$executeRaw`ALTER SEQUENCE "Bill_id_seq" RESTART WITH ${nextBillId}`;

    // Reset Item sequence
    const maxItemId = await prisma.item.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    const nextItemId = maxItemId ? maxItemId.id + 1 : 1;
    await prisma.$executeRaw`ALTER SEQUENCE "Item_id_seq" RESTART WITH ${nextItemId}`;

    res.json({
      message: "✅ Sequences reset successfully",
      nextBillId,
      nextItemId
    });
  } catch (err) {
    console.error("❌ Reset sequences error:", err);
    res.status(500).json({ error: "Failed to reset sequences" });
  }
});

// 9️⃣ Compact IDs (Renumber all records)
app.post("/dev/compact-ids", async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "Not allowed in production" });
    }

    // Get all bills ordered by current ID
    const bills = await prisma.bill.findMany({
      orderBy: { id: 'asc' },
      include: { items: true }
    });

    // Delete all bills and items
    await prisma.item.deleteMany({});
    await prisma.bill.deleteMany({});

    // Reset sequences to 1
    await prisma.$executeRaw`ALTER SEQUENCE "Bill_id_seq" RESTART WITH 1`;
    await prisma.$executeRaw`ALTER SEQUENCE "Item_id_seq" RESTART WITH 1`;

    // Recreate bills with new consecutive IDs
    const newBills = [];
    for (const bill of bills) {
      const { id, items, ...billData } = bill;

      const newBill = await prisma.bill.create({
        data: {
          ...billData,
          items: {
            create: items.map(({ id, billId, ...itemData }) => itemData)
          }
        },
        include: { items: true }
      });

      newBills.push(newBill);
    }

    res.json({
      message: "✅ IDs compacted successfully",
      billsProcessed: newBills.length,
      newBills
    });
  } catch (err) {
    console.error("❌ Compact IDs error:", err);
    res.status(500).json({ error: "Failed to compact IDs" });
  }
});

// 🔟 User Settings Management
app.get("/settings", async (req, res) => {
  try {
    let settings = await prisma.userSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {}
      });
    }

    res.json(settings);
  } catch (err) {
    console.error("❌ Get settings error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.put("/settings", async (req, res) => {
  try {
    const settingsData = req.body;

    let settings = await prisma.userSettings.findFirst();

    if (settings) {
      settings = await prisma.userSettings.update({
        where: { id: settings.id },
        data: settingsData
      });
    } else {
      settings = await prisma.userSettings.create({
        data: settingsData
      });
    }

    res.json(settings);
  } catch (err) {
    console.error("❌ Update settings error:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// 1️⃣1️⃣ Budget Management
app.get("/budgets", async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(budgets);
  } catch (err) {
    console.error("❌ Get budgets error:", err);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

app.post("/budgets", async (req, res) => {
  try {
    const budget = await prisma.budget.create({
      data: req.body
    });
    res.json(budget);
  } catch (err) {
    console.error("❌ Create budget error:", err);
    res.status(500).json({ error: "Failed to create budget" });
  }
});

app.put("/budgets/:id", async (req, res) => {
  try {
    const budgetId = parseInt(req.params.id);
    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: req.body
    });
    res.json(budget);
  } catch (err) {
    console.error("❌ Update budget error:", err);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

app.delete("/budgets/:id", async (req, res) => {
  try {
    const budgetId = parseInt(req.params.id);
    await prisma.budget.update({
      where: { id: budgetId },
      data: { isActive: false }
    });
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("❌ Delete budget error:", err);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

// 1️⃣2️⃣ Notifications Management
app.get("/notifications", async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (err) {
    console.error("❌ Get notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/notifications", async (req, res) => {
  try {
    const notification = await prisma.notification.create({
      data: req.body
    });
    res.json(notification);
  } catch (err) {
    console.error("❌ Create notification error:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

app.put("/notifications/:id/read", async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (err) {
    console.error("❌ Mark notification read error:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// 1️⃣3️⃣ Enhanced Analytics with Budget Comparison
app.get("/analytics/budget-comparison", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get bills in date range
    const bills = await prisma.bill.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: { items: true }
    });

    // Get active budgets
    const budgets = await prisma.budget.findMany({
      where: { isActive: true }
    });

    // Calculate spending by category
    const categorySpending = {};
    bills.forEach(bill => {
      bill.items?.forEach(item => {
        const category = item.category || 'others';
        categorySpending[category] = (categorySpending[category] || 0) + (item.price || 0);
      });
    });

    // Compare with budgets
    const budgetComparison = budgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        ...budget,
        spent,
        remaining: Math.max(0, budget.amount - spent),
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });

    res.json({
      categorySpending,
      budgetComparison,
      totalSpent: Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0),
      totalBudget: budgets.reduce((sum, budget) => sum + budget.amount, 0)
    });
  } catch (err) {
    console.error("❌ Budget comparison error:", err);
    res.status(500).json({ error: "Failed to get budget comparison" });
  }
});

// 1️⃣4️⃣ Data Export
app.get("/export/bills", async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;

    const bills = await prisma.bill.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: { items: true },
      orderBy: { date: 'desc' }
    });

    if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Bill ID,Vendor,Date,Total,Item Name,Quantity,Price,Category,GST,CGST,SGST\n';

      bills.forEach(bill => {
        if (bill.items && bill.items.length > 0) {
          bill.items.forEach(item => {
            csv += `${bill.id},"${bill.vendor || ''}","${bill.date || ''}",${bill.total || 0},"${item.name || ''}",${item.qty || 0},${item.price || 0},"${item.category || ''}",${item.gst || 0},${item.cgst || 0},${item.sgst || 0}\n`;
          });
        } else {
          csv += `${bill.id},"${bill.vendor || ''}","${bill.date || ''}",${bill.total || 0},"","","","","","",""\n`;
        }
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bills-export.csv"');
      res.send(csv);
    } else {
      res.json({
        exportDate: new Date().toISOString(),
        totalBills: bills.length,
        dateRange: { startDate, endDate },
        bills
      });
    }
  } catch (err) {
    console.error("❌ Export error:", err);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// 1️⃣5️⃣ Bulk Operations
app.post("/bills/bulk-delete", async (req, res) => {
  try {
    const { billIds } = req.body;

    // Delete items first
    await prisma.item.deleteMany({
      where: { billId: { in: billIds } }
    });

    // Delete bills
    const result = await prisma.bill.deleteMany({
      where: { id: { in: billIds } }
    });

    res.json({
      message: `${result.count} bills deleted successfully`,
      deletedCount: result.count
    });
  } catch (err) {
    console.error("❌ Bulk delete error:", err);
    res.status(500).json({ error: "Failed to delete bills" });
  }
});

app.put("/bills/bulk-update", async (req, res) => {
  try {
    const { billIds, updateData } = req.body;

    const result = await prisma.bill.updateMany({
      where: { id: { in: billIds } },
      data: updateData
    });

    res.json({
      message: `${result.count} bills updated successfully`,
      updatedCount: result.count
    });
  } catch (err) {
    console.error("❌ Bulk update error:", err);
    res.status(500).json({ error: "Failed to update bills" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
