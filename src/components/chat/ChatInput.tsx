import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({
  onSendMessage = () => {},
  disabled = false,
  placeholder = "Type your message here...",
}: ChatInputProps) => {
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 bg-white border-t border-gray-200"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[50px] max-h-[150px] resize-none"
        rows={1}
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !message.trim()}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
