"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/hooks/use-auth-hooks";
import { api } from "@/trpc/react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PricingTable() {
  const router = useRouter();
  const { user } = useSession();
  const [products] = api.products.active.useSuspenseQuery();
  const [currency] = api.settings.currency.useSuspenseQuery();

  // Add checkout mutation
  const { mutate: checkout, isPending: isCheckingOut } =
    api.payments.createCheckout.useMutation({
      onSuccess: ({ url, type }) => {
        if (type === "free") {
          router.push("/dashboard/settings/account");
          return;
        }
        router.push(url);
      },
      onError: (error) => {
        toast.error("Failed to create checkout session", {
          description: error.message,
        });
      },
    });

  // Handle plan selection
  const handlePlanSelection = (productId: string) => {
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    checkout({ productId });
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-black py-16 md:py-32"
      id="pricing"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(rgb(55 65 81) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: "0.15",
        }}
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-transparent to-black"
        style={{ opacity: 0.8 }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-bold tracking-tighter text-white lg:text-5xl">
            Pricing that <span className="text-emerald-400">Scales</span> with
            You
          </h1>
          <p className="text-lg leading-relaxed text-gray-300">
            Choose a plan that works for you. All plans include premium features
            and dedicated support to help you grow your business.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`flex flex-col border-gray-600 bg-gray-900/50 ${product.name === "Pro" ? "relative ring-2 ring-emerald-400/50" : ""}`}
            >
              {product.name === "Pro" && (
                <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-3 py-1 text-xs font-medium text-black">
                  Popular
                </span>
              )}

              <CardHeader>
                <CardTitle className="font-bold text-white">
                  {product.name}
                </CardTitle>
                <span className="my-3 block text-2xl font-bold text-emerald-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency.toUpperCase(),
                    currencySign: "standard",
                  }).format(Number(product.price))}{" "}
                  <span className="text-lg text-gray-300">
                    / {product.type}
                  </span>
                </span>
                <CardDescription className="text-sm text-gray-400">
                  Per account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <hr className="border-dashed border-gray-600" />
                <ul className="list-outside space-y-3 text-sm">
                  {product.marketingTaglines?.map((tagline) => {
                    const values =
                      typeof tagline === "string"
                        ? tagline
                        : (tagline as { values: string }).values;

                    return (
                      <li
                        key={values}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <Check className="size-3 text-emerald-400" />
                        {values}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <Button
                  variant={product.name === "Pro" ? "default" : "outline"}
                  className={`w-full ${
                    product.name === "Pro"
                      ? "bg-emerald-500 font-bold text-black hover:bg-emerald-600"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => handlePlanSelection(product.id)}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing...
                    </>
                  ) : !user ? (
                    "Sign in to Get Started"
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
