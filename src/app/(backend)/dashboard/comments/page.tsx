"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MoreHorizontal,
  Search,
  Check,
  X,
  Trash2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type CommentStatus = "pending" | "approved" | "rejected" | "spam";
type SortBy = "createdAt" | "likeCount";
type SortOrder = "asc" | "desc";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  spam: "bg-orange-100 text-orange-800",
};

const statusIcons = {
  pending: MessageSquare,
  approved: Check,
  rejected: X,
  spam: AlertTriangle,
};

/**
 * Comment moderation dashboard component.
 *
 * This component provides a UI for moderating comments across all blog posts. It includes features such as searching,
 * filtering by status, sorting, and pagination. Users can approve, reject, mark as spam, or delete comments.
 * The component fetches comments data using API queries and handles mutations for moderation actions.
 * It also displays statistics on the number of comments in different statuses and provides a table view of comments
 * with options to interact with each comment.
 *
 * @returns A React component representing the comment moderation dashboard.
 */
export default function CommentModerationDashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CommentStatus | "all">("pending");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Initialize utils for cache invalidation
  const utils = api.useUtils();

  // Queries
  const {
    data: commentsData,
    isLoading,
    refetch: refetchComments,
  } = api.blog.getComments.useQuery({
    postId: undefined, // Get comments from all posts
    limit,
    offset: page * limit,
    status: status === "all" ? undefined : status,
    sortBy,
    sortOrder,
  });

  // Query for all comments to get accurate counts
  const { data: allCommentsData, refetch: refetchAllComments } =
    api.blog.getComments.useQuery({
      postId: undefined,
      limit: 1000, // Large limit to get all comments for counting
      offset: 0,
      status: undefined, // No status filter to get all comments
    });

  // Mutations
  const moderateComment = api.blog.moderateComment.useMutation({
    onSuccess: async (_, variables) => {
      const statusText =
        variables.status === "approved"
          ? "approved"
          : variables.status === "rejected"
            ? "rejected"
            : "marked as spam";
      toast.success(`Comment ${statusText} successfully`);
      // Invalidate all getComments queries to refresh both filtered and unfiltered data
      await utils.blog.getComments.invalidate();
      // Also manually refetch to ensure immediate update
      await refetchComments();
      await refetchAllComments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteComment = api.blog.deleteComment.useMutation({
    onSuccess: async () => {
      toast.success("Comment deleted successfully");
      await utils.blog.getComments.invalidate();
      // Also manually refetch to ensure immediate update
      await refetchComments();
      await refetchAllComments();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  /**
   * Updates the moderation status of a comment.
   */
  const handleModerate = async (
    id: number,
    newStatus: "approved" | "rejected" | "spam",
  ) => {
    await moderateComment.mutateAsync({ id, status: newStatus });
  };

  /**
   * Handles deletion of a comment with confirmation.
   */
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment.mutateAsync({ id });
    }
  };

  /**
   * Renders a badge component with an icon and formatted status text based on the given status string.
   *
   * The function retrieves the corresponding StatusIcon from the statusIcons object using the provided status,
   * defaulting to MessageSquare if no match is found. It also sets the background color of the badge using
   * the statusColors object, falling back to a gray color if the status is not recognized. The status text is
   * capitalized before being displayed within the badge.
   *
   * @param {string} status - The status string used to determine the icon and color of the badge.
   */
  const getStatusBadge = (status: string) => {
    const StatusIcon = statusIcons[status as CommentStatus] || MessageSquare;
    return (
      <Badge
        className={
          statusColors[status as CommentStatus] || "bg-gray-100 text-gray-800"
        }
      >
        <StatusIcon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const pendingCount =
    allCommentsData?.comments.filter((c) => c.status === "pending").length ?? 0;
  const approvedCount =
    allCommentsData?.comments.filter((c) => c.status === "approved").length ??
    0;
  const rejectedCount =
    allCommentsData?.comments.filter((c) => c.status === "rejected").length ??
    0;
  const spamCount =
    allCommentsData?.comments.filter((c) => c.status === "spam").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Comment Moderation
          </h1>
          <p className="text-muted-foreground">
            Review and moderate user comments across all blog posts.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spam</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {spamCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as CommentStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split("-") as [
              SortBy,
              SortOrder,
            ];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="likeCount-desc">Most Liked</SelectItem>
            <SelectItem value="likeCount-asc">Least Liked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading comments...</div>
            </div>
          ) : commentsData?.comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-muted-foreground mb-2">
                No comments found
              </div>
              <p className="text-muted-foreground text-sm">
                Comments will appear here when users submit them.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {commentsData?.comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{comment.authorName}</div>
                        <div className="text-muted-foreground text-sm">
                          {comment.authorEmail}
                        </div>
                        {comment.authorWebsite && (
                          <div className="max-w-[150px] truncate text-xs text-blue-600">
                            {comment.authorWebsite}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="line-clamp-3 text-sm">
                          {comment.content}
                        </p>
                        {comment.isEdited && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Edited
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground text-sm">
                        Post #{comment.postId}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(comment.status)}</TableCell>
                    <TableCell>{comment.likeCount}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {comment.status !== "approved" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleModerate(comment.id, "approved")
                              }
                              className="text-green-600"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {comment.status !== "rejected" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleModerate(comment.id, "rejected")
                              }
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          {comment.status !== "spam" && (
                            <DropdownMenuItem
                              onClick={() => handleModerate(comment.id, "spam")}
                              className="text-orange-600"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Mark as Spam
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {commentsData && commentsData.totalCount > limit && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {page * limit + 1} to{" "}
            {Math.min((page + 1) * limit, commentsData.totalCount)} of{" "}
            {commentsData.totalCount} comments
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * limit + limit >= commentsData.totalCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
