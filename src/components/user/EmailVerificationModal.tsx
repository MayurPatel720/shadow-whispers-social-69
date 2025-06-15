
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resendVerificationOtp, verifyEmailOtp } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface EmailVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  open,
  onClose,
  onVerified,
  email,
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugResendResult, setDebugResendResult] = useState<any>(null);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyEmailOtp(otp);
      toast({ title: "Email verified!", description: "You can now post." });
      onVerified();
    } catch (err: any) {
      toast({
        title: "Incorrect code",
        description: err?.response?.data?.message || "Wrong OTP, try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setDebugResendResult(null);
    try {
      console.log("[FRONTEND RESEND DEBUG] Button clicked, calling resendVerificationOtp...");
      const result = await resendVerificationOtp();
      setDebugResendResult(result);
      console.log("[FRONTEND RESEND DEBUG] resendVerificationOtp result:", result);
      toast({ title: "Verification code sent", description: "Check your inbox." });
    } catch (error: any) {
      setDebugResendResult(error);
      console.error("[FRONTEND RESEND DEBUG] Error sending code:", error);

      let message =
        error?.response?.data?.message ||
        error?.message ||
        "Error sending code - check network/auth!";

      // Specific for 401 (auth failure)
      if (error?.response?.status === 401) {
        message = "Authentication error - please login again.";
      }

      toast({
        title: "Error sending code",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-sm text-muted-foreground">
          Enter the code sent to <b>{email}</b> to enable posting
        </p>
        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          maxLength={6}
          disabled={loading}
          data-testid="otp-input"
        />
        <DialogFooter>
          <Button variant="outline" onClick={handleResend} disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </span>
            ) : (
              "Resend Code"
            )}
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
        {/* Debug area for visibility */}
        {debugResendResult && (
          <pre className="text-xs mt-2 bg-gray-100 text-left p-2 rounded overflow-x-scroll max-h-[100px] text-red-500">
            {JSON.stringify(debugResendResult, null, 2)}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;
