
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { MailCheck, MailX } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const VerifyEmailSettings: React.FC<{ email: string }> = ({ email }) => {
  const [otpResent, setOtpResent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async ({ otp }: { otp: string }) => {
    setSubmitting(true);
    try {
      await api.post("/api/users/verify-email", {
        email,
        otp,
      });
      toast({
        title: "Email Verified!",
        description: "You may now post and explore all features.",
      });
      setVerified(true);
      window.location.reload(); // Reload to get fresh auth state/permissions
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid or expired code.",
        description:
          error?.response?.data?.message ||
          "Verification failed. Please check your code and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setOtpResent(false);
    try {
      await api.post("/api/users/resend-verification-email", { email });
      toast({
        title: "OTP Resent",
        description: "Check your inbox for the new code.",
      });
      setOtpResent(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description:
          error?.response?.data?.message ||
          "We couldn't send a new code right now. Try again soon!",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) return null;

  return (
    <Card className="bg-yellow-50/60 border-yellow-600/20 mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-yellow-800 flex items-center gap-2">
          <MailCheck className="text-yellow-700" size={20} />
          Verify Your Email Address
        </CardTitle>
        <CardDescription className="text-yellow-700 text-xs pt-1">
          You must verify your email to access all features (posting, chat, etc).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-1 text-sm font-medium text-black">
          Code sent to: <span className="text-purple-600">{email}</span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      containerClassName="mb-2 flex justify-center"
                      className="text-xl tracking-widest text-center bg-gray-50 border-purple-300 rounded"
                      inputMode="numeric"
                      autoFocus
                      render={({ slots }) => (
                        <InputOTPGroup className="justify-center">
                          {slots.map((_, idx) => (
                            <InputOTPSlot
                              key={idx}
                              index={idx}
                              className="bg-white border-purple-200 text-lg md:text-2xl h-10 w-10 md:w-12 md:h-12"
                            />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-center font-semibold" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 py-2 text-base font-medium"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </Form>
        <div className="flex flex-col items-center gap-1 mt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-purple-600 hover:text-purple-500 px-2 py-1"
          >
            {resendLoading ? "Resending..." : "Resend code"}
          </Button>
          {otpResent && (
            <span className="text-xs text-green-500">A new code has been sent!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifyEmailSettings;
