import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import TelegramBot from "node-telegram-bot-api";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Telegram bot
const bot = new TelegramBot(process.env.VITE_TELEGRAM_BOT_TOKEN, {
  polling: true,
});
const ADMIN_CHAT_ID = process.env.VITE_TELEGRAM_ADMIN_CHAT_ID;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store active chat sessions
const activeSessions = new Map();

// Track socket to user mapping
const socketToUser = new Map();

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(__dirname, "dist")));
}

// Register user
app.post("/api/chat/register", (req, res) => {
  const { name, email } = req.body;
  const userId = Date.now().toString();
  activeSessions.set(userId, { name, email, messages: [] });
  res.json({ userId });
});

// Handle Telegram messages from admin
bot.on("message", async (msg) => {
  if (msg.chat.id.toString() !== ADMIN_CHAT_ID || !msg.text) return;

  // Check if it's a reply to a user message
  if (msg.reply_to_message) {
    const userIdMatch = msg.reply_to_message.text.match(/User ID: (\d+)/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      const session = activeSessions.get(userId);
      if (session) {
        // Send admin's response to the specific user's socket
        io.to(userId).emit("admin-message", {
          id: Date.now().toString(),
          content: msg.text,
          sender: "admin",
          timestamp: new Date(),
        });

        // Store message in session
        session.messages.push({
          sender: "admin",
          content: msg.text,
          timestamp: new Date(),
        });

        // Update admin activity timestamp
        session.lastAdminActivity = Date.now();
      }
    }
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  // Handle user registration
  socket.on("register", ({ userId }) => {
    socket.join(userId);
    socketToUser.set(socket.id, userId);
  });

  // Handle user messages
  socket.on("user-message", async (message) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const session = activeSessions.get(userId);
    if (!session) return;

    try {
      // Store message in session
      session.messages.push({
        sender: "user",
        content: message.content,
        timestamp: new Date(),
      });

      // Format and send to Telegram with user context
      const formattedMessage = [
        `💬 New message from ${session.name} (${session.email})`,
        `User ID: ${userId}`,
        `Message: ${message.content}`,
      ].join("\n");

      await bot.sendMessage(ADMIN_CHAT_ID, formattedMessage);

      // Start AI response timeout if admin is not active
      const lastAdminActivity = session.lastAdminActivity || 0;
      if (Date.now() - lastAdminActivity > 10000) {
        socket.emit("ai-takeover");
      }
    } catch (error) {
      console.error("Error handling user message:", error);
    }
  });

  // Handle AI messages
  socket.on("ai-message", async (message) => {
    const userId = socketToUser.get(socket.id);
    if (!userId) return;

    const session = activeSessions.get(userId);
    if (!session) return;

    try {
      // Store AI message in session
      session.messages.push({
        sender: "ai",
        content: message.content,
        timestamp: new Date(),
      });

      // Format and send to Telegram
      const formattedMessage = [
        `🤖 AI Response to ${session.name}`,
        `User ID: ${userId}`,
        `Message: ${message.content}`,
      ].join("\n");

      await bot.sendMessage(ADMIN_CHAT_ID, formattedMessage);
    } catch (error) {
      console.error("Error handling AI message:", error);
    }
  });

  socket.on("disconnect", () => {
    const userId = socketToUser.get(socket.id);
    if (userId) {
      socketToUser.delete(socket.id);
    }
    console.log("Client disconnected");
  });
});

// Serve the Vite app for all other routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
