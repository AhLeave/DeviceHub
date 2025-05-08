import { useQuery } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  subtext: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function StatCard({ title, value, subtext, icon, color, bgColor, borderColor }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-neutral-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          <p className="text-xs text-success mt-1 flex items-center">
            {subtext}
          </p>
        </div>
        <div className={`p-2 ${bgColor} rounded-lg ${color}`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const totalDevices = devices?.length || 0;
  const onlineDevices = devices?.filter(d => d.status === "online").length || 0;
  const offlineDevices = devices?.filter(d => d.status === "offline").length || 0;
  const issueDevices = devices?.filter(d => d.status === "warning" || d.compliance === "warning" || d.compliance === "non-compliant").length || 0;
  
  const onlinePercentage = totalDevices ? Math.round((onlineDevices / totalDevices) * 100) : 0;
  const offlinePercentage = totalDevices ? Math.round((offlineDevices / totalDevices) * 100) : 0;
  const criticalIssues = devices?.filter(d => d.compliance === "non-compliant").length || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Devices"
        value={totalDevices}
        subtext={<><i className="fas fa-arrow-up mr-1"></i> 12% from last month</>}
        icon="fa-mobile-alt"
        color="text-primary-500"
        bgColor="bg-primary-50"
        borderColor="border-primary-500"
      />
      
      <StatCard 
        title="Online Devices"
        value={onlineDevices}
        subtext={`${onlinePercentage}% of total devices`}
        icon="fa-check-circle"
        color="text-success"
        bgColor="bg-green-50"
        borderColor="border-success"
      />
      
      <StatCard 
        title="Offline Devices"
        value={offlineDevices}
        subtext={`${offlinePercentage}% of total devices`}
        icon="fa-exclamation-circle"
        color="text-warning"
        bgColor="bg-yellow-50"
        borderColor="border-warning"
      />
      
      <StatCard 
        title="Issues"
        value={issueDevices}
        subtext={`${criticalIssues} critical issues`}
        icon="fa-bug"
        color="text-danger"
        bgColor="bg-red-50"
        borderColor="border-danger"
      />
    </div>
  );
}
