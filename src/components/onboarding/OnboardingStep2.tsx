
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, GraduationCap, Search } from "lucide-react";
import { OnboardingData } from "./OnboardingModal";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const POPULAR_COLLEGES = [
  "BVM", "ADIT", "GCET", "L.D. College of Engineering", "NIT Surat", 
  "Gujarat University", "Nirma University", "Parul University", "Ganpat University"
];

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

  const filteredColleges = POPULAR_COLLEGES.filter(college =>
    college.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search for your college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/60 border-purple-800/50 text-white h-12"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredColleges.map((college) => (
                <button
                  key={college}
                  onClick={() => setSelectedCollege(college)}
                  className={`w-full p-3 text-left rounded-lg border transition-all text-sm sm:text-base ${
                    selectedCollege === college
                      ? "bg-purple-600/30 border-purple-500 text-white"
                      : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                  }`}
                >
                  {college}
                </button>
              ))}
              <button
                onClick={() => setSelectedCollege("custom")}
                className={`w-full p-3 text-left rounded-lg border transition-all text-sm sm:text-base ${
                  selectedCollege === "custom"
                    ? "bg-purple-600/30 border-purple-500 text-white"
                    : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                }`}
              >
                Other (Custom)
              </button>
            </div>

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
