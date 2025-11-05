"use client";
import Link from "next/link";

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

function Footer() {
  return (
    <footer className="bg-background px-4 py-12 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="icon-class w-8" />
              <h2 className="text-lg font-bold">Spectrum UI</h2>
            </Link>

            <h1 className="mt-4 dark:text-gray-300">
              Build by{" "}
              <span className="dark:text-[#039ee4]">
                <Link href="https://x.com/arihantCodes">@Arihantjain</Link>
              </span>
            </h1>
            <div className="mt-2">
              <Link href="https://x.com/compose/tweet?text=I%27ve%20been%20using%20%23SpectrumUI%20share%20yourtought%20%40arihantCodes%20">
                <Button variant="secondary">
                  Share Your Thoughts On
                  <Icons.twitter className="icon-class ml-1 w-3.5" />
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm dark:text-gray-400">
              © {new Date().getFullYear()} Spectrum UI. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold">Pages</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Components
                  </Link>
                </li>
                <li>
                  <Link
                    href="/examples"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Examples
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://blog.arihant.us/"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Socials</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://github.com/arihantcodes/spectrum-ui"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Github
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com/in/arihantcodes"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://x.com/arihantcodes"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    X
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tos"
                    className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-4 flex w-full items-center justify-center">
          <h1 className="bg-gradient-to-b from-neutral-700 to-neutral-900 bg-clip-text text-center text-3xl font-bold text-transparent select-none md:text-5xl lg:text-[10rem]">
            shadcn/ui
          </h1>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
