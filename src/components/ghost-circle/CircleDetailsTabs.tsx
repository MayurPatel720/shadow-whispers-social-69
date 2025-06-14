
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, List, Info } from "lucide-react";
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
    <Card className="min-h-[70vh] w-full glassmorphism shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border bg-muted/40 rounded-t-xl">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2 font-bold text-purple-300">
            <span className="text-purple-400 text-3xl">👻</span> {circle.name}
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
      </CardHeader>
      <CardContent className="pt-2 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-center gap-3 rounded-xl bg-background/40 shadow-md border mb-6 mt-3">
            <TabsTrigger value="posts" className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition-all data-[state=active]:bg-purple-700/80 data-[state=active]:text-white duration-200 data-[state=active]:shadow-lg">
              <List size={18} /> Posts
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition-all data-[state=active]:bg-purple-700/80 data-[state=active]:text-white duration-200 data-[state=active]:shadow-lg">
              <Users size={18} /> Members
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition-all data-[state=active]:bg-purple-700/80 data-[state=active]:text-white duration-200 data-[state=active]:shadow-lg">
              <Info size={18} /> Info
            </TabsTrigger>
          </TabsList>
          {/* Posts Tab */}
          <TabsContent value="posts" className="w-full pb-8">
            <CircleFeedView circleId={circle._id} />
          </TabsContent>
          {/* Members Tab */}
          <TabsContent value="members" className="w-full">
            <div className="max-h-96 overflow-y-auto rounded-xl border border-muted/60 bg-muted/30 py-2 px-2 shadow-inner">
              {circle.members.length === 0 ? (
                <div className="text-muted-foreground text-sm p-4 text-center">No members yet.</div>
              ) : (
                circle.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-purple-800/10 transition cursor-pointer"
                    title={`Joined ${member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt)) + " ago" : ""}`}
                    onClick={() => navigate(`/profile/${member.userId}`)}
                    data-testid={`member-${member.userId}`}
                  >
                    <AvatarGenerator emoji={member.avatarEmoji ?? "👻"} nickname={member.anonymousAlias ?? "Anonymous"} size="sm" />
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
          </TabsContent>
          {/* Info Tab */}
          <TabsContent value="info" className="w-full">
            <div className="p-4 text-base space-y-2 bg-muted/20 rounded-xl border border-muted/60 shadow-inner">
              <div>
                <span className="font-semibold text-muted-foreground">Circle Name:</span>{" "}
                <span>{circle.name}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Description:</span>{" "}
                <span>{circle.description || <span className="italic text-muted-foreground">No description provided.</span>}</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Created:</span>{" "}
                <span>{formatDistanceToNow(new Date(circle.createdAt))} ago</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Total Members:</span>{" "}
                <span>{circle.members.length}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CircleDetailsTabs;
