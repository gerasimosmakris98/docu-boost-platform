
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MagicLinkFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const MagicLinkForm = ({ isLoading, setIsLoading }: MagicLinkFormProps) => {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleMagicLinkAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This would typically call a context method
      // await signInWithMagicLink(email);
      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email to sign in.");
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleMagicLinkAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {magicLinkSent ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          <p className="text-sm">Magic link sent! Check your email to sign in.</p>
        </div>
      ) : (
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            "Send Magic Link"
          )}
        </Button>
      )}
    </form>
  );
};

export default MagicLinkForm;
