
import React from "react";
import { Grid, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileStatsProps {
  userStats: any;
  onShowRecognitions: () => void;
}

const StatsCard = ({
  icon,
  value,
  label,
  onClick = () => {},
  clickable = false,
}: any) => {
  const baseClasses =
    "text-center p-2 border border-undercover-purple/20 rounded-md bg-undercover-dark/10";
  const hoverClasses = clickable
    ? "hover:cursor-pointer hover:border-undercover-purple/50 hover:bg-undercover-dark/20 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-300"
    : "";
  return (
    <div
      className={`${baseClasses} ${hoverClasses}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-bold text-sm sm:text-base">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

const ProfileStats: React.FC<ProfileStatsProps> = ({ userStats, onShowRecognitions }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <StatsCard icon={<Grid size={16} className="text-undercover-purple" />} value={userStats.posts} label="Posts" />
    <StatsCard
      icon={<Eye size={16} className="text-undercover-purple" />}
      value={userStats.recognizedBy}
      label="Recognized by"
      onClick={onShowRecognitions}
      clickable
    />
    <StatsCard
      icon={<Eye size={16} className="text-undercover-purple" />}
      value={userStats.recognized}
      label="Recognized"
      onClick={onShowRecognitions}
      clickable
    />
    <StatsCard
      icon={<Grid size={16} className="text-undercover-purple" />}
      value={`${userStats.recognitionRate}%`}
      label="Recognition rate"
    />
  </div>
);

export default ProfileStats;
