
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

  return (
    <Card
      className={`
        shadow-lg ring-2 ring-purple-700/80
        px-0 py-0 rounded-3xl overflow-hidden transition-all duration-300
        bg-gradient-to-br from-[#160836]/80 via-[#2A0446]/75 to-[#11081e]/95
        border-0
        mb-4
        relative
        backdrop-blur-sm
        /* Neon shadow for highlight effect */
        before:content-[''] before:absolute before:inset-0 before:rounded-3xl before:z-0
        before:bg-gradient-to-br before:from-purple-900/50 before:via-fuchsia-800/30 before:to-purple-600/20
      `}
      style={{ minHeight: 0 }}
    >
      {/* HEADER */}
      <CardHeader
        className="
          relative z-10 
          bg-gradient-to-r from-[#43298B]/70 via-fuchsia-900/40 to-purple-900/80 
          border-b-0 flex flex-col gap-2 p-4 pb-2 
          rounded-3xl rounded-b-none
        "
      >
        <div className="flex items-center gap-2">
          <Ghost className="h-[22px] w-[22px] text-purple-300 drop-shadow-md" />
          <h3 className="font-extrabold text-lg text-white tracking-wide line-clamp-1">
            {circle.name}
          </h3>
        </div>
        <p className="text-purple-200/80 text-[13px] min-h-[1.3em] italic line-clamp-2 font-medium">
          {circle.description || "No description provided."}
        </p>
      </CardHeader>

      {/* MAIN */}
      <CardContent className="flex flex-col z-10 relative gap-2 px-4 pt-3 pb-2 bg-transparent">
        {/* Members Section */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1 text-xs text-purple-200 font-medium">
            <Users size={14} className="text-purple-300" />
            <span className="font-semibold">{circle.members.length} members</span>
          </div>
          <div className="flex items-center gap-1 ml-1">
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
            className="text-xs !text-purple-300 hover:underline ml-auto p-0 h-7 min-w-[0] font-semibold"
            onClick={() => onSelect(circle._id, "members")}
            tabIndex={0}
          >
            View Members
          </Button>
        </div>
        <div className="text-xs text-purple-400 mb-1">
          Created {formatDistanceToNow(new Date(circle.createdAt))} ago
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter
        className="
          z-10 relative flex flex-col gap-2 bg-transparent pt-1 pb-4 px-4
        "
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInviteModalOpen(true)}
          className="w-full border border-purple-500/70 text-purple-200 hover:border-purple-400/90 hover:bg-purple-900/50 font-bold rounded-xl py-2 transition-all"
        >
          Invite
        </Button>
        <Button
          size="sm"
          className="w-full rounded-xl py-3 text-base font-black 
            bg-gradient-to-r from-fuchsia-600 via-purple-700 to-pink-500 
            hover:from-purple-700 hover:to-fuchsia-800 
            text-white shadow-lg"
          onClick={() => onSelect(circle._id)}
        >
          View Circle
          <ArrowRight size={17} />
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

