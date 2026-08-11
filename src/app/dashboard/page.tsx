// src/app/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { BorrowingTrendChart } from "@/components/dashboard/BorrowingTrendChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LiveStats } from "@/components/dashboard/LiveStats";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { DbStatusBanner } from "@/components/dashboard/DbStatusBanner";

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening at your library today."
        actions={<DashboardActions />}
      />

      <DbStatusBanner />

      {/* Live Stats Grid - Fully Responsive */}
      <LiveStats />

      {/* Charts Row - Responsive Breakpoints */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
        {/* Mobile: Full width, Tablet+: 2/3 - 1/3 split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm sm:text-base text-slate-900">
                  Borrowing Activity
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Monthly borrows and returns trend
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[220px] sm:h-[260px] lg:h-[300px]">
              <BorrowingTrendChart />
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base text-slate-900">
                Collections by Category
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Book distribution across subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[220px] sm:h-[260px] lg:h-[300px]">
              <CategoryChart />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activities & Quick Actions - Responsive */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-sm sm:text-base text-slate-900">
                  Recent Activities
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Latest borrows, returns, and member registrations
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="max-h-[300px] sm:max-h-[350px] lg:max-h-[400px] overflow-y-auto">
              <RecentActivities />
            </CardContent>
          </Card>

          <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base text-slate-900">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Frequently used operations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <QuickActions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}