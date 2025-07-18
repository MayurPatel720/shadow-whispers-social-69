
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Heart } from "lucide-react";
import { OnboardingData } from "./OnboardingModal";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const INTEREST_CATEGORIES = [
  { name: "Technology", interests: ["Programming", "AI/ML", "Gaming", "Gadgets", "Startups"] },
  { name: "Creative", interests: ["Art", "Music", "Photography", "Writing", "Design"] },
  { name: "Sports", interests: ["Cricket", "Football", "Basketball", "Fitness", "Yoga"] },
  { name: "Entertainment", interests: ["Movies", "TV Shows", "Anime", "Books", "Podcasts"] },
  { name: "Lifestyle", interests: ["Travel", "Food", "Fashion", "Beauty", "Health"] },
  { name: "Academic", interests: ["Science", "Engineering", "Business", "Literature", "Research"] },
];

const OnboardingStep4: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  onboardingData, 
  updateOnboardingData 
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    onboardingData.interests || []
  );

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    updateOnboardingData({ interests: selectedInterests });
    onNext();
  };

  return (
    <div className="flex flex-col p-8 h-full">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Add Your Interests</h2>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          We'll use this to match you with anonymous users who vibe with your energy.
        </p>
        <p className="text-sm text-purple-300 mt-2">
          Select at least 3 interests ({selectedInterests.length} selected)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 max-w-2xl mx-auto">
          {INTEREST_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3 className="text-white font-medium mb-3 text-lg">{category.name}</h3>
              <div className="flex flex-wrap gap-2">
                {category.interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                      selectedInterests.includes(interest)
                        ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                        : "bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-800/70"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
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
          disabled={selectedInterests.length < 3}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep4;
