import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RemoteControlModal } from "@/components/modals/remote-control-modal";
import { EnrollmentModal } from "@/components/modals/enrollment-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { Helmet } from "react-helmet";

export default function DevicesPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showRemoteControl, setShowRemoteControl] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const { status, connect } = useWebSocket();
  
  // Ensure websocket connection
  if (status !== 'connected') {
    connect();
  }

  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const handleRemoteControl = (device: Device) => {
    setSelectedDevice(device);
    setShowRemoteControl(true);
  };

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
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Online</Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Offline</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
    }
  };

  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case 'compliant':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Compliant</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
      case 'non-compliant':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Non-compliant</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unknown</Badge>;
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

  // Filter devices based on search query and filters
  const filteredDevices = devices?.filter(device => {
    const matchesSearch = 
      searchQuery === "" || 
      device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.osVersion?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || device.platform === platformFilter;
    const matchesTab = selectedTab === "all" || 
      (selectedTab === "online" && device.status === "online") ||
      (selectedTab === "offline" && device.status === "offline") ||
      (selectedTab === "issues" && (device.status === "warning" || device.compliance === "warning" || device.compliance === "non-compliant"));
    
    return matchesSearch && matchesStatus && matchesPlatform && matchesTab;
  }) || [];

  return (
    <>
      <Helmet>
        <title>Devices | DeviceHub MDM</title>
        <meta name="description" content="Manage and monitor all your iOS and Android devices in one central dashboard with DeviceHub MDM." />
      </Helmet>

      <DashboardLayout pageTitle="Devices">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Device Management</h1>
            <p className="text-gray-500">Manage and monitor all your mobile devices</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowEnrollmentModal(true)}>
              <i className="fas fa-plus mr-2"></i> Enroll Device
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Device Inventory</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-auto"
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setSearchQuery("")}
                  >
                    {searchQuery ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                  </button>
                </div>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="ipados">iPadOS</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Devices</TabsTrigger>
                <TabsTrigger value="online">Online</TabsTrigger>
                <TabsTrigger value="offline">Offline</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
              </TabsList>

              <div className="rounded-md border">
                {isLoading ? (
                  <div className="p-4">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDevices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            {searchQuery || statusFilter !== "all" || platformFilter !== "all" ? 
                              "No devices match your search criteria" : 
                              "No devices found. Enroll a device to get started."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDevices.map((device) => (
                          <TableRow key={device.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                                  {device.platform === 'ipados' ? 
                                    <i className="fas fa-tablet-alt"></i> : 
                                    <i className="fas fa-mobile-alt"></i>
                                  }
                                </div>
                                <div>
                                  <div className="font-medium">{device.name || device.model}</div>
                                  <div className="text-xs text-gray-500">ID: {device.deviceId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getPlatformIcon(device.platform)}
                                <span>{device.platform.charAt(0).toUpperCase() + device.platform.slice(1)} {device.osVersion}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(device.status)}</TableCell>
                            <TableCell>{getComplianceBadge(device.compliance)}</TableCell>
                            <TableCell>{formatTimeAgo(device.lastSeen)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  disabled={device.status !== 'online'}
                                  onClick={() => handleRemoteControl(device)}
                                >
                                  <i className="fas fa-desktop"></i>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-ellipsis-v"></i>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <i className="fas fa-info-circle mr-2"></i> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <i className="fas fa-download mr-2"></i> Install App
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <i className="fas fa-shield-alt mr-2"></i> Security Scan
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <i className="fas fa-trash-alt mr-2"></i> Remove Device
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredDevices.length} of {devices?.length || 0} devices
            </div>
            {/* Pagination would go here in a real app */}
          </CardFooter>
        </Card>

        {selectedDevice && (
          <RemoteControlModal
            device={selectedDevice}
            isOpen={showRemoteControl}
            onClose={() => setShowRemoteControl(false)}
          />
        )}

        <EnrollmentModal
          isOpen={showEnrollmentModal}
          onClose={() => setShowEnrollmentModal(false)}
        />
      </DashboardLayout>
    </>
  );
}
