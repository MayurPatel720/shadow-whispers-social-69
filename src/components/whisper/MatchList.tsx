
import React from "react";
import { Card } from "@/components/ui/card";
import type { MatchProfile } from "@/types/match";
import LockedMatchCard from "./LockedMatchCard";
import { useNavigate } from "react-router-dom";

interface MatchListProps {
  matches: MatchProfile[];
  isPremium: boolean;
  onSelect: (profile: MatchProfile) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, isPremium, onSelect }) => {
  const visibleCount = isPremium ? 10 : 3;
  return (
    <div
      className={`grid gap-3 py-2 ${
        matches.length <= 2 ? "grid-cols-1" : "sm:grid-cols-2"
      }`}
    >
      {matches.slice(0, visibleCount).map((profile: MatchProfile) => (
        <button
          key={profile._id}
          className="block w-full text-left focus:outline-none"
          onClick={() => onSelect(profile)}
        >
          <Card className="relative p-4 flex items-center gap-3 hover:bg-undercover-purple/10 transition-colors cursor-pointer">
            <div className="text-2xl sm:text-3xl">{profile.avatarEmoji}</div>
            <div>
              <div className="font-medium">{profile.anonymousAlias}</div>
              <div className="text-xs text-gray-500">{profile.bio}</div>
              <div className="text-xs text-gray-500">
                Interests: {Array.isArray(profile.interests) && profile.interests.length > 0
                  ? profile.interests.join(", ")
                  : "Not specified"}
              </div>
              <div className="text-xs">
                Gender: <span className="capitalize">{profile.gender || "N/A"}</span>
              </div>
            </div>
          </Card>
        </button>
      ))}
      {!isPremium && matches.length > 3 &&
        Array.from({length: Math.min(10, matches.length) - 3}).map((_, i) => (
          <LockedMatchCard idx={i} key={`locked-${i}`} />
        ))
      }
    </div>
  );
};

export default MatchList;
