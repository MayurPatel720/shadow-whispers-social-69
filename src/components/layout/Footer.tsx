import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="bg-card border-t border-border mt-auto">
			<div className="container mx-auto px-4 py-6">
				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<div className="flex items-center space-x-2">
						<img
							src="/lovable-uploads/UnderKover_logo2.png"
							alt="UnderKover"
							className="w-6 h-6"
						/>
						<span className="text-purple-500 font-semibold">UnderKover</span>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
						<Link
							to="/privacy-policy"
							className="hover:text-purple-500 transition-colors"
						>
							Privacy Policy
						</Link>
						<span className="text-muted-foreground/50">•</span>
						<Link
							to="/terms-and-conditions"
							className="hover:text-purple-500 transition-colors"
						>
							Terms & Conditions
						</Link>
						<span className="text-muted-foreground/50">•</span>
						<a
							href="mailto:underkover.in@gmail.com?subject=Support%20Request&body=Hi%20UnderKover%20Team%2C"
							className="hover:text-purple-500 transition-colors"
						>
							Contact Us
						</a>
						<span className="text-muted-foreground/50">•</span>
						<span>© 2025 UnderKover. All rights reserved.</span>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
