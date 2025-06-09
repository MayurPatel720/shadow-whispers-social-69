
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, Plus, TrendingUp } from "lucide-react";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { getAllPosts } from "@/lib/api";
import { Post } from "@/types";

const GlobalFeed = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
    refetchInterval: 30000,
  });

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    setIsCreatePostOpen(false);
  };

  if (isLoading) {
    return (
      <div 
        className="flex h-screen items-center justify-center bg-background"
        data-scroll
        data-scroll-speed="0.5"
      >
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <Loader className="h-8 w-8 animate-spin text-purple-500" />
          <p className="animate-pulse">Loading the underground feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex h-screen items-center justify-center bg-background"
        data-scroll
        data-scroll-speed="0.3"
      >
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load posts</p>
          <Button onClick={() => refetch()} variant="outline" className="hover-scale">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div 
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border p-4"
        data-scroll
        data-scroll-sticky
        data-scroll-target="#scroll-container"
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-foreground">Underground Feed</h1>
          </div>
          <Button
            onClick={() => setIsCreatePostOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white hover-scale glow-effect"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {posts.length === 0 ? (
          <div 
            className="text-center py-16 space-y-4"
            data-scroll
            data-scroll-speed="0.8"
          >
            <div className="text-6xl mb-4 animate-bounce">👻</div>
            <h2 className="text-2xl font-bold text-foreground">The underground is quiet...</h2>
            <p className="text-muted-foreground">Be the first to share something mysterious</p>
            <Button
              onClick={() => setIsCreatePostOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white hover-scale"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: Post, index: number) => (
              <div
                key={post._id}
                data-scroll
                data-scroll-speed={0.2 + (index % 3) * 0.1}
                data-scroll-direction="vertical"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePostModal
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default GlobalFeed;
