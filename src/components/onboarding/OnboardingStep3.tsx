
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

  return (
    <div className="flex flex-col p-8 h-full">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Set Your Location</h2>
        <p className="text-lg text-gray-300 max-w-md mx-auto mb-2">
          Want to connect locally? Set your city or area to view and post in location-based anonymous feeds.
        </p>
        <p className="text-sm text-purple-300">(Optional - You can skip this step)</p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="mb-6">
          <Input
            placeholder="Enter your city or area"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="mb-4 bg-gray-900/60 border-purple-800/50 text-white"
          />

          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-3">Popular areas:</p>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedArea === area
                      ? "bg-purple-600/30 border-purple-500 text-white"
                      : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-purple-800/30">
          <h3 className="text-white font-medium mb-2">Why set location?</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• See posts from people in your area</li>
            <li>• Connect with locals anonymously</li>
            <li>• Discover events and activities nearby</li>
            <li>• Your exact location is never shared</li>
          </ul>
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
        <div className="flex space-x-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
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
