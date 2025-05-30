
import { supabase } from "@/integrations/supabase/client";
import { Message, ConversationType } from "./types/conversationTypes";
import { withRetry, handleApiError } from "@/utils/errorUtils";
import { toast } from "sonner";

export class UnifiedMessageService {
  private static instance: UnifiedMessageService;

  public static getInstance(): UnifiedMessageService {
    if (!UnifiedMessageService.instance) {
      UnifiedMessageService.instance = new UnifiedMessageService();
    }
    return UnifiedMessageService.instance;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    attachments: string[] = []
  ): Promise<{ aiResponse: Message } | null> {
    try {
      return await withRetry(async () => {
        const { sendMessage } = await import('./api/messageService');
        return await sendMessage(conversationId, content, attachments);
      });
    } catch (error) {
      handleApiError(error, "Failed to send message");
      return null;
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      });
    } catch (error) {
      handleApiError(error, "Failed to load messages");
      return [];
    }
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      return await withRetry(async () => {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId);

        if (error) throw error;
        toast.success("Message deleted");
        return true;
      });
    } catch (error) {
      handleApiError(error, "Failed to delete message");
      return false;
    }
  }

  async regenerateMessage(messageId: string): Promise<Message | null> {
    try {
      // Implementation for message regeneration
      toast.info("Message regeneration coming soon!");
      return null;
    } catch (error) {
      handleApiError(error, "Failed to regenerate message");
      return null;
    }
  }
}

export const unifiedMessageService = UnifiedMessageService.getInstance();
