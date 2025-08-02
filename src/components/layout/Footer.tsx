
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
	const location = useLocation();
	
	// Only show footer on profile route
	if (location.pathname !== "/profile") {
		return null;
	}

	return (
		<footer className="bg-card border-t border-border mt-auto">
			<div className="container mx-auto px-4 py-4 sm:py-6">
				<div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 gap-4">
					<div className="flex items-center space-x-2 order-2 sm:order-1">
						<img
							src="/lovable-uploads/UnderKover_logo2.png"
							alt="UnderKover"
							className="w-5 h-5 sm:w-6 sm:h-6"
						/>
						<span className="text-purple-500 font-semibold text-sm sm:text-base">UnderKover</span>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground order-1 sm:order-2">
						<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
							<Link
								to="/privacy-policy"
								className="hover:text-purple-500 transition-colors whitespace-nowrap"
							>
								Privacy Policy
							</Link>
							<span className="text-muted-foreground/50 hidden sm:inline">•</span>
							<Link
								to="/terms-and-conditions"
								className="hover:text-purple-500 transition-colors whitespace-nowrap"
							>
								Terms & Conditions
							</Link>
							<span className="text-muted-foreground/50 hidden sm:inline">•</span>
							<a
								href="mailto:underkover.in@gmail.com?subject=Support%20Request&body=Hi%20UnderKover%20Team%2C"
								className="hover:text-purple-500 transition-colors whitespace-nowrap"
							>
								Contact Us
							</a>
						</div>
						<div className="flex items-center gap-2 mt-2 sm:mt-0">
							<span className="text-muted-foreground/50 hidden sm:inline">•</span>
							<span className="text-center">© 2025 UnderKover. All rights reserved.</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
