"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import {
  supportFormSchema,
  type SupportFormValues,
} from "@/utils/schema/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Bug,
  Lightbulb,
  Settings,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SupportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional initial values for the form */
  initialValues?: Partial<SupportFormValues>;
  /** Optional callback when support request is successfully sent */
  onSuccess?: () => void;
  /** Optional priority level for the support request */
  priority?: "low" | "medium" | "high";
  /** Optional custom title for the dialog */
  title?: string;
  /** Optional custom description for the dialog */
  description?: string;
  /** Optional flag to disable category selection */
  disableCategorySelection?: boolean;
}

const SUPPORT_CATEGORIES = [
  {
    id: "bug",
    label: "Bug Report",
    icon: Bug,
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    description: "Report a problem or error",
  },
  {
    id: "feature",
    label: "Feature Request",
    icon: Lightbulb,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    description: "Suggest a new feature or improvement",
  },
  {
    id: "help",
    label: "General Help",
    icon: HelpCircle,
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    description: "Get help with using the platform",
  },
  {
    id: "account",
    label: "Account Issue",
    icon: Settings,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    description: "Issues with your account or billing",
  },
] as const;

type SupportCategory = (typeof SUPPORT_CATEGORIES)[number]["id"];

// Constants for better maintainability
const FORM_LIMITS = {
  SUBJECT_MAX: 100,
  MESSAGE_MAX: 2000,
  MESSAGE_MIN: 10,
} as const;

const TOAST_DURATIONS = {
  SUCCESS: 5000,
  ERROR: 7000,
  WARNING: 4000,
} as const;

/**
 * Support Dialog Component
 *
 * This component renders a dialog for users to submit support requests. It includes fields for subject and message,
 * category selection, and priority indication. The form is validated both client-side and server-side, with appropriate
 * error handling and success notifications. The dialog can be opened or closed based on the `open` prop, and it resets
 * its state when opening or closing.
 *
 * @param open - A boolean indicating whether the dialog should be open or closed.
 * @param onOpenChange - A callback function to handle changes in the open state of the dialog.
 * @param initialValues - Initial values for the form fields (optional).
 * @param onSuccess - A callback function to execute upon successful submission of a support request (optional).
 * @param priority - The priority level of the support request, defaulting to "medium" if not provided.
 */
