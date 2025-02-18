import React, { useState, useEffect } from "react";
import { chatService } from "@/lib/chat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import StatusIndicator from "./StatusIndicator";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  sender: "user" | "admin" | "ai";
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
}

const defaultMessages: Message[] = [
  {
    id: "1",
    content: "Hello! How can I help you today?",
    sender: "admin",
    timestamp: new Date(Date.now() - 50000),
  },
  {
    id: "2",
    content: "I have a question about your services",
    sender: "user",
    timestamp: new Date(Date.now() - 40000),
  },
  {
    id: "3",
    content: "I'd be happy to help you with that. What would you like to know?",
    sender: "ai",
    timestamp: new Date(Date.now() - 30000),
  },
];

const ChatInterface = ({
  isOpen = true,
  onClose = () => {},
  initialMessages = defaultMessages,
  onSendMessage = () => {},
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSource, setTypingSource] = useState<"admin" | "ai">("admin");

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    chatService.sendMessage(newMessage);
    setIsTyping(true);
  };

  React.useEffect(() => {
    chatService.onMessage((message) => {
      setIsTyping(false);
      setMessages((prev) => [...prev, message]);
    });
  }, []);

  if (!isOpen) return null;

  return (
    <Card className="w-[400px] h-[600px] bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <StatusIndicator isTyping={isTyping} typingEntity={typingSource} />
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          typingSource={typingSource}
        />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isTyping}
        placeholder="Type your message here..."
      />
    </Card>
  );
};

export default ChatInterface;
