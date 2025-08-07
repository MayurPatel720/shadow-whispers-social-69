import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Search, Filter } from "lucide-react";
import {
	INDIAN_COLLEGES,
	getPopularColleges,
	searchColleges,
	getCollegesByType,
	COLLEGE_TYPES,
	College,
} from "@/data/colleges";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollegeSelectionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCollegeSelect: (college: string) => void;
	currentCollege: string;
}

const CollegeSelectionDialog: React.FC<CollegeSelectionDialogProps> = ({
	open,
	onOpenChange,
	onCollegeSelect,
	currentCollege,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCollege, setSelectedCollege] = useState(currentCollege || "");
	const [customCollege, setCustomCollege] = useState("");
	const [selectedType, setSelectedType] = useState<string>("all");

	const filteredColleges = useMemo(() => {
		let colleges = INDIAN_COLLEGES;

		// Filter by search term
		if (searchTerm.trim()) {
			colleges = searchColleges(searchTerm);
		}

		// Filter by type
		if (selectedType !== "all") {
			colleges = colleges.filter((college) => college.type === selectedType);
		}

		// Show popular colleges first if no filters applied
		if (!searchTerm.trim() && selectedType === "all") {
			const popular = getPopularColleges();
			const others = colleges.filter(
				(c) => !popular.find((p) => p.id === c.id)
			);
			return [...popular, ...others].slice(0, 30);
		}

		return colleges.slice(0, 30);
	}, [searchTerm, selectedType]);

	const handleSubmit = () => {
		const college =
			selectedCollege === "custom" ? customCollege : selectedCollege;
		if (college.trim()) {
			onCollegeSelect(college.trim());
			onOpenChange(false);
		}
	};

	const handleCollegeSelect = (college: College | "custom") => {
		if (college === "custom") {
			setSelectedCollege("custom");
		} else if (typeof college === "object") {
			setSelectedCollege(college.name);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] flex flex-col p-0">
				<DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
					<DialogTitle className="flex items-center gap-2 text-lg">
						<GraduationCap className="h-5 w-5" />
						Select Your College
					</DialogTitle>
					<DialogDescription className="text-sm">
						Choose your college to see posts from your college community
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 px-6 overflow-auto">
					<div className="space-y-4 pb-4">
						{/* Search Input */}
						<div className="space-y-2">
							<Label htmlFor="college-search" className="text-sm font-medium">
								Search College
							</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="college-search"
									placeholder="Search for your college..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 h-10"
								/>
							</div>
						</div>

						{/* Type Filter */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Filter by Type</Label>
							<Select value={selectedType} onValueChange={setSelectedType}>
								<SelectTrigger className="h-10">
									<Filter className="w-4 h-4 mr-2" />
									<SelectValue placeholder="All Types" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{COLLEGE_TYPES.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* College List */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Select College</Label>
							<div className="space-y-2">
								{!searchTerm.trim() && selectedType === "all" && (
									<p className="text-xs text-muted-foreground mb-2">
										Popular colleges are shown first:
									</p>
								)}

								{filteredColleges.map((college) => (
									<button
										key={college.id}
										onClick={() => handleCollegeSelect(college)}
										className={`w-full p-3 text-left rounded border transition-all text-sm ${
											selectedCollege === college.name
												? "bg-primary/10 border-primary text-primary"
												: "hover:bg-muted/50"
										}`}
									>
										<div className="flex flex-col">
											<span className="font-medium">{college.name}</span>
											<span className="text-xs text-muted-foreground">
												{college.fullName}
											</span>
											<span className="text-xs text-muted-foreground">
												{college.city}, {college.state} • {college.type} •{" "}
												{college.category}
											</span>
										</div>
									</button>
								))}

								<button
									onClick={() => handleCollegeSelect("custom")}
									className={`w-full p-3 text-left rounded border transition-all text-sm ${
										selectedCollege === "custom"
											? "bg-primary/10 border-primary text-primary"
											: "hover:bg-muted/50"
									}`}
								>
									<div className="flex flex-col">
										<span className="font-medium">Other (Custom)</span>
										<span className="text-xs text-muted-foreground">
											Enter your college name manually
										</span>
									</div>
								</button>

								{filteredColleges.length === 0 && searchTerm.trim() && (
									<div className="text-center py-8 text-muted-foreground">
										<p className="text-sm mb-2">
											No colleges found for "{searchTerm}"
										</p>
										<p className="text-xs">
											Try searching with a different term or select "Other
											(Custom)"
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Custom College Input */}
						{selectedCollege === "custom" && (
							<div className="space-y-2">
								<Label htmlFor="custom-college" className="text-sm font-medium">
									Enter College Name
								</Label>
								<Input
									id="custom-college"
									placeholder="Enter your college name"
									value={customCollege}
									onChange={(e) => setCustomCollege(e.target.value)}
									className="h-10"
								/>
							</div>
						)}
					</div>
				</ScrollArea>

				{/* Action Buttons */}
				<div className="px-6 py-4 border-t flex-shrink-0">
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1 h-10"
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={
								!selectedCollege ||
								(selectedCollege === "custom" && !customCollege.trim())
							}
							className="flex-1 h-10"
						>
							Select College
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CollegeSelectionDialog;
