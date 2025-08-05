"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



interface CommentDebugProps {
  postId: number;
}

export function CommentDebug({ postId }: CommentDebugProps) {
  const { data: commentsData, isLoading, error } = api.blog.getComments.useQuery({
    postId,
    limit: 10,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (isLoading) return <div>Loading comments debug...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!commentsData) return <div>No comments data</div>;

  const renderComment = (comment: any, depth = 0) => {
    return (
      <div key={comment.id} style={{ marginLeft: `${depth * 20}px`, marginBottom: '10px' }}>
        <div className="border p-2 rounded">
          <div className="text-sm font-medium">ID: {comment.id}</div>
          <div className="text-sm">Author: {comment.authorName}</div>
          <div className="text-sm">Parent ID: {comment.parentId ?? 'null'}</div>
          <div className="text-sm">Content: {comment.content.substring(0, 50)}...</div>
          <div className="text-sm">Replies count: {comment.replies?.length ?? 0}</div>
        </div>
        {comment.replies?.map((reply: any) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Comments Debug (Post ID: {postId})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>Total Comments: {commentsData.totalCount}</div>
          <div>Top-level Comments: {commentsData.comments.length}</div>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Comment Structure:</h4>
            {commentsData.comments.map((comment) => renderComment(comment))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}