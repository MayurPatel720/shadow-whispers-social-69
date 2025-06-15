
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ghost, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import InviteToCircleModal from "./InviteToCircleModal";
import AvatarGenerator from "@/components/user/AvatarGenerator";

interface GhostCircleCardProps {
  circle: {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    members: {
      userId: string;
      displayName?: string;
      anonymousAlias?: string;
      realUsername?: string | null;
      joinedAt?: string;
      avatarEmoji?: string;
    }[];
  };
  onSelect: (id: string, tab?: string) => void;
}

const GhostCircleCard: React.FC<GhostCircleCardProps> = ({ circle, onSelect }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  // Style tweaks for mobile polish
  return (
    <Card
      className={`
        glassmorphism border-0 shadow-lg ring-1 ring-purple-700/40 
        px-0.5 py-0 rounded-2xl md:rounded-3xl overflow-hidden
        transition-all duration-300
        bg-gradient-to-br from-[#1a134a]/70 via-[#24144e]/60 to-[#161625]/90
        !sm:min-h-0
      `}
      style={{ minHeight: 0 }}
    >
      {/* HEADER */}
      <CardHeader
        className="
          bg-gradient-to-r from-purple-700/60 via-purple-900/30 to-fuchsia-900/40 
          border-b-0 flex flex-col gap-1.5 md:gap-2
          p-3 md:p-6 pb-1.5 md:pb-3 pt-2.5 md:pt-6
        "
      >
        <div className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-purple-400 drop-shadow-sm" />
          <h3 className="font-extrabold text-base md:text-xl text-white tracking-wide line-clamp-1">
            {circle.name}
          </h3>
        </div>
        <p className="text-purple-200 text-xs md:text-base min-h-[1.4rem] md:min-h-[2.2rem] italic line-clamp-2">
          {circle.description || "No description provided."}
        </p>
      </CardHeader>

      {/* MAIN */}
      <CardContent className="flex flex-col gap-2 p-3 pt-2.5 md:px-6 md:pt-3 md:pb-3">
        {/* Members/Avatars/Link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-1">
          <div className="flex items-center gap-1 text-xs text-purple-200 font-medium">
            <Users size={13} className="text-purple-300 min-w-[13px] min-h-[13px]" />
            <span className="font-semibold">{circle.members.length} members</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1 sm:mt-0">
            {circle.members.slice(0, 3).map((member) => (
              <AvatarGenerator
                key={member.userId}
                emoji={member.avatarEmoji ?? "👻"}
                nickname={member.anonymousAlias ?? "Anonymous"}
                size="xs"
              />
            ))}
            {circle.members.length > 3 && (
              <span className="ml-1 text-xs font-bold text-purple-300">
                +{circle.members.length - 3}
              </span>
            )}
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-xs !text-purple-300 hover:underline ml-auto p-0 h-7 min-w-[0]"
            onClick={() => onSelect(circle._id, "members")}
            tabIndex={0}
          >
            View Members
          </Button>
        </div>
        <div className="text-xs text-purple-300 mt-0.5 mb-0.5">
          Created {formatDistanceToNow(new Date(circle.createdAt))} ago
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter
        className="
          flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between
          items-stretch sm:items-center bg-transparent pt-2 pb-3 px-3 md:pt-4 md:pb-5 md:px-6
        "
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          className="border-purple-600/40 text-purple-300 hover:text-white hover:border-purple-400 bg-purple-900/30 w-full sm:w-auto px-0 py-1 text-xs md:text-sm font-semibold rounded-lg"
        >
          Invite
        </Button>
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-600 via-fuchsia-700 to-pink-600 hover:from-purple-700 hover:to-fuchsia-800 text-white font-bold text-xs flex items-center justify-center gap-1 rounded-xl shadow-md glow-effect w-full sm:w-auto px-0 md:px-4 py-2"
          onClick={() => onSelect(circle._id)}
        >
          View Circle
          <ArrowRight size={14} />
        </Button>
      </CardFooter>

      <InviteToCircleModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        circleId={circle._id}
        circleName={circle.name}
      />
    </Card>
  );
};

export default GhostCircleCard;
