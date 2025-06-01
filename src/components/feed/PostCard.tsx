/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Info,
  MoreVertical,
  Trash,
  Edit,
  Send,
  Eye,
  Share2,
  MousePointer2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AvatarGenerator from '../user/AvatarGenerator';
import { useAuth } from '@/context/AuthContext';
import {
  likePost,
  addComment,
  getComments,
  deletePost,
  editComment,
  deleteComment,
  replyToComment,
  incrementShareCount,
} from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import EditPostModal from './EditPostModal';
import DeletePostDialog from './DeletePostDialog';
import CommentItem from './CommentItem';
import GuessIdentityModal from '@/components/recognition/GuessIdentityModal';
import { User } from '@/types/user';
import { useNavigate } from 'react-router-dom';
import ImageSlider from '@/components/ui/image-slider';

interface Post {
  _id: string;
  user: string;
  username?: string;
  anonymousAlias: string;
  avatarEmoji: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  likes: { user: string }[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
  shareCount?: number;
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onRefresh?: () => void;
  showOptions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onRefresh,
  showOptions = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((like) => like.user === currentUserId)
  );
  const [isLiking, setIsLiking] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const isOwnPost = post.user === currentUserId;
  const handleAliasClick = (userId: string, alias: string) => {
    navigate(`/profile/${userId}`, { state: { anonymousAlias: alias } });
  };

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const response = await likePost(post._id);

      setLikeCount(response.likes.length);
      setIsLiked(!isLiked);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not like this post. Please try again.',
      });
      console.error('Like error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (platform?: 'whatsapp' | 'instagram' | 'link') => {
    try {
      setIsSharing(true);

      const postUrl = `${window.location.origin}/post/${post._id}`;
      const shareText = `${post.anonymousAlias}'s post: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;

      switch (platform) {
        case 'whatsapp': {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${postUrl}`)}`;
          window.open(whatsappUrl, '_blank');
          break;
        }

        case 'instagram': {
          const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(postUrl)}`;
          window.open(instagramUrl, '_blank');
          break;
        }

        case 'link':
        default:
          if (navigator.share) {
            await navigator.share({
              title: `${post.anonymousAlias}'s post`,
              text: shareText,
              url: postUrl,
            });
            toast({
              title: 'Post shared',
              description: 'The post has been shared successfully!',
            });
          } else {
            await navigator.clipboard.writeText(postUrl);
            toast({
              title: 'Link copied',
              description: 'Post link has been copied to clipboard!',
            });
          }
          break;
      }

      const response = await incrementShareCount(post._id);
      setShareCount(response.shareCount);

    } catch (error) {
      console.error('Error sharing post:', error);

      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not share this post. Please try again.',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const loadComments = async () => {
    if (isLoadingComments) return;

    try {
      setIsLoadingComments(true);
      const fetchedComments = await getComments(post._id);
      console.log('Fetching comments for post with ID:', post._id);

      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load comments. Please try again.',
      });
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await addComment(
        post._id,
        newComment.trim(),
        user.anonymousAlias
      );

      setNewComment('');
      loadComments();

      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully!',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not post your comment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await editComment(post._id, commentId, content);
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully!',
      });
      loadComments();
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not edit your comment. Please try again.',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(post._id, commentId);
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted successfully!',
      });
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete your comment. Please try again.',
      });
    }
  };

  const handleReplyToComment = async (commentId: string, content: string) => {
    try {
      await replyToComment(post._id, commentId, content, user.anonymousAlias);
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted successfully!',
      });
      loadComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not post your reply. Please try again.',
      });
    }
  };

  const postTime = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : 'Unknown time';

  const identity = {
    emoji: post.avatarEmoji || '🎭',
    nickname: post.anonymousAlias || 'Anonymous',
    color: '#9333EA',
  };

  const targetUser: User = {
    _id: post.user,
    anonymousAlias: post.anonymousAlias,
    avatarEmoji: post.avatarEmoji,
    username: post.username || '',
    email: '',
    fullName: '',
    recognitionAttempts: 0,
    successfulRecognitions: 0,
    recognizedUsers: [],
    identityRecognizers: [],
  };

  // Handle both old imageUrl and new images array
  const displayImages = post.images && post.images.length > 0 
    ? post.images 
    : post.imageUrl 
      ? [post.imageUrl] 
      : [];

  return (
    <Card className="border border-undercover-purple/20 bg-card shadow-md hover:shadow-lg transition-shadow mb-4">
      <CardHeader className="p-4 pb-2" onClick={() => handleAliasClick(post.user, post.anonymousAlias)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AvatarGenerator
              emoji={identity.emoji}
              nickname={identity.nickname}
              color={identity.color}
            />
            <span className="font-medium text-sm">{identity.nickname}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{postTime}</span>
            {showOptions && isOwnPost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                    <Edit size={16} className="mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash size={16} className="mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-foreground mb-2">{post.content}</p>

        {displayImages.length > 0 && (
          <div className="mt-3">
            <ImageSlider 
              images={displayImages} 
              className="max-h-80 rounded-lg overflow-hidden" 
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-xs"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-red-500 text-red-500' : ''}
              />
              <span>{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-xs"
              onClick={handleToggleComments}
            >
              <MessageCircle size={16} />
              <span>{comments.length || post.comments?.length || 0}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1 text-xs"
                  disabled={isSharing}
                >
                  <MousePointer2 size={16} className="rotate-90" />
                  <span>{shareCount}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                  Share via WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('instagram')}>
                  Share via Instagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('link')}>
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {!isOwnPost && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGuessModalOpen(true)}
              title="Guess identity"
              className="flex items-center space-x-1 text-xs border-undercover-purple/20 hover:bg-undercover-purple/10"
            >
              <Eye size={14} /> <span>Guess?</span>
            </Button>
          )}
        </div>

        {showComments && (
          <div className="mt-4 w-full">
            <div className="border-t border-border pt-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-undercover-purple rounded-full border-t-transparent"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      onDelete={handleDeleteComment}
                      onEdit={handleEditComment}
                      onReply={handleReplyToComment}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-2">
                  No comments yet
                </p>
              )}

              <div className="mt-4 flex space-x-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="resize-none h-10 py-2"
                />
                <Button
                  onClick={handleSubmitComment}
                  className="bg-undercover-purple hover:bg-undercover-deep-purple"
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>

      {isOwnPost && (
        <>
          <EditPostModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            post={post}
            onSuccess={() => {
              if (onRefresh) onRefresh();
            }}
          />

          <DeletePostDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            postId={post._id}
            onSuccess={() => {
              if (onRefresh) onRefresh();
            }}
          />
        </>
      )}

      {!isOwnPost && (
        <GuessIdentityModal
          open={guessModalOpen}
          onOpenChange={setGuessModalOpen}
          targetUser={targetUser}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            toast({
              title: 'Recognition successful! 🎉',
              description: `You correctly identified ${post.anonymousAlias}!`,
            });
          }}
        />
      )}
    </Card>
  );
};

export default PostCard;
