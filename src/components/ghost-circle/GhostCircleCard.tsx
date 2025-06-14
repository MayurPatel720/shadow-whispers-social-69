
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ghost, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import InviteToCircleModal from "./InviteToCircleModal";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { useNavigate } from "react-router-dom";
import { getGhostCircleById } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

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
  onSelect: (id: string) => void;
}

const GhostCircleCard: React.FC<GhostCircleCardProps> = ({ circle, onSelect }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [showMembers, setShowMembers] = React.useState(false);
  const navigate = useNavigate();

  // Fetch the latest member info (for displayName ~ recognized)
  // Only fetch when the card's members section is expanded for performance
  const { data: freshCircle, isFetching } = useQuery({
    queryKey: ["ghostCircle", circle._id],
    queryFn: () => getGhostCircleById(circle._id),
    enabled: showMembers,
  });
  const members = (freshCircle?.members || circle.members) as GhostCircleCardProps["circle"]["members"];

  return (
<Card className="rounded-xl overflow-hidden glassmorphism text-card-foreground transition-all duration-300 hover:shadow-lg">
<CardHeader className="bg-muted/50 pb-2 border-b border-border">
      <div className="flex items-center gap-2">
        <Ghost className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">{circle.name}</h3>
      </div>
    </CardHeader>
  
    <CardContent className="pt-4">
      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
        {circle.description || "No description provided."}
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users size={14} />
        <span>{members.length} members</span>
        <Button
          variant="link"
          size="sm"
          className="ml-auto text-xs text-muted-foreground"
          onClick={() => setShowMembers((prev) => !prev)}
        >
          {showMembers ? "Hide Members" : "View Members"}
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Created {formatDistanceToNow(new Date(circle.createdAt))} ago
      </div>
      {showMembers && (
        <div className="mt-4 divide-y rounded-md border border-muted bg-muted/40 px-2 py-2 max-h-60 overflow-y-auto">
          {isFetching && (
            <div className="text-xs text-muted-foreground py-2">Loading members...</div>
          )}
          {members.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2">No members yet.</div>
          ) : (
            members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-purple-800/20 transition cursor-pointer"
                title={`Joined ${member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt)) + " ago" : ""}`}
                onClick={() => navigate(`/profile/${member.userId}`)}
                data-testid={`member-${member.userId}`}
              >
                <AvatarGenerator emoji={member.avatarEmoji} nickname={member.anonymousAlias} size="sm" />
                <div className="flex flex-col flex-1">
                  <span className="font-medium">
                    {/* Show real name if recognized, otherwise anonymous alias */}
                    {member.realUsername ? (
                      <>
                        <span className="text-green-400">{member.realUsername}</span>{" "}
                        <span className="text-xs text-muted-foreground">(recognized)</span>
                      </>
                    ) : (
                      member.anonymousAlias
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Joined {member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt)) + " ago" : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </CardContent>
  
    <CardFooter className="flex justify-between items-center bg-muted/40 pt-3 px-4 pb-4 border-t border-border">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsInviteModalOpen(true)}
        className="text-xs border-border text-muted-foreground hover:text-primary"
      >
        Invite Friend
      </Button>
  
      <Button
        size="sm"
        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs flex items-center gap-1 transition-all duration-200 glow-effect"
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
