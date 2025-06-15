import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";

const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const Login = () => {
	const { login, isLoading } = useAuth();
	const navigate = useNavigate();
	const [showForgotModal, setShowForgotModal] = React.useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof loginSchema>) => {
		try {
			await login(data.email, data.password);
			toast({
				title: "Login successful",
				description: "Redirecting...",
			});
			navigate("/");
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Login failed",
				description: error.message || "Invalid credentials",
			});
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow-lg">
			<div className="text-center">
				<h1 className="text-2xl font-semibold text-foreground">
					Welcome back!
				</h1>
				<p className="text-sm text-muted-foreground">
					Login to continue exploring.
				</p>
			</div>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
				<div>
					<Label htmlFor="email">Email</Label>
					<Controller
						name="email"
						control={control}
						render={({ field }) => (
							<Input
								type="email"
								id="email"
								placeholder="Enter your email"
								{...field}
							/>
						)}
					/>
					{errors.email && (
						<p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
					)}
				</div>
				<div>
					<Label htmlFor="password">Password</Label>
					<Controller
						name="password"
						control={control}
						render={({ field }) => (
							<Input
								type="password"
								id="password"
								placeholder="Enter your password"
								{...field}
							/>
						)}
					/>
					{errors.password && (
						<p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
					)}
				</div>
				<Button disabled={isLoading} className="w-full">
					{isLoading ? (
						<>
							<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							Logging in...
						</>
					) : (
						"Login"
					)}
				</Button>
				<div className="flex justify-end mt-2">
					<button type="button"
						className="text-sm text-undercover-purple hover:underline"
						onClick={() => setShowForgotModal(true)}
					>
						Forgot password?
					</button>
				</div>
			</form>
			<ForgotPasswordModal open={showForgotModal} onOpenChange={setShowForgotModal} />
		</div>
	);
};

export default Login;
