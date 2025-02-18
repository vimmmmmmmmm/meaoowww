import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import StatusIndicator from "./StatusIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender: "user" | "admin" | "ai";
  timestamp: Date;
}

interface MessageListProps {
  messages?: Message[];
  isTyping?: boolean;
  typingSource?: "admin" | "ai";
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

const MessageList = ({
  messages = defaultMessages,
  isTyping = false,
  typingSource = "admin",
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="h-[500px] w-full bg-white rounded-lg shadow-sm flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.content}
              type={message.sender}
              timestamp={message.timestamp}
            />
          ))}
          {isTyping && (
            <div className="ml-2">
              <StatusIndicator isTyping={true} source={typingSource} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
