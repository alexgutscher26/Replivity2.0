import icon from "@/assets/icon.png";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@daveyplate/better-auth-ui";
import { Link, Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="mx-auto max-w-80 min-w-80 space-y-4 px-4 py-2">
      <nav className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="flex items-center gap-2"
            target="_blank"
            to={new URL("/", import.meta.env.WXT_SITE_URL).href}
          >
            <img
              alt={`${i18n.t("extension.name")} logo`}
              className="size-6"
              src={icon}
            />
            <h1 className="text-base font-bold">{i18n.t("extension.name")}</h1>
          </Link>

          <SignedIn>
            <Link to="sign-out">
              <Button size="sm" variant="ghost">
                Sign out
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <Link to="sign-in">
              <Button size="sm" variant="ghost">
                Sign in
              </Button>
            </Link>
          </SignedOut>
        </div>
        {/* Faded gradient border */}
        <div
          aria-hidden="true"
          className="bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"
        />
      </nav>
      <Outlet />
    </div>
  );
}
