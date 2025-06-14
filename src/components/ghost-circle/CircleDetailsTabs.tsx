import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, List, Info, ArrowLeft } from "lucide-react";
import CircleFeedView from "./CircleFeedView";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
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

const TABS = [
  { value: "posts", label: "Posts", icon: List },
  { value: "members", label: "Members", icon: Users },
  { value: "info", label: "Info", icon: Info }
];

const CircleDetailsTabs: React.FC<Props> = ({ circle, onBack, initialTab = "posts" }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(initialTab);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center px-2 pt-2 sm:pt-6">
      {/* Modern Card Header */}
      <div className="w-full pb-3">
        <div className="
          rounded-3xl shadow-2xl border-0 relative z-20
          flex flex-col items-center justify-center
          bg-gradient-to-br from-[#8137be]/90 via-[#685ce9]/75 to-[#a259f7]/70
          pt-7 pb-4 px-2 sm:px-10
          min-h-[160px]
        ">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="
              absolute left-3 top-4 rounded-full bg-transparent text-xs px-2 py-1 flex items-center text-white/80
              hover:bg-[#833ab428]
            "
            onClick={onBack}
            tabIndex={0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          {/* Members Count */}
          <span className="absolute right-3 top-5 
            text-xs px-3 py-1 rounded-full bg-black/10 text-white/80 font-semibold
          ">
            {circle.members.length} member{circle.members.length !== 1 && "s"}
          </span>
          {/* Ghost Emoji */}
          <span className="block text-[52px] mb-2 select-none drop-shadow-md animate-bounce-gentle" style={{
            filter: "drop-shadow(0px 3px 16px #fff5)"
          }}>
            👻
          </span>
          {/* Circle Name */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mt-1 mb-1 drop-shadow-lg">
            {circle.name}
          </h2>
          {/* Description */}
          <div className="w-full flex items-center justify-center">
            <p className="text-base text-purple-100/90 font-normal italic text-center max-w-[92%] mb-0">
              {circle.description || <span className="italic opacity-80">No description provided.</span>}
            </p>
          </div>
          {/* Stylish Capsule Tabs (below the name/desc) */}
          <div className="w-full flex justify-center mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col items-center">
              <TabsList
                className="
                  flex justify-center items-center flex-wrap
                  bg-transparent gap-3 px-0 py-0
                  shadow-none border-none
                "
              >
                {TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`
                    relative flex items-center gap-2 px-5 py-1.5
                    rounded-full font-semibold text-base sm:text-lg 
                    transition-all duration-150
                    border-2 border-transparent
                    hover:bg-white/10 hover:text-white
                    data-[state=active]:bg-gradient-to-r
                    data-[state=active]:from-[#8e35ef]/90
                    data-[state=active]:to-[#683cd6]/80
                    data-[state=active]:shadow-xl
                    data-[state=active]:border-white/20
                    data-[state=active]:text-white
                    data-[state=inactive]:bg-black/15
                    data-[state=inactive]:text-white/80
                    `}
                    style={{
                      minWidth: "108px",
                      justifyContent: "center",
                      fontWeight: 700
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Sticky Tab Nav (if scrolling long lists) */}
      <div className="w-full z-10">
        {/* The sticky bar shows only below the header if content overflows */}
        {/* On mobile, 'sticky' plus top safe-area to keep it tidy */}
        <div className="
          sticky top-2 z-30 w-full flex justify-center bg-transparent pointer-events-none"
          style={{ minHeight: '1px' }}
        ></div>
      </div>
      {/* Tab Content Area */}
      <div className="w-full pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="posts" className="w-full pt-0">
            <CircleFeedView circleId={circle._id} />
          </TabsContent>
          <TabsContent value="members" className="w-full">
            <div className="max-h-[21em] overflow-y-auto rounded-2xl border border-purple-700/30 bg-black/35 px-2 py-4 flex flex-col gap-1 shadow-xl animate-fade-in">
              {circle.members.length === 0 ? (
                <div className="text-muted-foreground text-base p-6 text-center">
                  No members yet.
                </div>
              ) : (
                circle.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-purple-800/40 transition cursor-pointer"
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
                          <span className="text-purple-200">{member.anonymousAlias ?? "Anonymous"}</span>
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
          <TabsContent value="info" className="w-full">
            <div className="p-5 text-base space-y-3 bg-gradient-to-br from-purple-800/35 via-background/40 to-fuchsia-900/25 rounded-2xl border border-purple-700/20 shadow-xl">
              <div>
                <span className="font-semibold text-purple-200 mr-1">Circle Name:</span>
                <span className="text-white">{circle.name}</span>
              </div>
              <div>
                <span className="font-semibold text-purple-200 mr-1">Description:</span>
                <span className="text-white">
                  {circle.description || <span className="italic text-purple-300">No description provided.</span>}
                </span>
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
        @media (max-width: 600px) {
          .rounded-3xl {
            border-radius: 1.35rem !important;
          }
          h2 {
            font-size: 1.35rem !important;
          }
          .text-base {
            font-size: .98rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CircleDetailsTabs;
