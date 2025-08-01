
import React, { useContext, useEffect } from "react";
import ProfileComponent from "@/components/user/ProfileComponent";
import { Button } from "@/components/ui/button";
import { Gift, MessageSquare, Send } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/layout/Footer";

const ProfilePage = () => {
  const { userId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine anonymousAlias based on userId and state
  const anonymousAlias = userId
    ? state?.anonymousAlias || "Unknown User" // Use state for target user
    : user?.anonymousAlias || "Unknown User"; // Use auth user for own profile

  const handleWhisperClick = () => {
    if (userId && userId !== user?._id) {
      // Navigate to whispers page with the specific user selected
      navigate(`/whispers`, { state: { selectUserId: userId } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <div className="flex justify-end px-4 py-2 gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-purple-500/30 hover:bg-purple-500/10"
            onClick={() => navigate("/referrals")}
          >
            <Gift className="h-4 w-4 text-purple-400" />
            Refer & Earn ₹100
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-purple-500/30 hover:bg-purple-500/10"
            onClick={handleWhisperClick}
          >
            <Send className="h-4 w-4 text-purple-400" />
            Whisper
          </Button>
        </div>
        <ProfileComponent userId={userId} anonymousAlias={anonymousAlias} />
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
