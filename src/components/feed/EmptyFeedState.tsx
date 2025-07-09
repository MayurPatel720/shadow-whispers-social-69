
import React from "react";
import { Button } from "@/components/ui/button";
import { Ghost, Plus, Shield, UserX, Eye, MessageSquare, Heart, Users } from "lucide-react";

interface EmptyFeedStateProps {
  onCreatePost: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onRegister: () => void;
}

const EmptyFeedState: React.FC<EmptyFeedStateProps> = ({
  onCreatePost,
  isAuthenticated,
  onLogin,
  onRegister
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="text-8xl mb-6 animate-pulse">👻</div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            The Underground Awaits
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Share your deepest thoughts, secrets, and confessions in complete anonymity. 
            No judgment, no fear, just raw truth.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Your Anonymity is Sacred</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="bg-green-500/20 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-400 text-sm">100% Anonymous</p>
                <p className="text-xs text-gray-400">No real names, ever</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <UserX className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-400 text-sm">No Tracking</p>
                <p className="text-xs text-gray-400">Your identity stays hidden</p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="bg-purple-500/20 p-3 rounded-full">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-purple-400 text-sm">Safe Space</p>
                <p className="text-xs text-gray-400">Judgment-free zone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Preview */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">What People Share</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Deep Confessions</span>
              </div>
              <p className="text-sm italic">"I've been pretending to be happy for years..."</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>Love Stories</span>
              </div>
              <p className="text-sm italic">"Still in love with my best friend from college..."</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ghost className="h-4 w-4" />
                <span>Hidden Truths</span>
              </div>
              <p className="text-sm italic">"What I would do if nobody was watching..."</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Life Struggles</span>
              </div>
              <p className="text-sm italic">"26 and still don't know what I want to do..."</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-lg text-purple-300 font-medium">Ready to speak your truth?</p>
              <Button
                onClick={onCreatePost}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              >
                <Ghost className="h-5 w-5 mr-2" />
                Share Your Secret
              </Button>
              <p className="text-xs text-gray-400">
                Your first post helps others feel less alone
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-purple-300 font-medium">Join thousands sharing their truth</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={onRegister}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Anonymous Account
                </Button>
                <Button
                  onClick={onLogin}
                  variant="outline"
                  size="lg"
                  className="border-purple-500 text-purple-300 hover:bg-purple-900/20 font-semibold px-6 py-3 rounded-xl"
                >
                  Login
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                No personal info required • Takes 30 seconds
              </p>
            </div>
          )}
        </div>

        {/* Social Proof */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            "This app gave me a safe space to finally be honest about my struggles. 
            The anonymity makes all the difference." - Anonymous User
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyFeedState;
