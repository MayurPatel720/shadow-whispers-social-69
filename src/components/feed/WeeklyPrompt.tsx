
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyPrompt } from "@/lib/api";
import { Sparkles } from "lucide-react";

type WeeklyPromptData = {
  promptText: string;
};

const WeeklyPromptBanner = () => {
  const { data, isLoading } = useQuery<WeeklyPromptData>({
    queryKey: ["weeklyPrompt"],
    queryFn: getWeeklyPrompt,
    refetchOnWindowFocus: true,
  });

  if (isLoading || !data) return null;

  return (
    <div className="bg-purple-800 text-white rounded-xl px-4 py-3 flex items-center space-x-3 mb-6 shadow-lg animate-fade-in">
      <Sparkles className="h-5 w-5 text-yellow-300" />
      <span>
        <strong>Weekly Prompt:</strong> {data.promptText}
      </span>
    </div>
  );
};

export default WeeklyPromptBanner;
