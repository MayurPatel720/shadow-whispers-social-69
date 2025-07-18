
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MessageCircle, Shield, Users } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const OnboardingStep5: React.FC<StepProps> = ({ onNext, onBack }) => {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Start Chatting Anonymously</h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto px-4">
            If you like someone's post or profile, start a chat – no names, no pressure, just pure vibe. Stay anonymous, always.
          </p>
        </div>

        <div className="space-y-6 px-4 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-4 sm:p-6 bg-black/30 rounded-xl border border-purple-800/30">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-3 sm:mb-4" />
              <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Whisper Messages</h3>
              <p className="text-xs sm:text-sm text-gray-400 text-center">Send anonymous messages to users you find interesting</p>
            </div>
            <div className="flex flex-col items-center p-4 sm:p-6 bg-black/30 rounded-xl border border-purple-800/30">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-3 sm:mb-4" />
              <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Always Anonymous</h3>
              <p className="text-xs sm:text-sm text-gray-400 text-center">Your identity remains hidden throughout conversations</p>
            </div>
            <div className="flex flex-col items-center p-4 sm:p-6 bg-black/30 rounded-xl border border-purple-800/30">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-3 sm:mb-4" />
              <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Smart Matching</h3>
              <p className="text-xs sm:text-sm text-gray-400 text-center">Connect with people who share your interests</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-xl p-4 sm:p-6 border border-purple-700/50 max-w-md mx-auto">
            <h3 className="text-white font-medium mb-3 text-sm sm:text-base">How it works:</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">1.</span>
                See someone's post you like? Click to whisper
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">2.</span>
                Start a conversation anonymously
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">3.</span>
                Build genuine connections without judgment
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">4.</span>
                Reveal your identity only when you're ready
              </li>
            </ul>
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
          <Button
            onClick={onNext}
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

export default OnboardingStep5;
