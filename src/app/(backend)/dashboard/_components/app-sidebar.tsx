"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/hooks/use-auth-hooks";
import { api } from "@/trpc/react";
import { useUserFeatures } from "@/hooks/use-feature-access";
import { AVAILABLE_FEATURES, type FeatureKey } from "@/server/db/schema/feature-permissions-schema";
import {
  ChartArea,
  Command,
  FileChartLine,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  PieChart,
  Settings2,
  Shield,
  Users2,
  Sparkles,
  Crown,
  User,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useMemo, type ComponentProps } from "react";
import NavMain from "./nav-main";
import NavSecondary from "./nav-secondary";
import NavUser from "./nav-user";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  requireAdmin?: boolean;
  feature?: FeatureKey;
}

interface SecondaryNavItem {
  title: string;
  url: string;
  icon: typeof LifeBuoy;
  dialog?: boolean;
}

interface SidebarData {
  navMain: NavItem[];
  navSecondary: SecondaryNavItem[];
}

const SIDEBAR_DATA: SidebarData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "AI Caption Generator",
      url: "/dashboard/ai-caption-generator",
      icon: ImageIcon,
      feature: AVAILABLE_FEATURES.AI_CAPTION_GENERATOR,
    },
    {
      title: "Bio & Profile Optimizer",
      url: "/dashboard/bio-optimizer",
      icon: User,
      feature: AVAILABLE_FEATURES.BIO_OPTIMIZER,
    },
    {
      title: "Tweet Generator",
      url: "/dashboard/tweet-generator",
      icon: Twitter,
      feature: AVAILABLE_FEATURES.TWEET_GENERATOR,
    },
    {
      title: "Blog Management",
      url: "/dashboard/blog",
      icon: FileText,
      requireAdmin: true,
    },
    {
      title: "Comment Moderation",
      url: "/dashboard/comments",
      icon: MessageSquare,
      requireAdmin: true,
    },
    // TODO: Need to fix / completely add full functionality    
    // {
    //   title: "Link-in-Bio Creator",
    //   url: "/dashboard/link-in-bio",
    //   icon: Link,
    // },
    // {
    //   title: "Profile Audit & Suggestions",
    //   url: "/dashboard/profile-audit",
    //   icon: BarChart3,
    // },
    // {
    //   title: "A/B Testing for Profiles",
    //   url: "/dashboard/ab-testing",
    //   icon: TrendingUp,
    // },
    // {
    //   title: "Hashtag Generator",
    //   url: "/dashboard/hashtag-generator",
    //   icon: Hash,
    // },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: ChartArea,
      requireAdmin: true,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: FileChartLine,
      requireAdmin: true,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: PieChart,
      requireAdmin: true,
    },
    {
      title: "Feature Permissions",
      url: "/dashboard/feature-permissions",
      icon: Shield,
      requireAdmin: true,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users2,
      requireAdmin: true,
    },
    {
      title: "Settings",
      url: "/dashboard/settings/account",
      icon: Settings2,
    },
  ],
  navSecondary: [
   // {
   //   title: "Support",
   //   url: "support",
   //   icon: LifeBuoy,
   //   dialog: true,
   // },
  ],
};

const DEFAULT_SITE_NAME = "Replier Social";
const DEFAULT_PLAN_NAME = "Free";

// Plan styling configuration
const getPlanStyling = (planName: string) => {
  const plan = planName.toLowerCase();
  
  if (plan.includes('pro') || plan.includes('premium')) {
    return {
      variant: 'default' as const,
      icon: Crown,
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
    };
  }
  
  if (plan.includes('enterprise') || plan.includes('business')) {
    return {
      variant: 'default' as const,
      icon: Sparkles,
      className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
    };
  }
  
  return {
    variant: 'secondary' as const,
    icon: null,
    className: 'bg-muted/50 text-muted-foreground border-border/50'
  };
};

/**
 * Renders the application sidebar component.
 *
 * This function fetches user session, site settings, and current billing plan data.
 * It filters navigation items based on admin permissions and renders the sidebar with the site logo,
 * name, and plan information. The sidebar includes main navigation, secondary navigation, and a footer for user actions.
 *
 * @param props - Props passed to the Sidebar component.
 * @returns A JSX element representing the application sidebar.
 */
export default function AppSidebar({
  ...props
}: ComponentProps<typeof Sidebar>) {
  const { user } = useSession();
  const [siteSettings] = api.settings.site.useSuspenseQuery();
  const [currentPlan] = api.payments.getCurrentBilling.useSuspenseQuery();
  const { hasFeature } = useUserFeatures();

  const filteredNavMain = useMemo(
    () =>
      SIDEBAR_DATA.navMain.filter(
        (item) => {
          // Check admin requirement
          if (item.requireAdmin && user?.role !== "admin") {
            return false;
          }
          // Check feature access
          if (item.feature && !hasFeature(item.feature)) {
            return false;
          }
          return true;
        },
      ),
    [user?.role, hasFeature],
  );

  const siteName = siteSettings?.name ?? DEFAULT_SITE_NAME;
  const planName = (currentPlan?.product as { name?: string })?.name ?? DEFAULT_PLAN_NAME;
  const logoSrc = siteSettings?.logo ?? undefined;
  const planStyling = getPlanStyling(planName);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="group">
              <Link href="/" className="transition-all duration-200 hover:bg-accent/50">
                <div className="flex aspect-square size-10 items-center justify-center">
                  <Avatar className="h-10 w-10 shrink-0 rounded-xl ring-2 ring-border/20 transition-all duration-200 group-hover:ring-border/40">
                    <AvatarImage
                      src={logoSrc}
                      alt={`${siteName} logo`}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                      <Command className="size-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                    {siteName}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={planStyling.variant}
                      className={`text-xs font-medium px-2 py-0.5 ${planStyling.className}`}
                    >
                      {planStyling.icon && (
                        <planStyling.icon className="w-3 h-3 mr-1" />
                      )}
                      {planName}
                    </Badge>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <div className="py-2">
          <NavMain items={filteredNavMain} />
        </div>
        <div className="mt-auto pt-4 border-t border-border/50">
          <NavSecondary items={SIDEBAR_DATA.navSecondary} className="mt-auto" />
        </div>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/50 bg-muted/20">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}