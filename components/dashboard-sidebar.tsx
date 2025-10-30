"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  History,
  Users,
  FileText,
  BarChart3,
  Trophy,
  Calendar,
  Settings,
  Gamepad2,
  Sword,
  DollarSign,
  StickyNote,
  BookOpen,
  Clock,
  Mail,
  Award,
  BookMarked,
  User,
  Shield
} from "lucide-react";

const navigationItems = [
  {
    title: "League Home",
    href: "/dashboard",
    icon: Home,
    description: "Overview and stats"
  },
  {
    title: "History",
    href: "/dashboard/history",
    icon: History,
    description: "League history and champions"
  },
  {
    title: "Gamecenter",
    href: "/dashboard/gamecenter",
    icon: Gamepad2,
    description: "Live games and scores"
  },
  {
    title: "The Draft",
    href: "/dashboard/draft",
    icon: FileText,
    description: "Draft analysis and results"
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: BarChart3,
    description: "Trades, waivers, and moves"
  },
  {
    title: "Versus",
    href: "/dashboard/versus",
    icon: Sword,
    description: "Head-to-head matchups"
  },
  {
    title: "Finances",
    href: "/dashboard/finances",
    icon: DollarSign,
    description: "League finances and payments"
  },
  {
    title: "Notes",
    href: "/dashboard/notes",
    icon: StickyNote,
    description: "League notes and announcements"
  },
  {
    title: "Rules",
    href: "/dashboard/rules",
    icon: BookOpen,
    description: "League rules and settings"
  },
  {
    title: "Schedule",
    href: "/dashboard/schedule",
    icon: Clock,
    description: "Season schedule and matchups"
  },
  {
    title: "Newsletter",
    href: "/dashboard/newsletter",
    icon: Mail,
    description: "League newsletter and updates"
  },
  {
    title: "Achievements",
    href: "/dashboard/achievements",
    icon: Award,
    description: "League achievements and awards"
  },
  {
    title: "Record Book",
    href: "/dashboard/record-book",
    icon: BookMarked,
    description: "League records and milestones"
  },
  {
    title: "Import Data",
    href: "/import",
    icon: Calendar,
    description: "Import ESPN data"
  },
  {
    title: "Manual Entry",
    href: "/manual-entry",
    icon: Settings,
    description: "Manual data entry"
  }
];

const userSection = {
  title: "User",
  href: "/dashboard/profile",
  icon: User,
  description: "User profile and settings"
};

const commissionerSection = {
  title: "Commissioner Tools",
  href: "/dashboard/commissioner",
  icon: Shield,
  description: "Commissioner administration tools"
};

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-4 px-4 flex items-center justify-center">
            <Image
              src="/PlayazLogoNoBackground.png"
              alt="Playaz Only Logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.title}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom section with User and Commissioner Tools */}
      <div className="px-3 py-2 border-t">
        <div className="space-y-1">
          <Button
            variant={pathname === userSection.href ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href={userSection.href}>
              <userSection.icon className="mr-2 h-4 w-4" />
              {userSection.title}
            </Link>
          </Button>
          <Button
            variant={pathname === commissionerSection.href ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href={commissionerSection.href}>
              <commissionerSection.icon className="mr-2 h-4 w-4" />
              {commissionerSection.title}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
