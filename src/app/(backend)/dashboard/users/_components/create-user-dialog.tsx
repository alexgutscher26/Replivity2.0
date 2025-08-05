"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/server/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Password strength indicator component
function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = useMemo(() => {
    const checks = [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "Contains number",
        met: /\d/.test(password),
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
      {
        label: "No sequential characters",
        met: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/.test(
          password.toLowerCase()
        ),
      },
      {
        label: "No repeated characters",
        met: !/(.)\1{2,}/.test(password),
      },
    ];

    // Common passwords check would be here but we're handling it server-side

    return checks;
  }, [password]);

  const metRequirements = requirements.filter((req) => req.met).length;
  const progress = (metRequirements / requirements.length) * 100;

  const strengthText = useMemo(() => {
    if (progress === 0) return "";
    if (progress < 50) return "Weak";
    if (progress < 80) return "Medium";
    if (progress < 100) return "Strong";
    return "Very Strong";
  }, [progress]);

  const strengthColor = useMemo(() => {
    if (progress === 0) return "";
    if (progress < 50) return "bg-red-500";
    if (progress < 80) return "bg-yellow-500";
    if (progress < 100) return "bg-green-500";
    return "bg-green-600";
  }, [progress]);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <Progress
          value={progress}
          className={cn("h-2", strengthColor)}
          // Remove indicatorClassName as it's not a valid prop for Progress component
        />
        <span className="ml-2 text-sm font-medium">{strengthText}</span>
      </div>
      <ul className="space-y-1 text-sm">
        {requirements.map((req, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-1",
              req.met ? "text-green-500" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                req.met ? "bg-green-500" : "bg-muted"
              )}
            />
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    await authClient.admin.createUser({
      name: data.name as string,
      email: data.email as string,
      password: data.password as string,
      role: data.role as string,
      data: {
        source: "dashboard",
      },
      fetchOptions: {
        onResponse: () => setIsPending(false),
        onRequest: () => setIsPending(true),
        onError: (ctx) => {
          toast.error("Uh oh! Something went wrong.", {
            description: ctx.error.message ?? "Failed to create user.",
            action: {
              label: "Try again",
              onClick: () => {
                void authClient.admin.createUser({
                  name: data.name as string,
                  email: data.email as string,
                  password: data.password as string,
                  role: data.role as string,
                  data: {
                    source: "dashboard",
                  },
                  fetchOptions: {
                    onResponse: () => setIsPending(false),
                    onRequest: () => setIsPending(true),
                  },
                });
              },
            },
          });
        },
        onSuccess: async () => {
          toast.success("Success", {
            description: "User created successfully",
          });

          void queryClient.invalidateQueries({ queryKey: ["users"] });
          setOpen(false);
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <PlusCircle />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-scroll sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Create a new user by filling out the form below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="password" className="text-right pt-2">
                Password
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && <PasswordStrengthIndicator password={password} />}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select name="role" required>
                <SelectTrigger className="col-span-3" id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
