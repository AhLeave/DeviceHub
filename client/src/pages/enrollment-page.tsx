import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EnrollmentToken } from "@shared/schema";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrollmentModal } from "@/components/modals/enrollment-modal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

export default function EnrollmentPage() {
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const { toast } = useToast();
  
  const { data: tokens, isLoading } = useQuery<EnrollmentToken[]>({
    queryKey: ["/api/enrollment/tokens"],
    queryFn: async () => {
      try {
        // Fallback to empty array if API endpoint is not fully implemented
        return [];
      } catch (error) {
        console.error("Error fetching enrollment tokens:", error);
        return [];
      }
    }
  });
  
  const generateQrCode = (token: string) => {
    // In a real app, this would generate a QR code
    return (
      <div className="bg-white p-2 rounded border border-gray-300">
        <div className="text-xs font-mono break-all">{token}</div>
      </div>
    );
  };
  
  const formatExpiryDate = (date: Date | string | null): string => {
    if (!date) return 'Unknown';
    
    const expiryDate = typeof date === 'string' ? new Date(date) : date;
    return expiryDate.toLocaleString();
  };

  const isExpired = (date: Date | string | null): boolean => {
    if (!date) return true;
    
    const expiryDate = typeof date === 'string' ? new Date(date) : date;
    return expiryDate < new Date();
  };
  
  return (
    <>
      <Helmet>
        <title>Device Enrollment | DeviceHub MDM</title>
        <meta name="description" content="Enroll new iOS and Android devices to your DeviceHub MDM system." />
      </Helmet>

      <DashboardLayout pageTitle="Device Enrollment">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Device Enrollment</h1>
            <p className="text-gray-500">Generate enrollment tokens and track enrollment status</p>
          </div>
          <div>
            <Button onClick={() => setShowEnrollmentModal(true)}>
              <i className="fas fa-plus mr-2"></i> New Enrollment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">QR Code Enrollment</CardTitle>
              <CardDescription>
                Generate a QR code that devices can scan to enroll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-qrcode text-5xl text-gray-400"></i>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowEnrollmentModal(true)}
                >
                  Generate QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Email Enrollment</CardTitle>
              <CardDescription>
                Send enrollment links via email to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-envelope text-5xl text-gray-400"></i>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowEnrollmentModal(true)}
                >
                  Send Enrollment Email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Enrollment Stats</CardTitle>
              <CardDescription>
                Device enrollment statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Tokens</span>
                  <span className="font-medium">{tokens?.filter(t => !t.used && !isExpired(t.expiresAt)).length || 0}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Enrollments</span>
                  <span className="font-medium">{tokens?.filter(t => !t.used && !isExpired(t.expiresAt)).length || 0}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: '30%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="font-medium">{tokens?.filter(t => t.used).length || 0}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Tokens</CardTitle>
            <CardDescription>
              Manage and track the status of enrollment tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="used">Used</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <div className="rounded-md border">
                {isLoading ? (
                  <div className="p-4">
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <TabsContent value="active">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>User Email</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tokens && tokens.length > 0 ? (
                          tokens
                            .filter(token => !token.used && !isExpired(token.expiresAt))
                            .map((token) => (
                              <TableRow key={token.id}>
                                <TableCell className="font-mono text-xs">
                                  {token.token.substring(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  {token.platform.charAt(0).toUpperCase() + token.platform.slice(1)}
                                </TableCell>
                                <TableCell>{token.userEmail || 'N/A'}</TableCell>
                                <TableCell>{token.assignedGroup || 'None'}</TableCell>
                                <TableCell>{formatExpiryDate(token.expiresAt)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Active
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-copy"></i>
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-qrcode"></i>
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-envelope"></i>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No active enrollment tokens found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                )}

                <TabsContent value="used">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Used On</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens && tokens.filter(token => token.used).length > 0 ? (
                        tokens
                          .filter(token => token.used)
                          .map((token) => (
                            <TableRow key={token.id}>
                              <TableCell className="font-mono text-xs">
                                {token.token.substring(0, 8)}...
                              </TableCell>
                              <TableCell>
                                {token.platform.charAt(0).toUpperCase() + token.platform.slice(1)}
                              </TableCell>
                              <TableCell>{token.userEmail || 'N/A'}</TableCell>
                              <TableCell>{token.assignedGroup || 'None'}</TableCell>
                              <TableCell>{formatExpiryDate(token.expiresAt)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  Used
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No used enrollment tokens found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="expired">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Expired On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens && tokens.filter(token => !token.used && isExpired(token.expiresAt)).length > 0 ? (
                        tokens
                          .filter(token => !token.used && isExpired(token.expiresAt))
                          .map((token) => (
                            <TableRow key={token.id}>
                              <TableCell className="font-mono text-xs">
                                {token.token.substring(0, 8)}...
                              </TableCell>
                              <TableCell>
                                {token.platform.charAt(0).toUpperCase() + token.platform.slice(1)}
                              </TableCell>
                              <TableCell>{token.userEmail || 'N/A'}</TableCell>
                              <TableCell>{token.assignedGroup || 'None'}</TableCell>
                              <TableCell>{formatExpiryDate(token.expiresAt)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                  Expired
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <i className="fas fa-redo"></i>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No expired enrollment tokens found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens && tokens.length > 0 ? (
                        tokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-mono text-xs">
                              {token.token.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {token.platform.charAt(0).toUpperCase() + token.platform.slice(1)}
                            </TableCell>
                            <TableCell>{token.userEmail || 'N/A'}</TableCell>
                            <TableCell>{token.assignedGroup || 'None'}</TableCell>
                            <TableCell>{formatExpiryDate(token.expiresAt)}</TableCell>
                            <TableCell>
                              {token.used ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  Used
                                </Badge>
                              ) : isExpired(token.expiresAt) ? (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                  Expired
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {!token.used && !isExpired(token.expiresAt) && (
                                  <>
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-copy"></i>
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-qrcode"></i>
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <i className="fas fa-envelope"></i>
                                    </Button>
                                  </>
                                )}
                                {!token.used && isExpired(token.expiresAt) && (
                                  <Button variant="ghost" size="sm">
                                    <i className="fas fa-redo"></i>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No enrollment tokens found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enrollment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">iOS Enrollment</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Open the Camera app on your iOS device</li>
                  <li>Scan the QR code generated from the MDM portal</li>
                  <li>Tap the notification that appears</li>
                  <li>Follow the on-screen instructions to install the MDM profile</li>
                  <li>Accept all permissions when prompted</li>
                  <li>Complete the setup by entering your company credentials if required</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Android Enrollment</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Open the email with enrollment link on your Android device</li>
                  <li>Tap the enrollment link or scan the QR code</li>
                  <li>Download and install the DeviceHub MDM Agent app</li>
                  <li>Open the app and follow the enrollment instructions</li>
                  <li>Accept all permission requests</li>
                  <li>Complete the setup by entering your company credentials if required</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <EnrollmentModal
          isOpen={showEnrollmentModal}
          onClose={() => setShowEnrollmentModal(false)}
        />
      </DashboardLayout>
    </>
  );
}
