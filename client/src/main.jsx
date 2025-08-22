import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "../src/components/ui/theme-provider";
import CombinedDashboard from "../src/components/CombinedDashboard.jsx";
import ChartsVisualization from "../src/components/ChartsVisualization.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/finance" element={<CombinedDashboard />} />
          <Route path="/charts" element={<ChartsVisualization />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
