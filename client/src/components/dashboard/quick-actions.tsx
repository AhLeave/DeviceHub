import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { EnrollmentModal } from "@/components/modals/enrollment-modal";

export default function QuickActions() {
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  
  const quickActions = [
    {
      title: "Enroll Device",
      icon: "fa-qrcode",
      color: "primary",
      onClick: () => setShowEnrollmentModal(true)
    },
    {
      title: "Security Scan",
      icon: "fa-shield-alt",
      color: "green",
      onClick: () => console.log("Security scan")
    },
    {
      title: "Send Alert",
      icon: "fa-bell",
      color: "purple",
      onClick: () => console.log("Send alert")
    },
    {
      title: "Deploy App",
      icon: "fa-download",
      color: "blue",
      onClick: () => console.log("Deploy app")
    },
    {
      title: "Export Data",
      icon: "fa-file-export",
      color: "yellow",
      onClick: () => console.log("Export data")
    }
  ];
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors"
                onClick={action.onClick}
              >
                <div className={`w-12 h-12 rounded-full bg-${action.color}-100 text-${action.color}-500 flex items-center justify-center mb-2`}>
                  <i className={`fas ${action.icon} text-xl`}></i>
                </div>
                <span className="text-sm font-medium text-neutral-800">{action.title}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <EnrollmentModal 
        isOpen={showEnrollmentModal} 
        onClose={() => setShowEnrollmentModal(false)} 
      />
    </>
  );
}
