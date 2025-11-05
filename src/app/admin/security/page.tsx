"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  AlertTriangle,
  Users,
  Activity,
  Search,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const forcePasswordResetSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(200, "Reason must be less than 200 characters"),
  expiresInDays: z.number().min(1).max(365).optional(),
  notifyUser: z.boolean().optional().default(true),
});

const logSecurityEventSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  eventType: z.enum([
    "suspicious_login",
    "password_breach",
    "multiple_failed_attempts",
    "account_compromise",
    "admin_forced",
    "password_expired",
    "two_factor_disabled",
    "session_hijack",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(1, "Description is required").max(500),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  actionTaken: z
    .enum([
      "password_reset_required",
      "account_locked",
      "session_terminated",
      "notification_sent",
      "two_factor_required",
    ])
    .optional(),
});

const setPasswordExpirySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  expiresInDays: z.number().min(1).max(365).default(90),
});

type ForcePasswordResetForm = z.infer<typeof forcePasswordResetSchema>;
type LogSecurityEventForm = z.infer<typeof logSecurityEventSchema>;
type SetPasswordExpiryForm = z.infer<typeof setPasswordExpirySchema>;

/**
 * Determines the color scheme based on the severity level.
 *
 * This function maps a given severity string to its corresponding background and text color classes.
 * If the severity does not match any predefined cases, it defaults to a gray color scheme.
 *
 * @param severity - A string representing the severity level ('low', 'medium', 'high', 'critical').
 * @returns A string with concatenated CSS class names for background and text color.
 */
