"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r bg-card">
          <div className="flex flex-col flex-grow">
            <DashboardSidebar />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
