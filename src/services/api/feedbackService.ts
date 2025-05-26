
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MessageFeedback {
  message_id: string;
  conversation_id: string;
  is_positive: boolean;
  feedback_text?: string;
}

/**
 * Submit feedback for a message
 */
export const submitMessageFeedback = async (feedback: MessageFeedback): Promise<boolean> => {
  try {
    console.log('Submitting message feedback:', feedback);
    
    const response = await supabase.functions.invoke('record-feedback', {
      body: feedback
    });
    
    if (response.error) {
      console.error('Error submitting feedback:', response.error);
      toast.error("Failed to submit feedback");
      return false;
    }
    
    console.log('Feedback submitted successfully');
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    toast.error("Failed to submit feedback");
    return false;
  }
};
