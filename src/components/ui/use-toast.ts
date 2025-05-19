
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { toast as shadcnToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

// Re-export the useToast hook from shadcn/ui
export const useToast = useShadcnToast;

// Create a unified toast API that uses sonner for simpler cases
// but falls back to shadcn/ui toast for more complex cases
export const toast = {
  // Basic toast methods using sonner
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
  
  // Advanced usage with full shadcn/ui API
  custom: shadcnToast
};