export default function SupportDialog({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
  priority = "medium",
  title = "Contact Support",
  description = "Need assistance? Send us a detailed message and we'll respond as quickly as possible. Please include any relevant information to help us assist you better.",
  disableCategorySelection = false,
}: SupportDialogProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<SupportCategory | null>(null);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      subject: initialValues?.subject ?? "",
      message: initialValues?.message ?? "",
    },
    mode: "onChange",
    shouldFocusError: true,
    shouldUnregister: false,
  });

  // Enhanced form validation with better UX and performance optimization
  const formValidation = useMemo(() => {
    const subject = form.watch("subject")?.trim() || "";
    const message = form.watch("message")?.trim() || "";

    const isSubjectValid =
      subject.length > 0 && subject.length <= FORM_LIMITS.SUBJECT_MAX;
    const isMessageValid =
      message.length >= FORM_LIMITS.MESSAGE_MIN &&
      message.length <= FORM_LIMITS.MESSAGE_MAX;

    return {
      isSubjectValid,
      isMessageValid,
      subjectLength: subject.length,
      messageLength: message.length,
      isFormValid: isSubjectValid && isMessageValid,
      subjectProgress: (subject.length / FORM_LIMITS.SUBJECT_MAX) * 100,
      messageProgress: (message.length / FORM_LIMITS.MESSAGE_MAX) * 100,
    };
  }, [form]);

  // Reset form when dialog opens/closes or initial values change
  useEffect(() => {
    if (open) {
      form.reset({
        subject: initialValues?.subject ?? "",
        message: initialValues?.message ?? "",
      });
      setSelectedCategory(null);
      setIsSubmitAttempted(false);
      setIsDirty(false);
    }
  }, [open, initialValues, form]);

  // Track form dirty state for better UX
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && (value.subject || value.message)) {
        setIsDirty(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-focus submit button when form becomes valid
  useEffect(() => {
    if (
      formValidation.isFormValid &&
      isSubmitAttempted &&
      submitButtonRef.current
    ) {
      submitButtonRef.current.focus();
    }
  }, [formValidation.isFormValid, isSubmitAttempted]);

  const handleSuccess = useCallback(() => {
    const categoryLabel = selectedCategory
      ? SUPPORT_CATEGORIES.find((c) => c.id === selectedCategory)?.label
      : "General";

    toast.success("Support request sent successfully", {
      description: `Your ${categoryLabel} request has been submitted. We'll get back to you as soon as possible.`,
      duration: TOAST_DURATIONS.SUCCESS,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });

    form.reset();
    setSelectedCategory(null);
    setIsSubmitAttempted(false);
    setIsDirty(false);
    onOpenChange?.(false);
    onSuccess?.();
  }, [form, onOpenChange, onSuccess, selectedCategory]);

  const mail = api.settings.sendSupportMail.useMutation({
    onSuccess: handleSuccess,
    onError: (error: unknown) => {
      console.error("Support request failed:", error);

      let errorMessage = "An unexpected error occurred";
      let errorCode = "UNKNOWN_ERROR";

      if (error instanceof Error) {
        errorMessage = error.message;
        // Extract error code if available (e.g., from tRPC errors)
        if ("code" in error) {
          errorCode = String(error.code);
        }
      }

      toast.error("Failed to send support request", {
        description: `${errorMessage} ${errorCode !== "UNKNOWN_ERROR" ? `(Code: ${errorCode})` : ""}`,
        duration: TOAST_DURATIONS.ERROR,
        icon: <AlertCircle className="h-4 w-4" />,
        action: {
          label: "Retry",
          onClick: () => {
            const formData = form.getValues();
            if (formData.subject?.trim() && formData.message?.trim()) {
              mail.mutate({
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                category: selectedCategory,
              });
            }
          },
        },
      });
    },
  });

  const onSubmit = useCallback(
    async (formData: SupportFormValues) => {
      setIsSubmitAttempted(true);

      // Enhanced client-side validation with better error messages
      const trimmedSubject = formData.subject.trim();
      const trimmedMessage = formData.message.trim();

      if (!trimmedSubject) {
        form.setError("subject", {
          message: "Subject is required and cannot be empty",
          type: "required",
        });
        return;
      }

      if (trimmedSubject.length > FORM_LIMITS.SUBJECT_MAX) {
        form.setError("subject", {
          message: `Subject must be ${FORM_LIMITS.SUBJECT_MAX} characters or less`,
          type: "maxLength",
        });
        return;
      }

      if (!trimmedMessage) {
        form.setError("message", {
          message: "Message is required and cannot be empty",
          type: "required",
        });
        return;
      }

      if (trimmedMessage.length < FORM_LIMITS.MESSAGE_MIN) {
        form.setError("message", {
          message: `Please provide more details (at least ${FORM_LIMITS.MESSAGE_MIN} characters)`,
          type: "minLength",
        });
        return;
      }

      if (trimmedMessage.length > FORM_LIMITS.MESSAGE_MAX) {
        form.setError("message", {
          message: `Message must be ${FORM_LIMITS.MESSAGE_MAX} characters or less`,
          type: "maxLength",
        });
        return;
      }

      // Enhanced mutation with additional context and metadata
      mail.mutate({
        subject: trimmedSubject,
        message: trimmedMessage,
        category: selectedCategory,
      });
    },
    [form, mail, selectedCategory],
  );

  const handleClose = useCallback(() => {
    if (mail.isPending) {
      toast.warning("Please wait for the request to complete", {
        description: "Your support request is being sent...",
        duration: TOAST_DURATIONS.WARNING,
      });
      return;
    }

    // Warn user about unsaved changes
    if (
      isDirty &&
      (form.getValues().subject?.trim() || form.getValues().message?.trim())
    ) {
      const shouldClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close this dialog?",
      );
      if (!shouldClose) return;
    }

    onOpenChange?.(false);
  }, [mail.isPending, onOpenChange, isDirty, form]);

  const handleCategorySelect = useCallback(
    (category: SupportCategory) => {
      setSelectedCategory((prev) => (prev === category ? null : category));

      // Auto-populate subject prefix based on category (only if subject is empty)
      const currentSubject = form.getValues("subject")?.trim();
      if (!currentSubject && category) {
        const categoryData = SUPPORT_CATEGORIES.find((c) => c.id === category);
        if (categoryData) {
          form.setValue("subject", `${categoryData.label}: `, {
            shouldDirty: true,
          });
          form.setFocus("subject");
        }
      }
    },
    [form],
  );

  /**
   * Determines the color class and status based on character count validation
   * @param current - The current character count
   * @param max - The maximum allowable character count
   * @param min - An optional minimum threshold for the character count
   * @returns Object with color class and validation status
   */
  const getCharacterCountStatus = useCallback(
    (current: number, max: number, min?: number) => {
      const isOverLimit = current > max;
      const isUnderMin = min ? current < min : false;
      const isNearLimit = current > max * 0.9;

      let colorClass = "text-muted-foreground";
      let status: "valid" | "warning" | "error" = "valid";

      if (isOverLimit || isUnderMin) {
        colorClass = "text-red-500";
        status = "error";
      } else if (isNearLimit) {
        colorClass = "text-yellow-600";
        status = "warning";
      }

      return { colorClass, status, isOverLimit, isUnderMin, isNearLimit };
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
        aria-describedby="support-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription id="support-dialog-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Category Selection */}
            {!disableCategorySelection && (
              <div className="space-y-3">
                <label className="text-sm font-medium" id="category-label">
                  Category{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby="category-label"
                >
                  {SUPPORT_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <Badge
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "focus:ring-ring cursor-pointer transition-all hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none",
                          isSelected && category.color,
                          "select-none",
                        )}
                        onClick={() => handleCategorySelect(category.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCategorySelect(category.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                        aria-describedby={`category-${category.id}-description`}
                        title={category.description}
                      >
                        <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
                        {category.label}
                        <span
                          id={`category-${category.id}-description`}
                          className="sr-only"
                        >
                          {category.description}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
                {selectedCategory && (
                  <p className="text-muted-foreground text-xs">
                    Selected:{" "}
                    {
                      SUPPORT_CATEGORIES.find((c) => c.id === selectedCategory)
                        ?.description
                    }
                  </p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Subject <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of your issue (e.g., Login problem, Feature request)"
                      disabled={mail.isPending}
                      maxLength={FORM_LIMITS.SUBJECT_MAX}
                      aria-describedby="subject-description subject-validation"
                      className={cn(
                        isSubmitAttempted &&
                          !formValidation.isSubjectValid &&
                          "border-red-500",
                        formValidation.subjectLength >
                          FORM_LIMITS.SUBJECT_MAX && "border-red-500",
                      )}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <div
                    id="subject-description"
                    className={cn(
                      "flex items-center justify-between text-xs",
                      getCharacterCountStatus(
                        formValidation.subjectLength,
                        FORM_LIMITS.SUBJECT_MAX,
                      ).colorClass,
                    )}
                  >
                    <span
                      className="flex items-center gap-1"
                      id="subject-validation"
                    >
                      {formValidation.isSubjectValid ? (
                        <CheckCircle2
                          className="h-3 w-3 text-green-500"
                          aria-hidden="true"
                        />
                      ) : (
                        isSubmitAttempted && (
                          <AlertCircle
                            className="h-3 w-3 text-red-500"
                            aria-hidden="true"
                          />
                        )
                      )}
                      <span className="sr-only">
                        {formValidation.isSubjectValid
                          ? "Subject is valid"
                          : "Subject is required"}
                      </span>
                      Subject is{" "}
                      {formValidation.isSubjectValid ? "valid" : "required"}
                    </span>
                    <span aria-live="polite">
                      {formValidation.subjectLength}/{FORM_LIMITS.SUBJECT_MAX}{" "}
                      characters
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce the problem, or specific questions you have."
                      className={cn(
                        "min-h-[140px] resize-y",
                        isSubmitAttempted &&
                          !formValidation.isMessageValid &&
                          "border-red-500",
                        formValidation.messageLength >
                          FORM_LIMITS.MESSAGE_MAX && "border-red-500",
                      )}
                      disabled={mail.isPending}
                      maxLength={FORM_LIMITS.MESSAGE_MAX}
                      aria-describedby="message-description message-validation"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <div
                    id="message-description"
                    className={cn(
                      "flex items-center justify-between text-xs",
                      getCharacterCountStatus(
                        formValidation.messageLength,
                        FORM_LIMITS.MESSAGE_MAX,
                        FORM_LIMITS.MESSAGE_MIN,
                      ).colorClass,
                    )}
                  >
                    <span
                      className="flex items-center gap-1"
                      id="message-validation"
                    >
                      {formValidation.isMessageValid ? (
                        <CheckCircle2
                          className="h-3 w-3 text-green-500"
                          aria-hidden="true"
                        />
                      ) : (
                        isSubmitAttempted && (
                          <AlertCircle
                            className="h-3 w-3 text-red-500"
                            aria-hidden="true"
                          />
                        )
                      )}
                      <span className="sr-only">
                        {formValidation.isMessageValid
                          ? "Message meets requirements"
                          : `Message needs at least ${FORM_LIMITS.MESSAGE_MIN} characters`}
                      </span>
                      Message needs at least {FORM_LIMITS.MESSAGE_MIN}{" "}
                      characters
                    </span>
                    <span aria-live="polite">
                      {formValidation.messageLength}/{FORM_LIMITS.MESSAGE_MAX}{" "}
                      characters
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority and status indicator */}
            <div className="bg-muted/50 flex items-center justify-between gap-2 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle
                  className="text-muted-foreground h-4 w-4"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground text-sm">
                  Priority:
                  <Badge variant="outline" className="ml-2 capitalize">
                    {priority}
                  </Badge>
                </span>
              </div>
              {formValidation.isFormValid && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span className="text-xs">Ready to send</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mail.isPending}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                ref={submitButtonRef}
                type="submit"
                disabled={
                  mail.isPending ??
                  form.formState.isSubmitting ??
                  !formValidation.isFormValid
                }
                className="w-full sm:w-auto"
                aria-describedby="submit-button-description"
              >
                {mail.isPending || form.formState.isSubmitting ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                    Send Support Request
                  </>
                )}
                <span id="submit-button-description" className="sr-only">
                  {formValidation.isFormValid
                    ? "Submit your support request"
                    : "Complete the form to enable submission"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
