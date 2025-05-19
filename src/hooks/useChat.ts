
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Message, conversationService } from "@/services/conversationService";
import { toast } from "sonner";

export interface UseChatProps {
  conversationId?: string;
  initialMessages: Message[];
}

export function useChat({ conversationId, initialMessages }: UseChatProps) {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (
    messageText: string,
    attachments: { url: string; type: string; name: string }[] = []
  ) => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      return false;
    }
    if (!conversationId) {
      toast.error("Invalid conversation");
      return false;
    }

    // Create attachment URLs array
    const attachmentUrls = attachments.map(a => a.url);

    // Add user message to UI immediately
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
      attachments: attachmentUrls
    };

    setMessages(prev => [...prev, optimisticUserMessage]);

    // Add AI thinking message
    const optimisticAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: "...",
      created_at: new Date().toISOString()
    };

    setIsSending(true);
    setMessages(prev => [...prev, optimisticAiMessage]);

    try {
      // Send the message
      const response = await conversationService.sendMessage(conversationId, messageText, attachmentUrls);

      // Update messages with real AI response
      if (response && response.aiResponse) {
        setMessages(prev =>
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(response.aiResponse)
        );
        return true;
      } else {
        // If no AI response, remove the loading message
        setMessages(prev => prev.filter(msg => msg.id !== optimisticAiMessage.id));
        toast.error("Failed to get AI response");
        return false;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticAiMessage.id));
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isSending,
    messagesEndRef,
    handleSendMessage,
    setMessages
  };
}
