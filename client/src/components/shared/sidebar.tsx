import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import TenantSelector from "./tenant-selector";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "fa-tachometer-alt" },
    { path: "/devices", label: "Devices", icon: "fa-mobile-alt" },
    { path: "/users", label: "Users", icon: "fa-users" },
    { path: "/policies", label: "Policies", icon: "fa-shield-alt" },
    { path: "/enrollment", label: "Enrollment", icon: "fa-plus-circle" },
    { path: "/reports", label: "Reports", icon: "fa-chart-bar" },
    { path: "/settings", label: "Settings", icon: "fa-cog" },
  ];

  const initials = user ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <aside className={cn(
      "bg-primary-500 text-white w-full md:w-64 md:fixed md:h-screen transition-all duration-300 ease-in-out z-30",
      isOpen ? "block" : "hidden md:block"
    )}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="fas fa-mobile-alt text-2xl"></i>
          <h1 className="font-inter font-bold text-xl">DeviceHub MDM</h1>
        </div>
        <button 
          className="md:hidden text-white focus:outline-none" 
          onClick={toggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
      
      <TenantSelector />
      
      <div className="py-4 custom-scrollbar">
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={cn(
                    "flex items-center px-4 py-3 text-white hover:bg-primary-600 transition duration-150",
                    location === item.path && "bg-primary-600 border-l-4 border-white"
                  )}>
                    <i className={`fas ${item.icon} w-5 mr-3`}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-primary-600">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center">
            <span className="text-primary-700 font-bold">{initials}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs opacity-75">{user?.role}</p>
          </div>
          <button 
            className="text-white hover:text-neutral-200"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
