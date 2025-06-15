
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { forgotPassword, resetPassword } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const ForgotPasswordModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Frontend validation: password min 8 chars
  const validPassword = newPassword.length >= 8;

  // Step 1: request reset
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast({ title: "Reset code sent", description: "Check your email for a reset code." });
      setStep("otp");
    } catch (err: any) {
      toast({ title: "Error", variant: "destructive", description: err?.response?.data?.message || "Failed to send reset code." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: submit OTP + new password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validPassword) {
      toast({ title: "Invalid Password", variant: "destructive", description: "Password must be at least 8 characters." });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast({ title: "Password reset", description: "You can now login with your new password." });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", variant: "destructive", description: err?.response?.data?.message || "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  };

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail("");
      setOtp("");
      setNewPassword("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
        </DialogHeader>
        {step === "email" ? (
          <form onSubmit={handleRequest} className="space-y-3">
            <DialogDescription>Enter your email to get a reset code.</DialogDescription>
            <Input type="email" required placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Code"}</Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-3">
            <DialogDescription>Enter the reset code and a new password.</DialogDescription>
            <Input type="text" required placeholder="Reset code" value={otp} onChange={e => setOtp(e.target.value)} />
            <Input type="password" required minLength={8} placeholder="New password (min 8 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Button type="submit" className="w-full" disabled={loading || !validPassword}>{loading ? "Resetting..." : "Reset Password"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
