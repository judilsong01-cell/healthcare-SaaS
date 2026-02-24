import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { initializeMonitoring } from "./services/monitoring";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import AuthPage from "./pages/AuthPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientFiles from "./pages/PatientFiles";
import DoctorFiles from "./pages/DoctorFiles";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/auth"} component={AuthPage} />
      <Route path={"/auth/login"} component={AuthPage} />
      <Route path={"/auth/signup"} component={AuthPage} />
      <Route path={"/dashboard/patient"} component={PatientDashboard} />
      <Route path={"/dashboard/doctor"} component={DoctorDashboard} />
      <Route path={"/files/patient"} component={PatientFiles} />
      <Route path={"/files/doctor"} component={DoctorFiles} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    // Inicializar monitoramento
    initializeMonitoring({
      enabled: true,
      environment: (process.env.NODE_ENV as any) || "development",
      batchSize: 10,
      flushInterval: 30000,
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <DashboardProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DashboardProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
