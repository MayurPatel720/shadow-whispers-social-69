
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Lock, Link, Sparkles } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const OnboardingStep6: React.FC<StepProps> = ({ onNext, onBack, isLoading }) => {
  return (
    <div className="flex flex-col p-8 h-full">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Join or Create Ghost Circles</h2>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          These are private invite-only anonymous groups. Think of it as your secret society – totally hidden and secure.
        </p>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-black/30 rounded-xl border border-purple-800/30">
            <Lock className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Invite Only</h3>
            <p className="text-sm text-gray-400 text-center">Join exclusive circles via invitation links only</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-black/30 rounded-xl border border-purple-800/30">
            <Link className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Secret Links</h3>
            <p className="text-sm text-gray-400 text-center">Share special links with trusted friends</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50 max-w-md mx-auto mb-8">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            What are Ghost Circles?
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Private groups for close friends or interest-based communities</li>
            <li>• Share content visible only to circle members</li>
            <li>• Create your own or join existing ones</li>
            <li>• Perfect for study groups, hobby clubs, or friend circles</li>
            <li>• All interactions remain completely anonymous</li>
          </ul>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700/50">
            <span className="text-sm text-purple-300">
              🎉 You can explore Ghost Circles after completing onboarding!
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-8"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing...
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="mr-2 w-5 h-5" />
              Complete Onboarding
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep6;
