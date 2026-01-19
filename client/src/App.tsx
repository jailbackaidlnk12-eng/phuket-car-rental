import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Dashboard from "@/pages/Dashboard";
import Payments from "@/pages/Payments";
import AdminDashboard from "@/pages/AdminDashboard";
import IdCardVerification from "@/pages/IdCardVerification";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CannabisShop from "@/pages/CannabisShop";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/products"} component={Products} />
      <Route path={"/products/:id"} component={ProductDetail} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/payments"} component={Payments} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/id-verification"} component={IdCardVerification} />
      <Route path={"/cannabis"} component={CannabisShop} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
