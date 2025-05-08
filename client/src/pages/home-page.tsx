import DashboardLayout from "@/components/layouts/dashboard-layout";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import PlatformChart from "@/components/dashboard/platform-chart";
import RecentEnrollments from "@/components/dashboard/recent-enrollments";
import ComplianceStatus from "@/components/dashboard/compliance-status";
import DeviceTable from "@/components/dashboard/device-table";
import QuickActions from "@/components/dashboard/quick-actions";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

export default function HomePage() {
  const { status, connect } = useWebSocket();
  
  // Ensure websocket connection is established
  useEffect(() => {
    if (status !== 'connected') {
      connect();
    }
  }, [status, connect]);
  
  return (
    <>
      <Helmet>
        <title>Dashboard | DeviceHub MDM</title>
        <meta name="description" content="Mobile Device Management dashboard - view device status, compliance, and perform management actions." />
      </Helmet>
      
      <DashboardLayout pageTitle="Dashboard">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PlatformChart />
          <RecentEnrollments />
          <ComplianceStatus />
        </div>
        
        <DeviceTable />
        
        <QuickActions />
      </DashboardLayout>
    </>
  );
}
