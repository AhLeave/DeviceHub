import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { RemoteControlModal } from "@/components/modals/remote-control-modal";

export default function DeviceTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showRemoteControl, setShowRemoteControl] = useState(false);
  const pageSize = 4;
  
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });
  
  const handleRemoteControl = (device: Device) => {
    setSelectedDevice(device);
    setShowRemoteControl(true);
  };
  
  const closeRemoteControl = () => {
    setShowRemoteControl(false);
    setSelectedDevice(null);
  };
  
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader className="border-b border-neutral-200 flex justify-between items-center">
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {[...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  const sortedDevices = [...(devices || [])].sort((a, b) => {
    const dateA = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
    const dateB = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
    return dateB - dateA;
  });
  
  const totalPages = Math.ceil(sortedDevices.length / pageSize);
  const paginatedDevices = sortedDevices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const formatTimeAgo = (date: Date | string | null): string => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const lastSeen = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / (60 * 24))} days ago`;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
      case 'offline':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800';
      case 'warning':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
      default:
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
        return <i className="fab fa-apple mr-2 text-neutral-700"></i>;
      case 'android':
        return <i className="fab fa-android mr-2 text-green-600"></i>;
      case 'ipados':
        return <i className="fab fa-apple mr-2 text-neutral-700"></i>;
      default:
        return <i className="fas fa-mobile-alt mr-2 text-neutral-700"></i>;
    }
  };
  
  const getDeviceTypeIcon = (platform: string) => {
    if (platform === 'ipados') {
      return 'fas fa-tablet-alt';
    }
    return 'fas fa-mobile-alt';
  };
  
  const getDeviceIconClass = (platform: string) => {
    switch (platform) {
      case 'ios':
        return 'flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500';
      case 'android':
        return 'flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center text-green-500';
      case 'ipados':
        return 'flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500';
      default:
        return 'flex-shrink-0 h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-500';
    }
  };
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader className="border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Recent Device Activity</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export <i className="fas fa-download ml-1 text-xs"></i>
            </Button>
            <Button size="sm">
              Refresh <i className="fas fa-sync-alt ml-1 text-xs"></i>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Device</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Last Seen</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {paginatedDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={getDeviceIconClass(device.platform)}>
                          <i className={getDeviceTypeIcon(device.platform)}></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{device.name}</div>
                          <div className="text-xs text-neutral-500">ID: {device.deviceId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">Assigned User</div>
                      <div className="text-xs text-neutral-500">Department</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPlatformIcon(device.platform)}
                        <span className="text-sm text-neutral-900">{device.platform.charAt(0).toUpperCase() + device.platform.slice(1)} {device.osVersion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(device.status)}>
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatTimeAgo(device.lastSeen)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className={device.status === 'online' ? "text-primary-500 hover:text-primary-700" : "text-neutral-400 cursor-not-allowed"} 
                          title="Remote Control"
                          onClick={() => device.status === 'online' && handleRemoteControl(device)}
                          disabled={device.status !== 'online'}
                        >
                          <i className="fas fa-desktop"></i>
                        </button>
                        <button className="text-info hover:text-blue-700" title="View Details">
                          <i className="fas fa-info-circle"></i>
                        </button>
                        <button className="text-neutral-500 hover:text-neutral-700" title="More Options">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-sm text-neutral-700">
            <p>Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, sortedDevices.length)}</span> of <span className="font-medium">{sortedDevices.length}</span> devices</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left text-xs mr-1"></i> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <i className="fas fa-chevron-right text-xs ml-1"></i>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {showRemoteControl && selectedDevice && (
        <RemoteControlModal 
          device={selectedDevice} 
          isOpen={showRemoteControl} 
          onClose={closeRemoteControl} 
        />
      )}
    </>
  );
}
