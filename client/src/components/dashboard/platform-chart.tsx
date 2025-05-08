import { useQuery } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

export default function PlatformChart() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const platforms = {
    ios: (devices?.filter(d => d.platform === "ios").length || 0),
    android: (devices?.filter(d => d.platform === "android").length || 0),
    ipados: (devices?.filter(d => d.platform === "ipados").length || 0),
  };
  
  const total = platforms.ios + platforms.android + platforms.ipados;
  
  const calculatePercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices by Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">iOS</span>
              <span className="text-sm font-medium text-neutral-700">{platforms.ios}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${calculatePercentage(platforms.ios)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">Android</span>
              <span className="text-sm font-medium text-neutral-700">{platforms.android}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${calculatePercentage(platforms.android)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-neutral-700">iPadOS</span>
              <span className="text-sm font-medium text-neutral-700">{platforms.ipados}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-purple-500 h-2.5 rounded-full" 
                style={{ width: `${calculatePercentage(platforms.ipados)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
