
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, GraduationCap, Search } from "lucide-react";
import { OnboardingData } from "./OnboardingModal";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
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
      onNext();
    }
  };

  return (
    <div className="flex flex-col p-8 h-full">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your College</h2>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          Select your college to unlock and explore your college-exclusive feed.
        </p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search for your college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/60 border-purple-800/50 text-white"
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredColleges.map((college) => (
              <button
                key={college}
                onClick={() => setSelectedCollege(college)}
                className={`w-full p-3 text-left rounded-lg border transition-all ${
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
              className={`w-full p-3 text-left rounded-lg border transition-all ${
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
                className="bg-gray-900/60 border-purple-800/50 text-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedCollege || (selectedCollege === "custom" && !customCollege.trim())}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
        >
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
