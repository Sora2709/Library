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
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Borrowing Activity</CardTitle>
              <CardDescription>Monthly borrows and returns over the last year</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-primary-600 bg-primary-50 rounded-md px-2 py-1">12M</button>
              <button className="text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-md px-2 py-1">6M</button>
              <button className="text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-md px-2 py-1">30D</button>
            </div>
          </CardHeader>
          <CardContent>
            <BorrowingTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collections by Category</CardTitle>
            <CardDescription>Book distribution across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base">Recent Activities</CardTitle>
              <CardDescription>Latest borrows, returns, and member registrations</CardDescription>
            </div>
            <button className="text-xs font-medium text-primary-600 hover:text-primary-700">View all</button>
          </CardHeader>
          <CardContent>
            <RecentActivities />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
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
