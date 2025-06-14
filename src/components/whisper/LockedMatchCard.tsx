
import React from "react";

interface LockedMatchCardProps {
  idx: number;
}

const LockedMatchCard: React.FC<LockedMatchCardProps> = ({ idx }) => (
  <div
    key={`locked-${idx}`}
    className="relative p-4 flex items-center gap-3 bg-muted/60 rounded-md border border-muted-foreground opacity-70"
  >
    <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
    <div>
      <div className="h-4 w-20 rounded bg-gray-300 mb-2"/>
      <div className="h-3 w-36 rounded bg-gray-200"/>
    </div>
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <span className="text-yellow-500 font-bold">Locked</span>
    </div>
  </div>
);

export default LockedMatchCard;
