
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Eye, Heart } from "lucide-react";

interface StepProps {
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

const OnboardingStep1: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 text-center h-full min-h-[400px]">
      <div className="mb-6 sm:mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-2xl sm:text-3xl">👤</span>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
          Be Yourself, Anonymously
        </h2>
        <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-md mx-auto px-4">
          Post your thoughts, feelings, memes, secrets – without revealing your identity. 
          Everything is secure, anonymous, and 100% judgment-free.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full max-w-2xl px-4">
        <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-purple-800/30 hover:bg-black/40 transition-all">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-2 sm:mb-3" />
          <h3 className="text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">100% Anonymous</h3>
          <p className="text-xs sm:text-sm text-gray-400 text-center">Your real identity stays hidden</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-purple-800/30 hover:bg-black/40 transition-all">
          <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-2 sm:mb-3" />
          <h3 className="text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">Judgment-Free</h3>
          <p className="text-xs sm:text-sm text-gray-400 text-center">Express yourself freely</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-purple-800/30 hover:bg-black/40 transition-all">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-2 sm:mb-3" />
          <h3 className="text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base">Connect Safely</h3>
          <p className="text-xs sm:text-sm text-gray-400 text-center">Build genuine connections</p>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium rounded-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto max-w-xs"
      >
        Get Started
        <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
};

export default OnboardingStep1;
