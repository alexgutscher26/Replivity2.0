"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ExternalLink, Key, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const linkLicenseSchema = z.object({
  licenseKey: z.string().min(1, "License key is required"),
});

type LinkLicenseForm = z.infer<typeof linkLicenseSchema>;

export default function AppSumoLicenseForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const utils = api.useUtils();

  const { data: userLicenses, isLoading: isLoadingLicenses } =
    api.appsumoLicense.getUserLicenses.useQuery();

  const linkLicense = api.appsumoLicense.linkLicenseToUser.useMutation({
    onSuccess: () => {
      toast.success("License linked successfully!", {
        description: "Your AppSumo license has been activated.",
      });
      setIsDialogOpen(false);
      form.reset();
      utils.appsumoLicense.getUserLicenses.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to link license", {
        description: error.message || "Please check your license key and try again.",
      });
    },
  });

  const form = useForm<LinkLicenseForm>({
    resolver: zodResolver(linkLicenseSchema),
    defaultValues: {
      licenseKey: "",
    },
  });

  const onSubmit = (data: LinkLicenseForm) => {
    linkLicense.mutate({
      licenseKey: data.licenseKey,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "deactivated":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Deactivated
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          AppSumo Licenses
        </CardTitle>
        <CardDescription>
          Manage your AppSumo lifetime deal licenses. Link your license key to activate premium features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingLicenses ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading licenses...</span>
          </div>
        ) : userLicenses && userLicenses.length > 0 ? (
          <div className="space-y-3">
            {userLicenses.map((license) => (
              <div
                key={license.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {(license.product as { name?: string })?.name ?? "AppSumo License"}
                    </span>
                    {getStatusBadge(license.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    License Key: {license.licenseKey.slice(0, 8)}...{license.licenseKey.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Activated: {formatDate(license.activatedAt)}
                    {license.lastUsedAt && (
                      <> • Last Used: {formatDate(license.lastUsedAt)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {license.status === "active" && (
                    <Badge variant="outline" className="text-green-600">
                      Premium Access
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No AppSumo Licenses</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t linked any AppSumo licenses yet. Purchase a lifetime deal from AppSumo and link your license key here.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open("https://appsumo.com", "_blank")}
              className="mb-4"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit AppSumo
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Link AppSumo License
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Link AppSumo License</DialogTitle>
              <DialogDescription>
                Enter your AppSumo license key to activate premium features. You can find this in your AppSumo account or purchase confirmation email.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="licenseKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your AppSumo license key"
                          {...field}
                          disabled={linkLicense.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Your license key should be a long string of characters provided by AppSumo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={linkLicense.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={linkLicense.isPending || !form.formState.isValid}
                  >
                    {linkLicense.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Link License
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">About AppSumo Licenses</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Lifetime access to premium features</li>
            <li>• No recurring subscription fees</li>
            <li>• Transferable between accounts</li>
            <li>• 60-day money-back guarantee from AppSumo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}