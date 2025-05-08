import { useQuery } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Link } from "wouter";

interface EnrollmentItemProps {
  device: Device;
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const enrollmentDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - enrollmentDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays} days ago`;
  }
}

function EnrollmentItem({ device }: EnrollmentItemProps) {
  const getPlatformIcon = () => {
    switch (device.platform) {
      case 'ios':
        return 'rounded-lg w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-500';
      case 'android':
        return 'rounded-lg w-8 h-8 flex items-center justify-center bg-green-100 text-green-500';
      case 'ipados':
        return 'rounded-lg w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-500';
      default:
        return 'rounded-lg w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500';
    }
  };
  
  const getDeviceIcon = () => {
    if (device.platform === 'ipados') {
      return 'fas fa-tablet-alt';
    }
    return 'fas fa-mobile-alt';
  };
  
  return (
    <li className="py-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className={getPlatformIcon()}>
          <i className={getDeviceIcon()}></i>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-neutral-800">{device.name || device.model}</p>
          <p className="text-xs text-neutral-500">{device.userId ? 'Assigned User' : 'Unassigned'}</p>
        </div>
      </div>
      <span className="text-xs text-neutral-500">{formatTimeAgo(device.enrollmentDate)}</span>
    </li>
  );
}

export default function RecentEnrollments() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-neutral-200">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="py-3">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-32 mx-auto" />
        </CardFooter>
      </Card>
    );
  }
  
  // Sort devices by enrollment date (newest first)
  const sortedDevices = [...(devices || [])].sort((a, b) => {
    const dateA = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
    const dateB = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
    return dateB - dateA;
  });
  
  // Take the most recent 3 enrollments
  const recentEnrollments = sortedDevices.slice(0, 3);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Enrollments</CardTitle>
      </CardHeader>
      <CardContent>
        {recentEnrollments.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {recentEnrollments.map((device) => (
              <EnrollmentItem key={device.id} device={device} />
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-neutral-500 text-sm">
            No recent enrollments
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/enrollment">
          <a className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            View all enrollments
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
