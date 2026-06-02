import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, useRef } from "react";
import NotFound from "@/pages/not-found";
import Catalog from "@/pages/catalog";
import AccountDetail from "@/pages/account-detail";
import Orders from "@/pages/orders";
import News from "@/pages/news";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function AnimatedRouter() {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isVisible, setIsVisible] = useState(true);
  const prevLocation = useRef(location);

  useEffect(() => {
    if (location !== prevLocation.current) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        prevLocation.current = location;
        setIsVisible(true);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.12s ease",
        minHeight: "100%",
        width: "100%",
      }}
    >
      <Switch location={displayLocation}>
        <Route path="/" component={Catalog} />
        <Route path="/account/:id" component={AccountDetail} />
        <Route path="/orders" component={Orders} />
        <Route path="/news" component={News} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AnimatedRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
