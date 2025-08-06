
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, GraduationCap, Search, Filter } from "lucide-react";
import { OnboardingData } from "./OnboardingModal";
import { INDIAN_COLLEGES, getPopularColleges, searchColleges, getCollegesByType, COLLEGE_TYPES, College } from "@/data/colleges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const OnboardingStep2: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  onSkip,
  onboardingData, 
  updateOnboardingData 
}) => {
  const [selectedCollege, setSelectedCollege] = useState(onboardingData.college || "");
  const [customCollege, setCustomCollege] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredColleges = useMemo(() => {
    let colleges = INDIAN_COLLEGES;

    // Filter by search term
    if (searchTerm.trim()) {
      colleges = searchColleges(searchTerm);
    }

    // Filter by type
    if (selectedType !== "all") {
      colleges = colleges.filter(college => college.type === selectedType);
    }

    // Show popular colleges first if no filters applied
    if (!searchTerm.trim() && selectedType === "all") {
      const popular = getPopularColleges();
      const others = colleges.filter(c => !popular.find(p => p.id === c.id));
      return [...popular, ...others].slice(0, 50);
    }

    return colleges.slice(0, 50);
  }, [searchTerm, selectedType]);

  const handleNext = () => {
    const college = selectedCollege === "custom" ? customCollege : selectedCollege;
    if (college.trim()) {
      updateOnboardingData({ college: college.trim() });
    }
    onNext();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleCollegeSelect = (college: College | "custom") => {
    if (college === "custom") {
      setSelectedCollege("custom");
    } else if (typeof college === "object") {
      setSelectedCollege(college.name);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Choose Your College</h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto px-4 mb-2">
            Select your college to unlock and explore your college-exclusive feed.
          </p>
          <p className="text-sm text-purple-300">(Optional - You can skip this step)</p>
        </div>

        <div className="max-w-md mx-auto w-full px-4 sm:px-0">
          <div className="mb-6">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search for your college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/60 border-purple-800/50 text-white h-12"
              />
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-gray-900/60 border-purple-800/50 text-white h-12">
                  <Filter className="w-4 h-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-purple-800/50">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  {COLLEGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* College List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {!searchTerm.trim() && selectedType === "all" && (
                <div className="mb-3">
                  <p className="text-xs text-purple-300 mb-2 font-medium">Popular Colleges:</p>
                </div>
              )}
              
              {filteredColleges.map((college) => (
                <button
                  key={college.id}
                  onClick={() => handleCollegeSelect(college)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm sm:text-base ${
                    selectedCollege === college.name
                      ? "bg-purple-600/30 border-purple-500 text-white"
                      : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{college.name}</span>
                    <span className="text-xs text-gray-400">
                      {college.fullName} • {college.city}, {college.state}
                    </span>
                    <span className="text-xs text-purple-400 capitalize">
                      {college.type} • {college.category}
                    </span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => handleCollegeSelect("custom")}
                className={`w-full p-3 text-left rounded-lg border transition-all text-sm sm:text-base ${
                  selectedCollege === "custom"
                    ? "bg-purple-600/30 border-purple-500 text-white"
                    : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">Other (Custom)</span>
                  <span className="text-xs text-gray-400">
                    Enter your college name manually
                  </span>
                </div>
              </button>

              {filteredColleges.length === 0 && searchTerm.trim() && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm mb-2">No colleges found for "{searchTerm}"</p>
                  <p className="text-xs">Try searching with a different term or select "Other (Custom)"</p>
                </div>
              )}
            </div>

            {/* Custom College Input */}
            {selectedCollege === "custom" && (
              <div className="mt-4">
                <Input
                  placeholder="Enter your college name"
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  className="bg-gray-900/60 border-purple-800/50 text-white h-12"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 sm:p-8 pt-0">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30 h-12 w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30 h-12 w-full sm:w-auto"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 h-12 w-full sm:w-auto"
            >
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep2;
