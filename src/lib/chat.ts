import { io } from "socket.io-client";
import { getGeminiResponse } from "./gemini";

interface Message {
  id: string;
  content: string;
  sender: "user" | "admin" | "ai";
  timestamp: Date;
}

interface UserData {
  name: string;
  email: string;
}

class ChatService {
  private socket;
  private adminTimeout: NodeJS.Timeout | null = null;
  private onMessageCallback: ((message: Message) => void) | null = null;
  private messages: Message[] = [];
  private isAdminActive = false;
  private aiResponseDelay = 2000;
  private userId: string | null = null;
  private userData: UserData | null = null;

  constructor() {
    // Initialize without socket.io for now
    this.socket = {
      emit: () => {},
      on: () => {},
    };
    this.setupSocketListeners();
  }

  public async register(userData: UserData) {
    try {
      // Generate a random userId since we're not using a real backend
      const userId = Math.random().toString(36).substring(7);
      this.userId = userId;
      this.userData = userData;

      // Register socket with userId
      this.socket.emit("register", { userId });

      return userId;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  private setupSocketListeners() {
    this.socket.on("admin-message", (message: Message) => {
      this.isAdminActive = true;
      if (this.adminTimeout) {
        clearTimeout(this.adminTimeout);
      }
      this.messages.push(message);
      this.onMessageCallback?.(message);
      this.startAdminTimeout();
    });

    this.socket.on("ai-takeover", () => {
      this.isAdminActive = false;
      this.handleAIResponse();
    });

    this.socket.on("typing", (data: { sender: "admin" | "ai" }) => {
      this.onMessageCallback?.({
        id: "typing",
        content: "",
        sender: data.sender,
        timestamp: new Date(),
      });
    });
  }

  private async startAdminTimeout() {
    if (this.adminTimeout) {
      clearTimeout(this.adminTimeout);
    }

    this.adminTimeout = setTimeout(() => {
      this.isAdminActive = false;
      this.handleAIResponse();
    }, 10000);
  }

  private async handleAIResponse() {
    const lastUserMessage = this.getLastUserMessage();
    if (!lastUserMessage) return;

    // Get conversation context
    const recentMessages = this.messages
      .slice(-6)
      .map((m) => `${m.sender}: ${m.content}`);

    // Show typing indicator
    this.onMessageCallback?.({
      id: "typing",
      content: "",
      sender: "ai",
      timestamp: new Date(),
    });

    // Add natural delay
    await new Promise((resolve) => setTimeout(resolve, this.aiResponseDelay));

    const aiResponse = await getGeminiResponse(
      lastUserMessage.content,
      recentMessages,
    );
    const message: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: "ai",
      timestamp: new Date(),
    };

    this.messages.push(message);
    this.onMessageCallback?.(message);
    this.socket.emit("ai-message", message);
  }

  public async sendMessage(content: string) {
    if (!this.userId) throw new Error("User not registered");

    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    this.messages.push(message);
    this.socket.emit("user-message", message);

    if (!this.isAdminActive) {
      await this.handleAIResponse();
    }
  }

  public onMessage(callback: (message: Message) => void) {
    this.onMessageCallback = callback;
  }

  private getLastUserMessage(): Message | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sender === "user") {
        return this.messages[i];
      }
    }
    return null;
  }
}

export const chatService = new ChatService();
