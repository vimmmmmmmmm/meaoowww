import React, { useState, Suspense } from "react";
import PreChatForm from "@/components/chat/PreChatForm";
import { Card } from "@/components/ui/card";
import { chatService } from "@/lib/chat";

const ChatInterface = React.lazy(
  () => import("@/components/chat/ChatInterface"),
);

interface HomeProps {
  initialView?: "form" | "chat";
}

const Home = ({ initialView = "form" }: HomeProps) => {
  const [view, setView] = useState(initialView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const handlePreChatSubmit = async (data: { name: string; email: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      await chatService.register(data);
      setUserData(data);
      setView("chat");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[1200px] min-h-[800px] bg-white p-8 flex items-center justify-center">
        {view === "form" ? (
          <PreChatForm
            onSubmit={handlePreChatSubmit}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <div className="w-full max-w-[400px]">
            <Suspense fallback={<div>Loading chat...</div>}>
              <ChatInterface
                isOpen={true}
                initialMessages={[
                  {
                    id: "1",
                    content: `Hello ${userData?.name}! How can I help you today?`,
                    sender: "admin",
                    timestamp: new Date(),
                  },
                ]}
              />
            </Suspense>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Home;
