import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const registerSchema = z.object({
	username: z.string()
		.min(3, { message: "Username must be at least 3 characters" })
		.max(30, { message: "Username too long" }),
	fullName: z.string()
		.min(3, { message: "Full name required" }),
	email: z.string().email({ message: "Please enter a valid email" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }),
	referralCode: z.string().optional(),
});

const Register = () => {
	const { register, isLoading } = useAuth();
	const navigate = useNavigate();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			fullName: "",
			email: "",
			password: "",
			referralCode: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof registerSchema>) => {
		try {
			await register(data.username, data.fullName, data.email, data.password, data.referralCode);
			navigate("/");
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Registration failed",
				description: error.message || "An error occurred during registration",
			});
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow-lg">
			<div className="text-center">
				<h1 className="text-2xl font-semibold text-foreground">
					Create an account
				</h1>
			</div>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
				<div>
					<Label htmlFor="username">Username</Label>
					<Controller
						name="username"
						control={control}
						render={({ field }) => (
							<Input
								type="text"
								id="username"
								placeholder="Pick a username"
								{...field}
							/>
						)}
					/>
					{errors.username && (
						<p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
					)}
				</div>
				<div>
					<Label htmlFor="fullName">Full Name</Label>
					<Controller
						name="fullName"
						control={control}
						render={({ field }) => (
							<Input
								type="text"
								id="fullName"
								placeholder="Enter your full name"
								{...field}
							/>
						)}
					/>
					{errors.fullName && (
						<p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
					)}
				</div>
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
								placeholder="Enter a strong password (min 8 chars)"
								{...field}
							/>
						)}
					/>
					{errors.password && (
						<p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
					)}
				</div>
				<div>
					<Label htmlFor="referralCode">Referral Code (Optional)</Label>
					<Controller
						name="referralCode"
						control={control}
						render={({ field }) => (
							<Input
								type="text"
								id="referralCode"
								placeholder="Enter referral code"
								{...field}
							/>
						)}
					/>
					{errors.referralCode && (
						<p className="text-red-500 text-sm mt-1">{errors.referralCode.message}</p>
					)}
				</div>
				<Button disabled={isLoading} className="w-full">
					{isLoading ? "Registering..." : "Register"}
				</Button>
				<div className="flex justify-end mt-2">
					{/* Add a forgot password link for registration */}
					<span className="text-xs">Already have an account?</span>
					<a href="/login" className="ml-2 text-xs text-undercover-purple hover:underline">
						Login/Forgot Password
					</a>
				</div>
			</form>
		</div>
	);
};

export default Register;
