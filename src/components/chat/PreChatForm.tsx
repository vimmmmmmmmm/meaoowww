import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

interface PreChatFormProps {
  onSubmit?: (data: { name: string; email: string }) => void;
  isLoading?: boolean;
}

const PreChatForm = ({
  onSubmit = () => {},
  isLoading = false,
}: PreChatFormProps) => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-[400px] p-6 bg-white shadow-lg">
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-center">
          Start a Conversation
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Please fill in your details to begin chatting with our support team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Starting chat..." : "Start Chat"}
        </Button>
      </form>
    </Card>
  );
};

export default PreChatForm;
