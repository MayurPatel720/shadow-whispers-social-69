
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import { OnboardingData } from "./OnboardingModal";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const POPULAR_AREAS = [
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", 
  "Anand", "Mehsana", "Bhavnagar", "Jamnagar", "Junagadh"
];

const OnboardingStep3: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  onSkip, 
  onboardingData, 
  updateOnboardingData 
}) => {
  const [selectedArea, setSelectedArea] = useState(onboardingData.area || "");

  const handleNext = () => {
    if (selectedArea.trim()) {
      updateOnboardingData({ area: selectedArea.trim() });
    }
    onNext();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
  };

  return (
    <div className="flex flex-col p-4 sm:p-8 h-full min-h-[400px]">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Set Your Location</h2>
        <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto mb-2 px-4">
          Want to connect locally? Set your city or area to view and post in location-based anonymous feeds.
        </p>
        <p className="text-sm text-purple-300">(Optional - You can skip this step)</p>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-0">
        <div className="mb-6">
          <Input
            placeholder="Enter your city or area"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="mb-4 bg-gray-900/60 border-purple-800/50 text-white h-12 text-base"
          />

          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-3">Popular areas:</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {POPULAR_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => handleAreaSelect(area)}
                  className={`p-3 text-sm rounded-lg border transition-all hover:scale-105 ${
                    selectedArea === area
                      ? "bg-purple-600/50 border-purple-400 text-white shadow-lg"
                      : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:border-purple-600/50"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-purple-800/30 mb-6">
          <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Why set location?</h3>
          <ul className="text-xs sm:text-sm text-gray-400 space-y-1">
            <li>• See posts from people in your area</li>
            <li>• Connect with locals anonymously</li>
            <li>• Discover events and activities nearby</li>
            <li>• Your exact location is never shared</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 px-4 sm:px-0">
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
  );
};

export default OnboardingStep3;
