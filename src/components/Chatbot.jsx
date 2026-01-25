import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSettings } from "../hooks/useSettings.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Chatbot = () => {
  const { formatCurrency } = useSettings();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your personal CA Assistant. I can help you analyze your expenses, provide financial advice, and answer questions about your spending patterns. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bills, setBills] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchBills = async () => {
    try {
      const response = await axios.get("http://localhost:5000/bills");
      setBills(response.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const analyzeSpending = () => {
    const totalSpent = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const categoryData = {};

    bills.forEach((bill) => {
      bill.items?.forEach((item) => {
        const category = item.category || "others";
        categoryData[category] =
          (categoryData[category] || 0) + (item.price || 0);
      });
    });

    const topCategory = Object.entries(categoryData).sort(
      ([, a], [, b]) => b - a,
    )[0];

    return {
      totalSpent,
      totalBills: bills.length,
      topCategory: topCategory ? topCategory[0] : "none",
      topCategoryAmount: topCategory ? topCategory[1] : 0,
      averageBill: bills.length > 0 ? totalSpent / bills.length : 0,
      categoryData,
    };
  };

  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    const analysis = analyzeSpending();

    // Spending analysis queries
    if (
      lowerMessage.includes("total") &&
      (lowerMessage.includes("spent") || lowerMessage.includes("spending"))
    ) {
      return `You have spent a total of ${formatCurrency(analysis.totalSpent)} across ${analysis.totalBills} bills. Your average bill amount is ${formatCurrency(analysis.averageBill)}.`;
    }

    if (
      lowerMessage.includes("category") ||
      lowerMessage.includes("categories")
    ) {
      const categories = Object.entries(analysis.categoryData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      if (categories.length === 0) {
        return "You don't have any categorized expenses yet. Upload some bills to get started!";
      }

      let response = "Here's your spending breakdown by category:\n\n";
      categories.forEach(([category, amount], index) => {
        response += `${index + 1}. ${category.charAt(0).toUpperCase() + category.slice(1)}: ${formatCurrency(amount)}\n`;
      });

      return (
        response +
        `\nYour highest spending category is ${analysis.topCategory} with ${formatCurrency(analysis.topCategoryAmount)}.`
      );
    }

    if (
      lowerMessage.includes("advice") ||
      lowerMessage.includes("tips") ||
      lowerMessage.includes("suggest")
    ) {
      if (analysis.totalSpent === 0) {
        return "Upload some bills first so I can analyze your spending patterns and provide personalized advice!";
      }

      const advice = [
        `💡 Your top spending category is ${analysis.topCategory} (${formatCurrency(analysis.topCategoryAmount)}). Consider setting a monthly budget for this category.`,
        `📊 You have ${analysis.totalBills} bills with an average of ${formatCurrency(analysis.averageBill)} per bill.`,
        `💰 Track your daily expenses to identify small purchases that add up over time.`,
        `📱 Consider using digital payment methods to automatically track all your expenses.`,
        `🎯 Set specific savings goals and allocate a portion of your income towards them.`,
      ];

      return advice.join("\n\n");
    }

    if (lowerMessage.includes("budget") || lowerMessage.includes("save")) {
      const monthlySpending = analysis.totalSpent; // This could be refined to actual monthly data
      const suggestedBudget = monthlySpending * 0.8; // Suggest 20% reduction

      return `Based on your spending of ${formatCurrency(analysis.totalSpent)}, I suggest:\n\n💡 Set a monthly budget of ${formatCurrency(suggestedBudget)} (20% less than current spending)\n📊 Allocate 50% for needs, 30% for wants, 20% for savings\n🎯 Focus on reducing ${analysis.topCategory} expenses first\n💰 Track daily expenses to stay within budget`;
    }

    if (
      lowerMessage.includes("expensive") ||
      lowerMessage.includes("highest")
    ) {
      const expensiveBills = bills
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .slice(0, 3);

      if (expensiveBills.length === 0) {
        return "You don't have any bills uploaded yet. Upload some bills to see your highest expenses!";
      }

      let response = "Here are your most expensive bills:\n\n";
      expensiveBills.forEach((bill, index) => {
        response += `${index + 1}. ${bill.vendor || "Unknown Vendor"}: ${formatCurrency(bill.total)} (${bill.date ? new Date(bill.date).toLocaleDateString() : "No date"})\n`;
      });

      return response;
    }

    if (lowerMessage.includes("recent") || lowerMessage.includes("latest")) {
      const recentBills = bills
        .filter((bill) => bill.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      if (recentBills.length === 0) {
        return "You don't have any recent bills. Upload some bills to track your latest expenses!";
      }

      let response = "Here are your recent expenses:\n\n";
      recentBills.forEach((bill, index) => {
        response += `${index + 1}. ${bill.vendor || "Unknown"}: ${formatCurrency(bill.total)} (${new Date(bill.date).toLocaleDateString()})\n`;
      });

      return response;
    }

    // Default responses for common greetings and questions
    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey")
    ) {
      return "Hello! I'm here to help you manage your finances better. You can ask me about your spending patterns, get budgeting advice, or analyze your expenses by category. What would you like to know?";
    }

    if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what can you do")
    ) {
      return `I can help you with:\n\n📊 Analyze your spending patterns\n💰 Provide budgeting advice\n🏷️ Break down expenses by category\n📈 Show your most expensive purchases\n💡 Suggest ways to save money\n📱 Track your financial goals\n\nJust ask me questions like "What's my total spending?" or "Give me some budgeting tips!"`;
    }

    // Default response
    return "I understand you're asking about your finances. I can help you analyze spending, provide budgeting advice, or break down your expenses by category. Could you be more specific about what you'd like to know? For example, try asking 'What's my total spending?' or 'Give me some budgeting advice.'";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const currentMessage = inputMessage;
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Try to get AI response from backend
      const response = await axios.post("http://localhost:5000/chat", {
        message: currentMessage,
        bills: bills,
      });

      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat API error:", error);

      // Fallback to local response
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: generateResponse(currentMessage),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's my total spending?",
    "Show me spending by category",
    "Give me budgeting advice",
    "What are my most expensive bills?",
    "Show recent expenses",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">
            CA Assistant
          </h1>
          <p className="text-theme-secondary mt-1">
            Your personal financial advisor powered by AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Online</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-[#161b22] rounded-xl border border-[#30363d] flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {message.type === "bot" ? (
                    <div className="text-sm prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-lg font-bold mt-2 mb-1"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-base font-bold mt-2 mb-1"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-sm font-bold mt-1 mb-1"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-2 leading-relaxed" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc ml-4 mb-2" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal ml-4 mb-2" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          table: ({ node, ...props }) => (
                            <table
                              className="border-collapse border border-gray-600 my-2 text-xs w-full"
                              {...props}
                            />
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-gray-600" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              className="border border-gray-600 px-2 py-1 font-semibold text-left"
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              className="border border-gray-600 px-2 py-1"
                              {...props}
                            />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-bold text-blue-300"
                              {...props}
                            />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic" {...props} />
                          ),
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code
                                className="bg-gray-800 px-1 rounded text-xs"
                                {...props}
                              />
                            ) : (
                              <code
                                className="block bg-gray-800 p-2 rounded my-1 text-xs overflow-x-auto"
                                {...props}
                              />
                            ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Questions */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-3">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your finances..."
              className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-[#f0f6fc]">📊</span>
            </div>
            <div>
              <h3 className="text-[#f0f6fc] font-medium">Expense Analysis</h3>
              <p className="text-[#8b949e] text-sm">
                Get detailed spending insights
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-[#f0f6fc]">💡</span>
            </div>
            <div>
              <h3 className="text-[#f0f6fc] font-medium">Smart Advice</h3>
              <p className="text-[#8b949e] text-sm">
                Personalized financial tips
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-[#f0f6fc]">🎯</span>
            </div>
            <div>
              <h3 className="text-[#f0f6fc] font-medium">Budget Planning</h3>
              <p className="text-[#8b949e] text-sm">Create effective budgets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
