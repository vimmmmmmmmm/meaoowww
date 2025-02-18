import React from "react";
import { Avatar } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: string;
  timestamp?: Date | string;
  type?: "user" | "admin" | "ai";
  senderName?: string;
}

const MessageBubble = ({
  message = "Hello! How can I help you today?",
  timestamp = new Date().toLocaleTimeString(),
  type = "admin",
  senderName = "Support Agent",
}: MessageBubbleProps) => {
  const isUser = type === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2 mb-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          {type === "admin" ? (
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`}
              alt={senderName}
              className="h-full w-full"
            />
          ) : (
            <img
              src="/ai-avatar.png"
              alt="AI Assistant"
              className="h-full w-full"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=ai`;
              }}
            />
          )}
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isUser ? "bg-blue-100" : "bg-gray-100",
          )}
        >
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {!isUser && (
            <span className="text-xs text-gray-500">
              {type === "ai" ? "AI Assistant" : senderName}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {typeof timestamp === "string"
              ? timestamp
              : timestamp?.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
