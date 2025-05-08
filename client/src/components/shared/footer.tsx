export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-200 p-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-neutral-500 text-sm">
            &copy; {currentYear} DeviceHub MDM. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0">
            <ul className="flex space-x-4 text-sm">
              <li><a href="#" className="text-neutral-500 hover:text-primary-500">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-primary-500">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-primary-500">Help Center</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
