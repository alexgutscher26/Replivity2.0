"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { api } from "@/trpc/react";
import { Command, Loader2 } from "lucide-react";
import Link from "next/link";

const footerSections = {
  Pages: [
    { title: "Blog", href: "/blog" },
    { title: "Status", href: "https://replivity.betteruptime.com" },
  ],
  Socials: [
    {
      title: "Github",
      href: "https://github.com/alexgutscher26/Replivity-an-AI-powered-social-media",
    },
    { title: "X", href: "https://x.com/snackforcode" },
  ],
  Legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
  ],
};

/**
 * Renders the footer section of the application.
 *
 * This function fetches site settings using an API query and conditionally renders different UI components based on the loading state, error state, or success state.
 * In case of loading, it displays a spinner. If there is an error, it shows the error message. Otherwise, it renders the footer with company information and navigation links.
 *
 * @returns The JSX element representing the footer section.
 */
export default function FooterSection() {
  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = api.settings.site.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="animate-spin text-emerald-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <footer className="bg-black px-4 py-12 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <Avatar className="size-8 shrink-0 rounded-none">
                <AvatarImage
                  src={settings?.logo}
                  alt={settings?.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-emerald-500">
                  <Command className="size-4 text-black" />
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold">
                {settings?.name ?? "Replivity"}
              </h2>
            </Link>

            <h1 className="mt-4 dark:text-gray-300">
              Build by{" "}
              <span className="dark:text-[#039ee4]">
                <Link href="https://github.com/alexgutscher26">
                  @{settings?.name?.toLowerCase() ?? "developer"}
                </Link>
              </span>
            </h1>
            <div className="mt-2">
              <Link href="https://x.com/compose/tweet?text=I've%20been%20using%20Replivity%20for%20AI-powered%20social%20media%20responses!%20%23Replivity%20%23AI%20%23SocialMedia%20%0A%0ACheck%20it%20out:%20&url=https://replivity.com">
                <Button variant="secondary">
                  Share Your Thoughts On
                  <Icons.twitter className="icon-class ml-1 w-3.5" />
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm dark:text-gray-400">
              © {new Date().getFullYear()} {settings?.name}. All rights
              reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Object.entries(footerSections).map(([sectionTitle, links]) => (
              <div key={sectionTitle}>
                <h3 className="mb-4 font-semibold">{sectionTitle}</h3>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex w-full items-center justify-center">
          <h1 className="bg-gradient-to-b from-neutral-700 to-neutral-900 bg-clip-text text-center text-3xl font-bold text-transparent select-none md:text-5xl lg:text-[10rem]">
            Replivity
          </h1>
        </div>
      </div>
    </footer>
  );
}
