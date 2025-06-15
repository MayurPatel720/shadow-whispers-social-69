
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const resetToken = searchParams.get('token');
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!resetToken) {
      toast({
        variant: 'destructive',
        title: 'Invalid Reset Link',
        description: 'This password reset link is invalid or has expired.',
      });
      navigate('/login');
    }
  }, [resetToken, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!resetToken) return;
    
    try {
      setIsLoading(true);
      await resetPassword(resetToken, data.password);
      setIsSuccess(true);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated successfully.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 items-center justify-center p-4">
        <Card className="w-full max-w-md border-purple-700/50 bg-black/40 backdrop-blur-md text-gray-100 shadow-xl">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
            <h2 className="text-2xl font-bold text-green-400 mb-4">Password Reset Successful!</h2>
            <p className="text-gray-300 mb-6">
              Your password has been updated successfully. You will be redirected to the login page shortly.
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 items-center justify-center p-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2">UnderCover</h1>
        <p className="text-gray-300 text-lg">Create your new password</p>
      </div>
      
      <Card className="w-full max-w-md border-purple-700/50 bg-black/40 backdrop-blur-md text-gray-100 shadow-xl">
        <CardHeader className="space-y-2 text-center border-b border-purple-800/30 pb-6">
          <CardTitle className="text-2xl font-bold text-purple-400">Reset Password</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          className="bg-gray-900/60 border-purple-800/50 pl-10 py-6" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} className="text-purple-400" /> : <Eye size={18} className="text-purple-400" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-300">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          className="bg-gray-900/60 border-purple-800/50 pl-10 py-6" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} className="text-purple-400" /> : <Eye size={18} className="text-purple-400" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg font-medium mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="text-center mt-8 text-gray-400 text-sm">
        <p>Remember to keep your new password secure and unique.</p>
      </div>
    </div>
  );
};

export default ResetPassword;
