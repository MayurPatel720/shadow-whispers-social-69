
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/api";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";
import OnboardingStep4 from "./OnboardingStep4";
import OnboardingStep5 from "./OnboardingStep5";
import OnboardingStep6 from "./OnboardingStep6";
import StepIndicator from "./StepIndicator";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface OnboardingData {
  college?: string;
  area?: string;
  interests?: string[];
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 6;

  // Reset to first step when modal opens
  useEffect(() => {
    if (open) {
      console.log("Onboarding modal opened, resetting state");
      setCurrentStep(1);
      setOnboardingData({});
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      console.log("Completing onboarding with data:", onboardingData);
      
      if (!user) {
        console.error("No user found when completing onboarding");
        return;
      }

      const updatedUserData = {
        ...user,
        ...onboardingData,
        onboardingComplete: true,
      };
      
      // Update via API
      const updatedUser = await updateUserProfile({
        ...onboardingData,
        onboardingComplete: true,
      });
      
      console.log("Onboarding completed successfully, updated user:", updatedUser);
      
      // Update local state
      updateUser(updatedUser);
      
      // Close modal
      onOpenChange(false);

      // Reset state
      setCurrentStep(1);
      setOnboardingData({});
      
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    console.log("Updating onboarding data:", data);
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    const stepProps = {
      onNext: handleNext,
      onBack: handleBack,
      onSkip: handleSkip,
      onboardingData,
      updateOnboardingData,
      isLoading,
      currentStep,
      totalSteps,
    };

    switch (currentStep) {
      case 1:
        return <OnboardingStep1 {...stepProps} />;
      case 2:
        return <OnboardingStep2 {...stepProps} />;
      case 3:
        return <OnboardingStep3 {...stepProps} />;
      case 4:
        return <OnboardingStep4 {...stepProps} />;
      case 5:
        return <OnboardingStep5 {...stepProps} />;
      case 6:
        return <OnboardingStep6 {...stepProps} />;
      default:
        return <OnboardingStep1 {...stepProps} />;
    }
  };

  // Don't render if user has already completed onboarding
  if (user?.onboardingComplete) {
    console.log("User has completed onboarding, not showing modal");
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-purple-800/50 flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full max-h-[95vh]">
          <div className="flex-shrink-0">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {renderStep()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
