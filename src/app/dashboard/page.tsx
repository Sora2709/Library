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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening at your library today."
        actions={<DashboardActions />}
      />

      <DbStatusBanner />

      {/* Live Stats Grid */}
      <LiveStats />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base text-slate-900">Borrowing Activity</CardTitle>
              <CardDescription>Monthly borrows and returns trend</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BorrowingTrendChart />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900">Collections by Category</CardTitle>
            <CardDescription>Book distribution across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base text-slate-900">Recent Activities</CardTitle>
              <CardDescription>Latest borrows, returns, and member registrations</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <RecentActivities />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900">Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}