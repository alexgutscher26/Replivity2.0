"use client";

import { type User } from "better-auth";
import { User as UserIcon, Settings, HelpCircle, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function UserProfile({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "group hover:bg-accent/50 flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
              isOpen && "bg-accent/50",
            )}
            aria-label="User menu"
          >
            <div className="relative">
              {user.image ? (
                <Image
                  alt={user.name || "User profile"}
                  src={user.image}
                  width={40}
                  height={40}
                  className="group-hover:border-primary size-10 rounded-full border-2 border-transparent transition-all"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                  <span className="text-lg font-medium">
                    {user.name?.charAt(0).toUpperCase() || (
                      <UserIcon className="size-5" />
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-foreground truncate text-sm font-medium">
                {user.name || "User"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {user.email || "No email"}
              </p>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 p-2"
          sideOffset={8}
          alignOffset={8}
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.name || "User"}</p>
            <p className="text-muted-foreground truncate text-xs">
              {user.email || "No email"}
            </p>
          </div>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            className="cursor-pointer rounded-md px-2 py-1.5 text-sm"
            onClick={() => router.push("/profile")}
          >
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer rounded-md px-2 py-1.5 text-sm"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            className="cursor-pointer rounded-md px-2 py-1.5 text-sm"
            onClick={() => window.open("https://help.example.com", "_blank")}
          >
            <HelpCircle className="mr-2 size-4" />
            Help & Support
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem asChild>
            <button
              className="text-destructive hover:bg-destructive/10 flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm"
              onClick={async (e) => {
                e.preventDefault();
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/";
                    },
                    onError: ({ error }) => {
                      console.error("Sign out error:", error);
                    },
                  },
                });
              }}
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
