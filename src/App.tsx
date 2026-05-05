import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import News from "./pages/News";
import Contests from "./pages/Contests";
import Votes from "./pages/Votes";
import Requests from "./pages/Requests";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import Battles from "./pages/Battles";
import AdminBattles from "./pages/AdminBattles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/news" element={<News />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/votes" element={<Votes />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/battles" element={<Battles />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
          </Route>
          <Route path="/admin/battles" element={<AdminBattles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;