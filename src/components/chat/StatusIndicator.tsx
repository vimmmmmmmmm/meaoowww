import React from "react";
import { Loader2 } from "lucide-react";

interface StatusIndicatorProps {
  isTyping?: boolean;
  isOnline?: boolean;
  typingEntity?: "admin" | "ai";
}

const StatusIndicator = ({
  isTyping = false,
  isOnline = true,
  typingEntity = "admin",
}: StatusIndicatorProps) => {
  return (
    <div className="bg-white p-2 text-sm text-gray-500 flex items-center gap-2">
      {isOnline && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Online</span>
        </div>
      )}

      {isTyping && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {typingEntity === "admin" ? "Admin" : "AI Assistant"} is typing...
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
