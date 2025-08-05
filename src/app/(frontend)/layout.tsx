"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { Command, Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import FooterSection from "./_components/footer-section";

const menuItems = [
  { name: "Features", href: "/#features" },
  { name: "Solution", href: "/#content" },
  { name: "Pricing", href: "/#pricing" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function FrontendLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [menuState, setMenuState] = useState(false);
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
        <p className="text-red-400">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <header>
        <nav
          data-state={menuState && "active"}
          className="fixed z-20 w-full border-b border-dashed border-gray-800 bg-black backdrop-blur md:relative text-white"
        >
          <div className="m-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2 text-white"
                >
                  <div className="flex aspect-square size-6 items-center justify-center gap-2 font-medium">
                    <Avatar className="size-6 shrink-0 rounded-none">
                      <AvatarImage
                        src={settings?.logo}
                        alt={settings?.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-lg">
                        <Command className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    {settings?.name ?? "Replier"}
                  </div>
                </Link>

                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="m-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                  <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
                </button>
              </div>

              <div className="bg-gray-900/50 mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-700 p-6 shadow-2xl shadow-black/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-gray-300 hover:text-emerald-400 block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:border-gray-700 lg:pl-6">
                  <SignedIn>
                    <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black">
                      <Link href="/dashboard">
                        <span>Dashboard</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                      <Link href="/auth/sign-out">
                        <span>Sign Out</span>
                      </Link>
                    </Button>
                  </SignedIn>

                  <SignedOut>
                    <Button asChild variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                      <Link href="/auth/sign-in">
                        <span>Sign In</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black">
                      <Link href="/auth/sign-up">
                        <span>Sign Up</span>
                      </Link>
                    </Button>
                  </SignedOut>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      {children}
      <FooterSection />
    </>
  );
}
