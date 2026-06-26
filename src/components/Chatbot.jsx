import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
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
        "Hello! I'm your personal **CA Assistant** powered by AI 🤖\n\nI can help you with:\n- 📊 Analyzing your spending patterns\n- 💰 Tax-saving advice (GST, CGST, SGST)\n- 🎯 Budget planning and recommendations\n- 🧾 Bill-by-bill breakdowns\n- 💡 Personalized financial tips\n\nWhat would you like to know today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [billCount, setBillCount] = useState(0);
  const [dbStatus, setDbStatus] = useState("connecting");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkDbStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkDbStatus = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BILLS);
      setBillCount(response.data.length);
      setDbStatus("connected");
    } catch (error) {
      console.error("Error connecting to DB:", error);
      setDbStatus("error");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendToApi = async (question) => {
    try {
      const response = await axios.post(API_ENDPOINTS.CHAT, {
        message: question,
      });
      return response.data.response;
    } catch (error) {
      console.error("Chat API error:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const currentMessage = inputMessage;
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const reply = await sendToApi(currentMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: reply,
          timestamp: new Date(),
        },
      ]);
      checkDbStatus();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content:
            "⚠️ I'm having trouble connecting to the server. Please make sure the backend is running on port 5000 and try again.",
          timestamp: new Date(),
        },
      ]);
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

  const handleQuickQuestion = async (question) => {
    if (isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const reply = await sendToApi(question);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: reply,
          timestamp: new Date(),
        },
      ]);
      checkDbStatus();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "⚠️ Server error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: "bot",
        content: "Chat cleared! How can I help you with your finances today? 😊",
        timestamp: new Date(),
      },
    ]);
  };

  const quickQuestions = [
    "What's my total spending?",
    "Show spending by category",
    "How much tax have I paid?",
    "Which vendor do I spend most at?",
    "Give me budgeting advice",
    "How can I save money?",
    "Show my most expensive bills",
    "What are my recent expenses?",
  ];

  const statusColors = {
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    error: "bg-red-500",
  };
  const statusLabels = {
    connecting: "Connecting...",
    connected: `Online · ${billCount} bill${billCount !== 1 ? "s" : ""} active`,
    error: "Connection Error",
  };

  const mdComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-lg font-bold mt-2 mb-1 text-blue-300" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-base font-bold mt-2 mb-1 text-blue-300" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-sm font-bold mt-1 mb-1 text-blue-300" {...props} />
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
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
    table: ({ node, ...props }) => (
      <table
        className="border-collapse border border-gray-600 my-2 text-xs w-full"
        {...props}
      />
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-gray-700" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className="border border-gray-600 px-2 py-1 font-semibold text-left text-blue-300"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-gray-600 px-2 py-1" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-blue-300" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-gray-300" {...props} />
    ),
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code
          className="bg-gray-800 px-1 rounded text-xs text-green-300"
          {...props}
        />
      ) : (
        <code
          className="block bg-gray-800 p-2 rounded my-1 text-xs overflow-x-auto text-green-300"
          {...props}
        />
      ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-blue-500 pl-3 italic text-gray-400 my-2"
        {...props}
      />
    ),
    hr: () => <hr className="border-gray-600 my-2" />,
  };

  return (
    <div className="space-y-4 animate-fadeIn h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">CA Assistant</h1>
          <p className="text-theme-secondary mt-1">
            Your personal financial advisor
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={clearChat}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Clear Chat
          </button>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 ${statusColors[dbStatus]} rounded-full ${
                dbStatus === "connected" ? "animate-pulse" : ""
              }`}
            />
            <span
              className={`text-sm font-medium ${
                dbStatus === "error"
                  ? "text-red-400"
                  : dbStatus === "connected"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {statusLabels[dbStatus]}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div
        className="bg-[#161b22] rounded-xl border border-[#30363d] flex flex-col"
        style={{ height: "65vh" }}
      >
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
                    message.type === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-[#21262d] text-gray-100 rounded-tl-sm border border-[#30363d]"
                  }`}
                >
                  {message.type === "bot" ? (
                    <div className="text-sm prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={mdComponents}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                  )}
                  <p className="text-xs opacity-50 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-1">
                    👤
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-[#21262d] text-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm border border-[#30363d]">
                  <div className="flex space-x-1 items-center">
                    <span className="text-xs text-gray-400 mr-2">
                      Analyzing your data
                    </span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Questions */}
        <div className="px-4 pt-3 pb-1 border-t border-[#30363d]">
          <p className="text-gray-500 text-xs mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                disabled={isTyping}
                className="px-2.5 py-1 bg-[#21262d] hover:bg-[#2d333b] disabled:opacity-40 text-gray-300 text-xs rounded-full transition-colors border border-[#30363d] hover:border-blue-500"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#30363d]">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your finances... (Enter to send, Shift+Enter for new line)"
              className="flex-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
            >
              {isTyping ? "..." : "Send ↵"}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600/20 border border-blue-600/40 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            📊
          </div>
          <div>
            <h3 className="text-[#f0f6fc] font-medium text-sm">
              Real-time Insights
            </h3>
            <p className="text-[#8b949e] text-xs">
              Up-to-date data from your bills
            </p>
          </div>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600/20 border border-green-600/40 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            💡
          </div>
          <div>
            <h3 className="text-[#f0f6fc] font-medium text-sm">
              AI-Powered Advice
            </h3>
            <p className="text-[#8b949e] text-xs">
              Tax savings &amp; budget planning
            </p>
          </div>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600/20 border border-purple-600/40 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            🇮🇳
          </div>
          <div>
            <h3 className="text-[#f0f6fc] font-medium text-sm">
              Indian Tax Laws
            </h3>
            <p className="text-[#8b949e] text-xs">
              GST, CGST, SGST expertise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