function getSeverityColor(severity: string) {
  switch (severity) {
    case "low":
      return "bg-blue-100 text-blue-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Determines the color scheme based on the event type.
 *
 * This function uses a switch statement to map each event type to its corresponding color scheme.
 * The color schemes are defined using Tailwind CSS utility classes for background and text colors.
 *
 * @param eventType - A string representing the type of event.
 * @returns A string with Tailwind CSS classes for background and text colors.
 */
function getEventTypeColor(eventType: string) {
  switch (eventType) {
    case "suspicious_login":
      return "bg-yellow-100 text-yellow-800";
    case "password_breach":
      return "bg-red-100 text-red-800";
    case "multiple_failed_attempts":
      return "bg-orange-100 text-orange-800";
    case "account_compromise":
      return "bg-red-100 text-red-800";
    case "admin_forced":
      return "bg-purple-100 text-purple-800";
    case "password_expired":
      return "bg-amber-100 text-amber-800";
    case "two_factor_disabled":
      return "bg-orange-100 text-orange-800";
    case "session_hijack":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * SecurityDashboard Component
 *
 * This component provides a dashboard for managing and monitoring user security events.
 * It includes functionality to force password resets, log security events, set password expiries,
 * and view security events for specific users.
 *
 * @returns {JSX.Element} - The rendered React component.
 */
export default function SecurityManagementPage() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isForceResetDialogOpen, setIsForceResetDialogOpen] = useState(false);
  const [isLogEventDialogOpen, setIsLogEventDialogOpen] = useState(false);
  const [isSetExpiryDialogOpen, setIsSetExpiryDialogOpen] = useState(false);

  const forceResetForm = useForm<ForcePasswordResetForm>({
    resolver: zodResolver(forcePasswordResetSchema),
    defaultValues: {
      userId: "",
      reason: "",
      expiresInDays: 30,
      notifyUser: true,
    },
  });

  const logEventForm = useForm<LogSecurityEventForm>({
    resolver: zodResolver(logSecurityEventSchema),
    defaultValues: {
      userId: "",
      eventType: "suspicious_login",
      severity: "medium",
      description: "",
      ipAddress: "",
      userAgent: "",
    },
  });

  const setExpiryForm = useForm<SetPasswordExpiryForm>({
    resolver: zodResolver(setPasswordExpirySchema),
    defaultValues: {
      userId: "",
      expiresInDays: 90,
    },
  });

  const { data: userEvents, refetch: refetchUserEvents } =
    api.security.getUserSecurityEvents.useQuery(
      { userId: selectedUserId, limit: 50 },
      { enabled: Boolean(selectedUserId) },
    );

  const forcePasswordResetMutation =
    api.security.forcePasswordReset.useMutation({
      onSuccess: () => {
        toast.success("Password reset forced successfully");
        forceResetForm.reset();
        setIsForceResetDialogOpen(false);
        if (selectedUserId) void refetchUserEvents();
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to force password reset");
      },
    });

  const logSecurityEventMutation = api.security.logEvent.useMutation({
    onSuccess: () => {
      toast.success("Security event logged successfully");
      logEventForm.reset();
      setIsLogEventDialogOpen(false);
      if (selectedUserId) void refetchUserEvents();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to log security event");
    },
  });

  const setPasswordExpiryMutation = api.security.setPasswordExpiry.useMutation({
    onSuccess: () => {
      toast.success("Password expiry set successfully");
      setExpiryForm.reset();
      setIsSetExpiryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to set password expiry");
    },
  });

  /**
   * Initiates a password reset mutation with the provided form data.
   */
  const onForceReset = (data: ForcePasswordResetForm) => {
    forcePasswordResetMutation.mutate(data);
  };

  /**
   * Triggers a security event log mutation with provided data.
   */
  const onLogEvent = (data: LogSecurityEventForm) => {
    logSecurityEventMutation.mutate(data);
  };

  /**
   * Triggers a mutation to set password expiry using the provided form data.
   */
  const onSetExpiry = (data: SetPasswordExpiryForm) => {
    setPasswordExpiryMutation.mutate(data);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center space-x-2 text-3xl font-bold">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>Security Management</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage security events, force password resets, and monitor user
            security status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Threats
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-muted-foreground text-xs">
              Critical security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Resets
            </CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">0</div>
            <p className="text-muted-foreground text-xs">
              Users requiring password reset
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-muted-foreground text-xs">
              Security events logged
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actions">Security Actions</TabsTrigger>
          <TabsTrigger value="events">User Events</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Dialog
              open={isForceResetDialogOpen}
              onOpenChange={setIsForceResetDialogOpen}
            >
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <Shield className="h-5 w-5" />
                      <span>Force Password Reset</span>
                    </CardTitle>
                    <CardDescription>
                      Require a user to reset their password immediately
                    </CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Force Password Reset</DialogTitle>
                  <DialogDescription>
                    This will require the user to reset their password before
                    they can access the application.
                  </DialogDescription>
                </DialogHeader>
                <Form {...forceResetForm}>
                  <form
                    onSubmit={forceResetForm.handleSubmit(onForceReset)}
                    className="space-y-4"
                  >
                    <FormField
                      control={forceResetForm.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter user ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={forceResetForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Explain why the password reset is required"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={forceResetForm.control}
                      name="expiresInDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires in Days (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="365"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={forceResetForm.control}
                      name="notifyUser"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Notify User</FormLabel>
                            <div className="text-muted-foreground text-sm">
                              Send notification email to the user
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forcePasswordResetMutation.isPending}
                    >
                      {forcePasswordResetMutation.isPending
                        ? "Processing..."
                        : "Force Reset"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isLogEventDialogOpen}
              onOpenChange={setIsLogEventDialogOpen}
            >
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-amber-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Log Security Event</span>
                    </CardTitle>
                    <CardDescription>
                      Record a security event for a user
                    </CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Security Event</DialogTitle>
                  <DialogDescription>
                    Record a security-related event that occurred for a user.
                  </DialogDescription>
                </DialogHeader>
                <Form {...logEventForm}>
                  <form
                    onSubmit={logEventForm.handleSubmit(onLogEvent)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={logEventForm.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter user ID" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={logEventForm.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="suspicious_login">
                                  Suspicious Login
                                </SelectItem>
                                <SelectItem value="password_breach">
                                  Password Breach
                                </SelectItem>
                                <SelectItem value="multiple_failed_attempts">
                                  Multiple Failed Attempts
                                </SelectItem>
                                <SelectItem value="account_compromise">
                                  Account Compromise
                                </SelectItem>
                                <SelectItem value="admin_forced">
                                  Admin Forced
                                </SelectItem>
                                <SelectItem value="password_expired">
                                  Password Expired
                                </SelectItem>
                                <SelectItem value="two_factor_disabled">
                                  Two Factor Disabled
                                </SelectItem>
                                <SelectItem value="session_hijack">
                                  Session Hijack
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={logEventForm.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">
                                  Critical
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={logEventForm.control}
                        name="actionTaken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Taken (optional)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="password_reset_required">
                                  Password Reset Required
                                </SelectItem>
                                <SelectItem value="account_locked">
                                  Account Locked
                                </SelectItem>
                                <SelectItem value="session_terminated">
                                  Session Terminated
                                </SelectItem>
                                <SelectItem value="notification_sent">
                                  Notification Sent
                                </SelectItem>
                                <SelectItem value="two_factor_required">
                                  Two Factor Required
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={logEventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the security event"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={logEventForm.control}
                        name="ipAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IP Address (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="192.168.1.1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={logEventForm.control}
                        name="userAgent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Agent (optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Browser/device info"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={logSecurityEventMutation.isPending}
                    >
                      {logSecurityEventMutation.isPending
                        ? "Logging..."
                        : "Log Event"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isSetExpiryDialogOpen}
              onOpenChange={setIsSetExpiryDialogOpen}
            >
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-600">
                      <Clock className="h-5 w-5" />
                      <span>Set Password Expiry</span>
                    </CardTitle>
                    <CardDescription>
                      Set when a user&apos;s password should expire
                    </CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Password Expiry</DialogTitle>
                  <DialogDescription>
                    Configure when the user&apos;s password should expire and
                    require reset.
                  </DialogDescription>
                </DialogHeader>
                <Form {...setExpiryForm}>
                  <form
                    onSubmit={setExpiryForm.handleSubmit(onSetExpiry)}
                    className="space-y-4"
                  >
                    <FormField
                      control={setExpiryForm.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter user ID" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={setExpiryForm.control}
                      name="expiresInDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires in Days</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              max="365"
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={setPasswordExpiryMutation.isPending}
                    >
                      {setPasswordExpiryMutation.isPending
                        ? "Setting..."
                        : "Set Expiry"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>User Security Events</span>
              </CardTitle>
              <CardDescription>
                View security events for a specific user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter user ID to view events"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => void refetchUserEvents()}
                  disabled={!selectedUserId}
                >
                  Search
                </Button>
              </div>

              {selectedUserId && userEvents && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Events for User: {selectedUserId}
                    </h3>
                    <Badge variant="outline">{userEvents.length} events</Badge>
                  </div>

                  {userEvents.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No Events Found</AlertTitle>
                      <AlertDescription>
                        No security events found for this user.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Action Taken</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userEvents.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-mono text-sm">
                                {format(
                                  new Date(event.createdAt),
                                  "MMM dd, yyyy HH:mm",
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getEventTypeColor(event.eventType)}
                                >
                                  {event.eventType.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getSeverityColor(event.severity)}
                                >
                                  {event.severity}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {event.description}
                              </TableCell>
                              <TableCell>
                                {event.actionTaken ? (
                                  <Badge variant="outline">
                                    {event.actionTaken.replace(/_/g, " ")}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    None
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
