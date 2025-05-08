import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DevicesPage from "@/pages/devices-page";
import EnrollmentPage from "@/pages/enrollment-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ThemeProvider attribute="class">
      <TooltipProvider>
        <Toaster />
        <Switch>
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/devices" component={DevicesPage} />
          <ProtectedRoute path="/enrollment" component={EnrollmentPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
