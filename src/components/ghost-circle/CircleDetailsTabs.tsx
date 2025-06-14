
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, List, Info, ArrowLeft } from "lucide-react";
import CircleFeedView from "./CircleFeedView";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// More compact member interface
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

const TABS = [
  { value: "posts", label: "Posts", icon: List },
  { value: "members", label: "Members", icon: Users },
  { value: "info", label: "Info", icon: Info }
];

const CircleDetailsTabs: React.FC<Props> = ({ circle, onBack, initialTab = "posts" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(initialTab);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fade-in px-2 pt-4">
      {/* Glowing Circle Header */}
      <div className="w-full">
        <div className="rounded-3xl bg-gradient-to-tr from-[#833ab4]/90 via-[#6d38be]/70 to-[#5200ff]/60 shadow-2xl border-0 flex flex-col items-center py-6 mb-[-40px] relative z-20">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-6 top-4 rounded-full hover:bg-purple-900/40 text-xs px-2 py-1 flex items-center text-white"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <span className="block text-[54px] mb-2 animate-bounce-gentle select-none">👻</span>
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">{circle.name}</h2>
            <p className="text-base text-purple-200/90 font-normal italic">{circle.description || "No description provided."}</p>
          </div>
          <div className="absolute right-6 top-6">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-950/30 text-purple-100 font-semibold">{circle.members.length} members</span>
          </div>
        </div>
      </div>

      {/* Minimal, floating Tab Bar */}
      <div className="sticky top-8 z-30 w-full flex justify-center mb-2" style={{ marginTop: '-24px' }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
          <TabsList
            className="bg-transparent flex justify-center gap-3 rounded-full py-2 px-1 shadow-lg"
            style={{ boxShadow: "0 4px 22px 0 rgba(130, 60, 218, 0.09)" }}
          >
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={`
                relative flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-lg transition-all duration-150
                bg-black/30
                data-[state=active]:bg-gradient-to-r
                data-[state=active]:from-purple-600/90
                data-[state=active]:to-fuchsia-600/80
                data-[state=active]:text-white
                data-[state=active]:shadow-purple-glow
                data-[state=inactive]:bg-black/20
                data-[state=inactive]:text-purple-300
                `}
                style={{
                  border: 'none',
                  minWidth: "120px",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px 0 rgba(130, 60, 218, 0.06)"
                }}
              >
                <Icon size={19} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="w-full pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* --- Posts Tab --- */}
          <TabsContent value="posts" className="w-full pt-0">
            <CircleFeedView circleId={circle._id} />
          </TabsContent>

          {/* --- Members Tab --- */}
          <TabsContent value="members" className="w-full">
            <div className="max-h-[22rem] overflow-y-auto rounded-2xl border border-purple-700/30 bg-black/40 px-2 py-4 flex flex-col gap-1 shadow-xl animate-fade-in">
              {circle.members.length === 0 ? (
                <div className="text-muted-foreground text-base p-6 text-center">
                  No members yet.
                </div>
              ) : (
                circle.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-purple-800/30 transition cursor-pointer"
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
                      <span className="font-semibold text-base text-white">
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
          <TabsContent value="info" className="w-full">
            <div className="p-5 text-base space-y-3 bg-gradient-to-br from-purple-800/35 via-background/40 to-fuchsia-900/25 rounded-2xl border border-purple-700/20 shadow-xl">
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
      <style>{`
      .shadow-purple-glow {
        box-shadow: 0 2px 10px 0 #a259f7a0, 0 2px 20px #7b2ff5a7;
      }
      `}</style>
    </div>
  );
};

export default CircleDetailsTabs;
