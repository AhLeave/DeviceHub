import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
}

export default function Header({ pageTitle, toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };
  
  return (
    <header className="bg-white shadow-sm py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            className="text-neutral-600 focus:outline-none p-2"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </Button>
        </div>
        
        <div className="flex-1 md:flex md:justify-between md:items-center">
          <div className="text-xl font-inter font-semibold text-neutral-800 hidden md:block">
            {pageTitle}
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search devices, users..."
                className="py-1.5 pl-8 pr-3 rounded-lg border border-neutral-300 text-sm w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search text-neutral-400 absolute left-3 top-2.5 text-sm"></i>
            </form>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className="relative p-1.5 rounded-full text-neutral-600 hover:bg-neutral-100 focus:outline-none"
              >
                <i className="fas fa-bell"></i>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
              </Button>
              <Button 
                variant="ghost" 
                className="relative p-1.5 rounded-full text-neutral-600 hover:bg-neutral-100 focus:outline-none"
              >
                <i className="fas fa-question-circle"></i>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
