"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCommentAdded?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ 
  postId, 
  parentId, 
  onCommentAdded, 
  onCancel,
  placeholder = "Share your thoughts..."
}: CommentFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    authorName: session?.user?.name ?? "",
    authorEmail: session?.user?.email ?? "",
    authorWebsite: "",
    content: "",
  });

  const createComment = api.blog.createComment.useMutation({
    onSuccess: () => {
      toast.success("Comment submitted successfully! It will be reviewed before appearing.");
      setFormData({
        authorName: session?.user?.name ?? "",
        authorEmail: session?.user?.email ?? "",
        authorWebsite: "",
        content: "",
      });
      onCommentAdded?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to submit comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    
    if (!formData.authorName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!formData.authorEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    createComment.mutate({
      postId,
      parentId,
      authorName: formData.authorName,
      authorEmail: formData.authorEmail,
      authorWebsite: formData.authorWebsite || undefined,
      content: formData.content,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          {parentId ? "Reply to Comment" : "Leave a Comment"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Name *</Label>
              <Input
                id="authorName"
                type="text"
                value={formData.authorName}
                onChange={(e) => handleInputChange("authorName", e.target.value)}
                placeholder="Your name"
                required
                disabled={createComment.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorEmail">Email *</Label>
              <Input
                id="authorEmail"
                type="email"
                value={formData.authorEmail}
                onChange={(e) => handleInputChange("authorEmail", e.target.value)}
                placeholder="your@email.com"
                required
                disabled={createComment.isPending}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="authorWebsite">Website (optional)</Label>
            <Input
              id="authorWebsite"
              type="url"
              value={formData.authorWebsite}
              onChange={(e) => handleInputChange("authorWebsite", e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={createComment.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Comment *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder={placeholder}
              rows={4}
              required
              disabled={createComment.isPending}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createComment.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={createComment.isPending || !formData.content.trim()}
            >
              {createComment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Comment"
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Your comment will be reviewed before being published. Please be respectful and constructive.</p>
        </div>
      </CardContent>
    </Card>
  );
}