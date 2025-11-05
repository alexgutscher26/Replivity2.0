"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import {
  type AccountSettingsFormValues,
  accountSettingsSchema,
} from "@/utils/schema/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

/**
 * Account settings form component.
 *
 * This component fetches account settings using a query and provides a form for users to update their brand voice customization,
 * custom prompt, and other related fields. It handles form submission by updating the account settings through a mutation
 * and provides feedback on success or error. The form dynamically updates when new account settings are loaded.
 *
 * @returns A React functional component rendering an account settings form.
 */
export function AccountForm() {
  const { data: accountSettings, isLoading } = api.settings.account.useQuery();

  const updateAccount = api.settings.updateAccount.useMutation({
    onSuccess: () => {
      toast.success("Success", {
        description: "Your account settings have been saved.",
      });
    },
    onError: (error) => {
      toast.error("Uh oh! Something went wrong.", {
        description: error.message ?? "An error occurred",
        action: {
          label: "Try again",
          onClick: () => {
            updateAccount.mutate({
              ...accountSettings,
              ...form.getValues(),
            });
          },
        },
      });
    },
  });

  const form = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      customPrompt: "",
      brandName: "",
      brandPersonality: "",
      brandTone: "professional",
      customTone: "",
      brandValues: "",
      targetAudience: "",
      brandKeywords: "",
      avoidKeywords: "",
    },
  });

  // Update form when account settings load
  useEffect(() => {
    if (accountSettings) {
      form.reset({
        customPrompt: accountSettings.customPrompt,
        brandName: accountSettings.brandName || "",
        brandPersonality: accountSettings.brandPersonality || "",
        brandTone: accountSettings.brandTone || "professional",
        customTone: accountSettings.customTone || "",
        brandValues: accountSettings.brandValues || "",
        targetAudience: accountSettings.targetAudience || "",
        brandKeywords: accountSettings.brandKeywords || "",
        avoidKeywords: accountSettings.avoidKeywords || "",
      });
    }
  }, [form, accountSettings]);

  /**
   * Updates account settings with submitted data.
   */
  function onSubmit(data: AccountSettingsFormValues) {
    updateAccount.mutate({
      ...accountSettings,
      ...data,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Brand Voice Customization</h3>
            <p className="text-muted-foreground text-sm">
              Configure your brand voice to ensure consistent AI-generated
              content.
            </p>
          </div>

          <FormField
            control={form.control}
            name="brandName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Brand Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your brand name"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The name of your brand or company.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandPersonality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Brand Personality
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] resize-y"
                    placeholder="Describe your brand's personality (e.g., innovative, trustworthy, fun, professional)"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the key personality traits of your brand.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandTone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Brand Tone
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The overall tone your brand uses in communications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("brandTone") === "custom" && (
            <FormField
              control={form.control}
              name="customTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isLoading ? "animate-pulse" : ""}>
                    Custom Tone Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[60px] resize-y"
                      placeholder="Describe your custom tone"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your custom brand tone in detail.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="brandValues"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Brand Values
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] resize-y"
                    placeholder="List your brand values (e.g., sustainability, innovation, customer-first)"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The core values that guide your brand.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Target Audience
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[80px] resize-y"
                    placeholder="Describe your target audience (e.g., young professionals, tech enthusiasts, small business owners)"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Who is your primary audience? This helps tailor the messaging.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Brand Keywords
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[60px] resize-y"
                    placeholder="Keywords to include (comma-separated: innovation, quality, reliable)"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Keywords that should frequently appear in your content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avoidKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Keywords to Avoid
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[60px] resize-y"
                    placeholder="Keywords to avoid (comma-separated: cheap, basic, outdated)"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Keywords that should not appear in your content.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Custom Prompt</h3>
            <p className="text-muted-foreground text-sm">
              Advanced customization for AI responses.
            </p>
          </div>

          <FormField
            control={form.control}
            name="customPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isLoading ? "animate-pulse" : ""}>
                  Custom Prompt
                </FormLabel>
                <FormControl>
                  <Textarea
                    className={`min-h-[100px] resize-y ${
                      isLoading ? "bg-muted animate-pulse" : ""
                    }`}
                    placeholder="Enter your custom prompt to override default AI instructions"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormDescription
                  className={
                    isLoading ? "text-muted-foreground animate-pulse" : ""
                  }
                >
                  This will override the brand voice settings above and directly
                  instruct the AI.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size={"sm"}
          variant={"outline"}
          disabled={isLoading || updateAccount.isPending}
        >
          {updateAccount.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </Form>
  );
}
