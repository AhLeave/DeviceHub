import { useQuery } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";

export default function ComplianceStatus() {
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
          <div className="flex justify-between items-center mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto mt-2" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <ul className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-4 w-full" />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate compliance percentages
  const total = devices?.length || 0;
  const compliant = devices?.filter(d => d.compliance === "compliant").length || 0;
  const warning = devices?.filter(d => d.compliance === "warning").length || 0;
  const nonCompliant = devices?.filter(d => d.compliance === "non-compliant").length || 0;
  
  const compliantPercentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
  const warningPercentage = total > 0 ? Math.round((warning / total) * 100) : 0;
  const nonCompliantPercentage = total > 0 ? Math.round((nonCompliant / total) * 100) : 0;
  
  // Mock data for compliance issues (in a real app, this would come from the API)
  const complianceIssues = [
    { level: "danger", text: "OS not up to date", count: 4 },
    { level: "warning", text: "Missing required app", count: 12 },
    { level: "warning", text: "Security patch missing", count: 15 }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-success text-success">
              <span className="text-xl font-bold">{compliantPercentage}%</span>
            </div>
            <p className="mt-1 text-sm font-medium">Compliant</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-warning text-warning">
              <span className="text-xl font-bold">{warningPercentage}%</span>
            </div>
            <p className="mt-1 text-sm font-medium">Warning</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-danger text-danger">
              <span className="text-xl font-bold">{nonCompliantPercentage}%</span>
            </div>
            <p className="mt-1 text-sm font-medium">Non-compliant</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium text-neutral-800 mb-2">Top Compliance Issues</h3>
          <ul className="text-sm text-neutral-600 space-y-2">
            {complianceIssues.map((issue, index) => (
              <li key={index} className="flex items-center">
                <i className={`fas fa-circle text-xs text-${issue.level} mr-2`}></i> 
                {issue.text} ({issue.count} devices)
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
