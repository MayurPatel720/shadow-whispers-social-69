import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Mail, Check } from "lucide-react";
import { api } from "@/lib/api";

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const VerifyEmail: React.FC = () => {
  // Try to fetch the registration email from query param
  const location = useLocation();
  const navigate = useNavigate();
  const [otpResent, setOtpResent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailFromQS =
    new URLSearchParams(location.search).get("email") || "";

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: emailFromQS,
      otp: "",
    },
  });

  const onSubmit = async (data: { email: string; otp: string }) => {
    setSubmitting(true);
    try {
      await api.post("/api/users/verify-email", {
        email: data.email,
        otp: data.otp,
      });
      toast({
        title: "Email Verified!",
        description: "You may now login and enjoy the shadows.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
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
      const email = form.getValues("email");
      await api.post("/api/users/resend-verification-email", { email });
      toast({
        title: "OTP Resent",
        description: "We've sent you a new code. Check your inbox.",
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-purple-900 to-black items-center justify-center">
      <Card className="w-full max-w-md border-purple-700/30 bg-black/40 backdrop-blur-lg text-gray-50 shadow-xl">
        <CardHeader className="text-center border-b border-purple-800/30 pb-4">
          <CardTitle className="text-2xl font-bold text-purple-400">
            Verify your email address
          </CardTitle>
          <CardDescription className="text-gray-400 pt-2">
            We've sent a <span className="font-semibold text-purple-400">6-digit code</span> to your email.
            Enter it below to join the realm.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Show the email address directly */}
              <div className="text-purple-200 text-center text-sm pb-4">
                Code sent to: <span className="font-bold">{emailFromQS}</span>
              </div>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value || ""}
                        onChange={field.onChange}
                        containerClassName="mb-1 flex justify-center"
                        className="text-xl tracking-widest text-center bg-gray-900/40 border-purple-700/50 rounded"
                        inputMode="numeric"
                        autoFocus
                        render={({ slots }) => (
                          <InputOTPGroup className="justify-center">
                            {Array.isArray(slots) && slots.length === 6
                              ? slots.map((_, idx) => (
                                  <InputOTPSlot
                                    key={idx}
                                    index={idx}
                                    className="bg-gray-900/70 border-purple-800/40 text-lg md:text-2xl h-12 w-12 md:w-14 md:h-14"
                                  />
                                ))
                              : null}
                          </InputOTPGroup>
                        )}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-center font-semibold" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 py-3 text-lg font-medium"
                disabled={submitting}
              >
                {submitting ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 pt-4 pb-6">
          <Button
            variant="ghost"
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-purple-400 hover:text-purple-300"
          >
            {resendLoading ? "Resending..." : "Resend code"}
          </Button>
          {otpResent && (
            <span className="text-xs text-green-400">A new code has been sent!</span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
