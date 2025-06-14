
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, List, Info, ArrowLeft } from "lucide-react";
import CircleFeedView from "./CircleFeedView";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Member {
  userId: string;
  displayName?: string;
  anonymousAlias?: string;
  realUsername?: string | null;
  joinedAt?: string;
  avatarEmoji?: string;
}

interface GhostCircle {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: Member[];
}

interface Props {
  circle: GhostCircle;
  onBack: () => void;
  initialTab?: string;
}

const CircleDetailsTabs: React.FC<Props> = ({ circle, onBack, initialTab = "posts" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(initialTab);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col animate-fade-in drop-shadow-xl">
      {/* Modern Card Header */}
      <div className="flex items-center gap-2 py-5 px-6 border-b bg-gradient-to-r from-purple-700/50 to-purple-600/40 rounded-t-3xl shadow-md">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full hover:bg-purple-900/40 text-xs px-2 py-1 flex items-center"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-white tracking-wide mx-auto">
          <span className="text-4xl animate-bounce-gentle">👻</span>
          {circle.name}
        </CardTitle>
      </div>

      {/* Modern Tab Nav */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex justify-center gap-4 py-4 bg-gradient-to-r from-purple-800/60 to-fuchsia-700/50 rounded-b-2xl mb-5 mt-0 shadow-lg border-none">
          <TabsTrigger
            value="posts"
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-lg transition-all
              data-[state=active]:bg-purple-500/90
              data-[state=active]:text-white
              data-[state=inactive]:bg-purple-200/10
              data-[state=inactive]:text-purple-300
              data-[state=active]:shadow-md
            "
          >
            <List size={18} /> Posts
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-lg transition-all
              data-[state=active]:bg-purple-500/90
              data-[state=active]:text-white
              data-[state=inactive]:bg-purple-200/10
              data-[state=inactive]:text-purple-300
              data-[state=active]:shadow-md
            "
          >
            <Users size={18} /> Members
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-lg transition-all
              data-[state=active]:bg-purple-500/90
              data-[state=active]:text-white
              data-[state=inactive]:bg-purple-200/10
              data-[state=inactive]:text-purple-300
              data-[state=active]:shadow-md
            "
          >
            <Info size={18} /> Info
          </TabsTrigger>
        </TabsList>

        {/* --- Posts Tab --- */}
        <TabsContent
          value="posts"
          className="w-full pt-0"
        >
          <CircleFeedView circleId={circle._id} />
        </TabsContent>

        {/* --- Members Tab --- */}
        <TabsContent
          value="members"
          className="w-full"
        >
          <div className="max-h-[26rem] overflow-y-auto rounded-2xl border border-purple-700/40 bg-background/60 px-2 py-4 flex flex-col gap-1 shadow-inner animate-fade-in">
            {circle.members.length === 0 ? (
              <div className="text-muted-foreground text-base p-6 text-center">
                No members yet.
              </div>
            ) : (
              circle.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-purple-800/20 hover-scale transition cursor-pointer"
                  title={member.joinedAt ? `Joined ${formatDistanceToNow(new Date(member.joinedAt))} ago` : ""}
                  onClick={() => navigate(`/profile/${member.userId}`)}
                  data-testid={`member-${member.userId}`}
                >
                  <AvatarGenerator
                    emoji={member.avatarEmoji ?? "👻"}
                    nickname={member.anonymousAlias ?? "Anonymous"}
                    size="sm"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-lg text-white">
                      {member.realUsername ? (
                        <>
                          <span className="text-green-300">{member.realUsername}</span> {" "}
                          <span className="text-xs italic text-muted-foreground">(recognized)</span>
                        </>
                      ) : (
                        <span className="text-purple-300">{member.anonymousAlias ?? "Anonymous"}</span>
                      )}
                    </span>
                    <span className="text-xs text-purple-200 mt-0.5">
                      Joined {member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt)) + " ago" : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* --- Info Tab --- */}
        <TabsContent
          value="info"
          className="w-full"
        >
          <div className="p-6 text-base space-y-3 bg-gradient-to-br from-purple-800/40 via-background/50 to-fuchsia-900/30 rounded-2xl border border-purple-700/30 shadow-inner">
            <div>
              <span className="font-semibold text-purple-200 mr-1">Circle Name:</span>
              <span className="text-white">{circle.name}</span>
            </div>
            <div>
              <span className="font-semibold text-purple-200 mr-1">Description:</span>
              <span className="text-white">{circle.description || <span className="italic text-purple-300">No description provided.</span>}</span>
            </div>
            <div>
              <span className="font-semibold text-purple-200 mr-1">Created:</span>
              <span className="text-white">{formatDistanceToNow(new Date(circle.createdAt))} ago</span>
            </div>
            <div>
              <span className="font-semibold text-purple-200 mr-1">Members:</span>
              <span className="text-white">{circle.members.length}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CircleDetailsTabs;
