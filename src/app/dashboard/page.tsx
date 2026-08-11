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

      {/* Charts Row - Equal Height Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-2 flex-shrink-0">
            <div>
              <CardTitle className="text-sm sm:text-base text-slate-900">
                Borrowing Activity
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Monthly borrows and returns trend
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
            <BorrowingTrendChart />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm sm:text-base text-slate-900">
              Collections by Category
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Book distribution across subjects
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Quick Actions - Equal Height Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
            <div>
              <CardTitle className="text-sm sm:text-base text-slate-900">
                Recent Activities
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Latest borrows, returns, and member registrations
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-y-auto">
            <RecentActivities />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm sm:text-base text-slate-900">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Frequently used operations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-3 sm:p-4 pt-0 min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]">
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}