import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddArtwork from "./pages/AddArtwork";
import ArtworkDetails from "./pages/ArtworkDetails";
import Transactions from "./pages/Transactions";
import Consignments from "./pages/Consignments";
import Reports from "./pages/Reports";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<AddArtwork />} />
            <Route path="/inventory/:id" element={<ArtworkDetails />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/consignments" element={<Consignments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
