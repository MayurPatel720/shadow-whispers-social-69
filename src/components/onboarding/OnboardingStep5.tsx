
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MessageCircle, Shield, Users } from "lucide-react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const OnboardingStep5: React.FC<StepProps> = ({ onNext, onBack }) => {
  return (
    <div className="flex flex-col p-8 h-full">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Start Chatting Anonymously</h2>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          If you like someone's post or profile, start a chat – no names, no pressure, just pure vibe. Stay anonymous, always.
        </p>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-black/30 rounded-xl border border-purple-800/30">
            <MessageCircle className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Whisper Messages</h3>
            <p className="text-sm text-gray-400 text-center">Send anonymous messages to users you find interesting</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-black/30 rounded-xl border border-purple-800/30">
            <Shield className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Always Anonymous</h3>
            <p className="text-sm text-gray-400 text-center">Your identity remains hidden throughout conversations</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-black/30 rounded-xl border border-purple-800/30">
            <Users className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-white font-medium mb-2">Smart Matching</h3>
            <p className="text-sm text-gray-400 text-center">Connect with people who share your interests</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-700/50 max-w-md mx-auto">
          <h3 className="text-white font-medium mb-3">How it works:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
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
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
        >
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep5;
