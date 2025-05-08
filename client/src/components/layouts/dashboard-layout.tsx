import { ReactNode, useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50 text-neutral-900">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="flex-1 md:ml-64 transition-all duration-300 ease-in-out min-h-screen flex flex-col">
        <Header 
          pageTitle={pageTitle} 
          toggleSidebar={toggleSidebar} 
        />
        
        <div className="flex-1 p-4 overflow-auto custom-scrollbar">
          {children}
        </div>
        
        <Footer />
      </main>
    </div>
  );
}
