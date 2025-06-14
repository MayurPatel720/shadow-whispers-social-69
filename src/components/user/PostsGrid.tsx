
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Image } from "lucide-react";

const PostCard = ({ post, isOwnProfile, onEdit, onDelete }) => {
  return (
    <div className="relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full h-32 sm:h-44 object-cover"
        />
      ) : (
        <div className="p-3 h-32 sm:h-28 flex items-center justify-center">
          <p className="text-sm line-clamp-4 overflow-hidden">
            {post.content || "No content"}
          </p>
        </div>
      )}
      {isOwnProfile && (
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/70 hover:bg-white w-7 h-7 rounded-full"
            onClick={onEdit}
          >
            <Edit className="text-black h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/70 hover:bg-white w-7 h-7 rounded-full"
            onClick={onDelete}
          >
            <Trash2 className="text-black h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

const EmptyPostsState = ({ onCreatePost }) => (
  <div className="text-center py-8 border border-dashed rounded-lg bg-card">
    <Image className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
    <h3 className="text-lg font-medium mb-1">No Posts Yet</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Share your thoughts anonymously!
    </p>
    <Button
      onClick={onCreatePost}
      className="bg-undercover-purple hover:bg-undercover-deep-purple"
    >
      <Plus size={16} className="mr-2" />
      Create your first post
    </Button>
  </div>
);

const PostsGrid = ({ isLoading, userPosts, isOwnProfile, onEdit, onDelete, onCreatePost }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 sm:h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  } else if (userPosts && userPosts.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {userPosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            isOwnProfile={isOwnProfile}
            onEdit={() => onEdit(post)}
            onDelete={() => onDelete(post)}
          />
        ))}
      </div>
    );
  } else {
    return <EmptyPostsState onCreatePost={onCreatePost} />;
  }
};

export default PostsGrid;
