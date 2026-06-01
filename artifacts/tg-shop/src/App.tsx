import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Catalog from "@/pages/catalog";
import AccountDetail from "@/pages/account-detail";
import Orders from "@/pages/orders";
import News from "@/pages/news";
import Profile from "@/pages/profile";
import { useRef, useEffect, useState } from "react";

const queryClient = new QueryClient();

function AnimatedRouter() {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState<"idle" | "out" | "in">("idle");
  const prevLocation = useRef(location);

  useEffect(() => {
    if (location === prevLocation.current) return;
    prevLocation.current = location;

    setStage("out");
    const t1 = setTimeout(() => {
      setDisplayLocation(location);
      setStage("in");
    }, 180);
    const t2 = setTimeout(() => setStage("idle"), 360);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location]);

  const style: React.CSSProperties =
    stage === "out"
      ? { opacity: 0, transform: "translateY(8px)", transition: "opacity 0.18s ease, transform 0.18s ease" }
      : stage === "in"
      ? { opacity: 0, transform: "translateY(-8px)" }
      : { opacity: 1, transform: "translateY(0)", transition: "opacity 0.18s ease, transform 0.18s ease" };

  return (
    <div style={style}>
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
