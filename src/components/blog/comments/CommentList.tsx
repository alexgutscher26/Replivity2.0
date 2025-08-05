"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { CommentDebug } from "./CommentDebug";
import { 
  MessageSquare, 
  SortAsc, 
  SortDesc, 
  Filter,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentListProps {
  postId: number;
  initialCommentsCount?: number;
}

type SortBy = "createdAt" | "likeCount";
type SortOrder = "asc" | "desc";

export function CommentList({ postId, initialCommentsCount = 0 }: CommentListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const limit = 10;

  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
    isFetching
  } = api.blog.getComments.useQuery({
    postId,
    limit,
    offset: page * limit,
    sortBy,
    sortOrder,
  });

  const handleCommentAdded = () => {
    // Reset to first page and refetch
    setPage(0);
    void refetch();
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field with default desc order
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setPage(0); // Reset to first page
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getSortIcon = (field: SortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />;
  };

  const totalComments = commentsData?.totalCount ?? initialCommentsCount;
  const comments = commentsData?.comments ?? [];
  const hasMore = commentsData?.hasMore ?? false;

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2" />
            <p>Failed to load comments. Please try again.</p>
            <Button 
              variant="outline" 
              onClick={() => void refetch()} 
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              <Badge variant="secondary" className="ml-2">
                {totalComments}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-3 w-3" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange("createdAt")}>
                    <div className="flex items-center justify-between w-full">
                      <span>Date</span>
                      {getSortIcon("createdAt")}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("likeCount")}>
                    <div className="flex items-center justify-between w-full">
                      <span>Likes</span>
                      {getSortIcon("likeCount")}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comment Form */}
      <CommentForm 
        postId={postId} 
        onCommentAdded={handleCommentAdded}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : comments.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                <p className="text-sm">
                  Be the first to share your thoughts on this post!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Comments
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment as any}
                postId={postId}
                onCommentUpdated={() => void refetch()}
              />
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Comments"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Comments Stats */}
      {totalComments > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {comments.length} of {totalComments} comments
        </div>
      )}
      
      {/* Debug Component - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <CommentDebug postId={postId} />
      )}
    </div>
  );
}