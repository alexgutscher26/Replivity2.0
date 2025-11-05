"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Heart,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";
import { CommentForm } from "./CommentForm";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string | null;
  authorId?: string | null;
  likeCount: number;
  isEdited: boolean;
  editedAt?: Date | null;
  createdAt: Date;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  replies?: Comment[];
  likes?: Array<{ userId: string }>;
}

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onCommentUpdated?: () => void;
  depth?: number;
  maxDepth?: number;
}

export function CommentItem({
  comment,
  postId,
  onCommentUpdated,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(
    comment.likes?.some((like) => like.userId === session?.user?.id) ?? false,
  );
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  const likeComment = api.blog.likeComment.useMutation({
    onSuccess: (data) => {
      setIsLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to like comment");
    },
  });

  const deleteComment = api.blog.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      onCommentUpdated?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete comment");
    },
  });

  const handleLike = () => {
    if (!session) {
      toast.error("Please sign in to like comments");
      return;
    }
    likeComment.mutate({ commentId: comment.id });
  };

  const handleDelete = () => {
    deleteComment.mutate({ id: comment.id });
    setShowDeleteDialog(false);
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onCommentUpdated?.();
  };

  const isOwner = session?.user?.id === comment.authorId;
  const authorInitials = comment.authorName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const canReply = depth < maxDepth;
  const indentStyle = depth > 0 ? { marginLeft: `${depth * 2}rem` } : {};

  return (
    <div style={indentStyle}>
      <Card
        className={`mb-4 ${depth > 0 ? "border-l-primary/20 bg-muted/30 border-l-4" : ""}`}
      >
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={comment.author?.image ?? undefined}
                alt={comment.authorName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {authorInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.authorName}
                  </span>
                  {comment.authorWebsite && (
                    <a
                      href={comment.authorWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={comment.createdAt.toISOString()}>
                    {formatDistanceToNow(comment.createdAt, {
                      addSuffix: true,
                    })}
                  </time>
                  {comment.isEdited && comment.editedAt && (
                    <Badge variant="secondary" className="px-1 py-0 text-xs">
                      edited
                    </Badge>
                  )}
                </div>

                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="prose prose-sm mb-3 max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeComment.isPending}
                  className={`h-8 px-2 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
                >
                  <Heart
                    className={`mr-1 h-3 w-3 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-xs">{likeCount}</span>
                </Button>

                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-muted-foreground h-8 px-2"
                  >
                    <Reply className="mr-1 h-3 w-3" />
                    <span className="text-xs">Reply</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {showReplyForm && (
            <div className="mt-4 pl-13">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${comment.authorName}...`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentUpdated={onCommentUpdated}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
