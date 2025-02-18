export const telegramService = {
  sendToAdmin: async (message: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/telegram/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        },
      );
      if (!response.ok) throw new Error("Failed to send message");
    } catch (error) {
      console.error("Error sending message to Telegram:", error);
    }
  },

  // Instead of direct bot integration, we'll use WebSocket for admin responses
  setupAdminResponses: (callback: (message: string) => void) => {
    // This will now be handled through the WebSocket connection in chat.ts
  },
};
