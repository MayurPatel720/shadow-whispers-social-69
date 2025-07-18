
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
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Be Yourself, Anonymously
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-md">
          Post your thoughts, feelings, memes, secrets – without revealing your identity. 
          Everything is secure, anonymous, and 100% judgment-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-2xl">
        <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-purple-800/30">
          <Shield className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-white font-medium mb-2">100% Anonymous</h3>
          <p className="text-sm text-gray-400 text-center">Your real identity stays hidden</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-purple-800/30">
          <Eye className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-white font-medium mb-2">Judgment-Free</h3>
          <p className="text-sm text-gray-400 text-center">Express yourself freely</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-black/30 rounded-lg border border-purple-800/30">
          <Heart className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-white font-medium mb-2">Connect Safely</h3>
          <p className="text-sm text-gray-400 text-center">Build genuine connections</p>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
      >
        Get Started
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};

export default OnboardingStep1;
