
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
    try {
      await resendVerificationOtp();
      toast({ title: "Verification code sent", description: "Check your inbox." });
    } catch {
      toast({ title: "Error sending code", variant: "destructive" });
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
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;

