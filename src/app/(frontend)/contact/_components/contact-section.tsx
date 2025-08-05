/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api } from "@/trpc/react";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/utils/schema/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Contact section component with enhanced UX and accessibility
/**
 * ContactSection component for handling contact form submissions.
 *
 * This component manages a contact form with fields for name, email, subject, and message.
 * It includes client-side validation, auto-saving draft to localStorage,
 * and handles successful and error submission states.
 * Upon successful submission, it displays a success toast and resets the form.
 * On error, it shows an error toast with a retry option and focuses back on the submit button.
 *
 * @returns JSX for the contact section component.
 */
export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  const sendContactMail = api.settings.sendContactMail.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully!", {
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
        icon: <CheckCircle className="h-4 w-4" />,
        duration: 5000,
      });

      form.reset();
      
      // Focus management for accessibility
      setTimeout(() => {
        const firstInput = formRef.current?.querySelector('input');
        firstInput?.focus();
      }, 100);
    },
    onError: (error) => {
      console.error("Contact form submission error:", error);
      
      toast.error("Failed to send message", {
        description: error.message || "Please check your connection and try again.",
        action: {
          label: "Retry",
          onClick: () => {
            const formData = form.getValues();
            if (formData.name && formData.email && formData.message) {
              sendContactMail.mutate(formData);
            }
          },
        },
        duration: 7000,
      });
      
      // Focus back to submit button for retry
      submitButtonRef.current?.focus();
    },
  });

  // Memoized submit handler for performance
  const onSubmit = useCallback(async (data: ContactFormValues) => {
    // Basic client-side validation
    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    sendContactMail.mutate(data);
  }, [sendContactMail]);

  // Auto-save draft to localStorage (optional enhancement)
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name || value.email || value.subject || value.message) {
        localStorage.setItem('contact-form-draft', JSON.stringify(value));
      }
    });

    // Load draft on mount
    const savedDraft = localStorage.getItem('contact-form-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        form.reset(draft);
      } catch (error) {
        console.warn('Failed to load contact form draft:', error);
      }
    }

    return () => {
      subscription.unsubscribe();
      // Clear draft on successful submission
      if (!sendContactMail.isPending) {
        localStorage.removeItem('contact-form-draft');
      }
    };
  }, [form, sendContactMail.isPending]);

  return (
    <section className="py-16 sm:py-24 lg:py-32" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h1 id="contact-heading" className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Contact Our Sales Team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Ready to transform your social media strategy? Let's discuss the perfect plan for your business needs.
          </p>
        </div>

        {/* Contact Form Card */}
        <Card className="mx-auto mt-12 max-w-2xl shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              Get Started Today
            </CardTitle>
            <CardDescription className="text-base">
              Tell us about your goals and we'll help you find the right solution. 
              Our team typically responds within 2-4 hours during business days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <Form {...form}>
              <form
                ref={formRef}
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
                aria-label="Contact sales form"
              >
                {/* Name and Email Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" aria-hidden="true" />
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            autoComplete="name"
                            {...field}
                            disabled={sendContactMail.isPending}
                            aria-describedby={form.formState.errors.name ? "name-error" : undefined}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage id="name-error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          Work Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            autoComplete="email"
                            {...field}
                            disabled={sendContactMail.isPending}
                            aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage id="email-error" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        Subject
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How can we help you?"
                          {...field}
                          disabled={sendContactMail.isPending}
                          aria-describedby={form.formState.errors.subject ? "subject-error" : undefined}
                          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage id="subject-error" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        Message *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your business needs, team size, and how you plan to use Replivity..."
                          rows={4}
                          {...field}
                          disabled={sendContactMail.isPending}
                          aria-describedby={form.formState.errors.message ? "message-error" : undefined}
                          className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          maxLength={1000}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormMessage id="message-error" />
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/1000 characters
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex flex-col gap-4">
                  <Button 
                    ref={submitButtonRef}
                    type="submit" 
                    disabled={sendContactMail.isPending || !form.formState.isValid}
                    className="w-full sm:w-auto sm:self-start transition-all duration-200 hover:scale-105"
                    size="lg"
                  >
                    {sendContactMail.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    By submitting this form, you agree to our privacy policy and terms of service.
                    We'll only use your information to respond to your inquiry.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional Contact Information */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Need immediate assistance? Email us directly at{" "}
            <a 
              href="mailto:sales@replivity.com" 
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
            >
              sales@replivity.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
