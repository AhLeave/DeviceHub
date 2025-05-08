import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface Tenant {
  id: number;
  name: string;
}

export default function TenantSelector() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    enabled: !!user,
  });
  
  // For demo purposes, find the current tenant
  const currentTenant = tenants.find(t => t.id === user?.tenantId) || { 
    id: user?.tenantId, 
    name: "Acme Corp" 
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="px-4 py-2 relative">
      <div 
        className="bg-primary-600 rounded-lg p-2 cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-primary-500">
              <span className="font-bold">{getInitials(currentTenant.name)}</span>
            </div>
            <span className="font-medium truncate">{currentTenant.name}</span>
          </div>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs`}></i>
        </div>
      </div>
      
      {isOpen && tenants.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg py-1 text-neutral-700">
          {tenants.map(tenant => (
            <div 
              key={tenant.id}
              className="px-3 py-2 hover:bg-neutral-100 cursor-pointer flex items-center space-x-2"
              onClick={() => {
                // In a real app, this would switch the tenant
                setIsOpen(false);
              }}
            >
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 text-xs">
                <span className="font-bold">{getInitials(tenant.name)}</span>
              </div>
              <span className="text-sm">{tenant.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
