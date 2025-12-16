// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import PredictionsPage from "./pages/AquapredictPage";
import HarvestPlannerPage from "./pages/HarvestPlannerPage";
import MarketPage from "./pages/MarketPage";
import EnvironmentPage from "./pages/EnvironmentPage";
import ChatbotPage from "./pages/ChatbotPage";
import "./app.css";

/**
 * ErrorBoundary: shows runtime errors on-screen so app doesn't fail silently.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(error) {
    return { err: error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen p-8 bg-[#0a0f1c] text-white">
          <h2 className="text-2xl font-bold text-rose-300 mb-4">Runtime error — check console</h2>
          <pre className="whitespace-pre-wrap bg-black/70 p-4 rounded text-sm text-yellow-100">
            {String(this.state.err?.message ?? this.state.err)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState("dashboard");

  // page meta state used to render header title/subtitle/lastSaved etc.
  const [pageMeta, setPageMeta] = useState({
    page: "dashboard",
    title: "Dashboard Overview",
    subtitle: "Monitor your aquaculture analytics",
    autoSaved: null,
    actions: {},
  });

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Render page as before
  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage />;
      case "prediction":
        return <PredictionsPage />;
      case "fishpredictor":
        return <HarvestPlannerPage />;
      case "market":
        return <MarketPage />;
      case "environment":
        return <EnvironmentPage />;
      case "chatbot":
        return <ChatbotPage />;
      default:
        return <DashboardPage />;
    }
  };

  // When header buttons are pressed, trigger these handlers.
  // They dispatch window events which pages (Market/AquaPredict/Harvest) already listen for.
  const handleExportCSV = useCallback(() => {
    // Prefer calling page-level callback if it exists via custom event
    window.dispatchEvent(new CustomEvent("export-csv"));
  }, []);

  const handleCopyJSON = useCallback(() => {
    window.dispatchEvent(new CustomEvent("copy-json"));
  }, []);

  const handleToggleNotes = useCallback(() => {
    window.dispatchEvent(new CustomEvent("toggle-notes"));
  }, []);

  // Listen for pages publishing metadata using `page-meta` and updates `page-meta-update`.
  useEffect(() => {
    const onPageMeta = (e) => {
      const detail = e?.detail || {};
      setPageMeta((prev) => ({
        ...prev,
        ...detail,
      }));
      // If page key included, switch page in app (useful for pages that want to route)
      if (detail.page && detail.page !== page) {
        // do not auto-switch if sidebar open or user expecting current page — only switch if it matches
        // but we still update page state so header shows the correct title
        setPage(detail.page);
      }
    };

    const onPageMetaUpdate = (e) => {
      const detail = e?.detail || {};
      setPageMeta((prev) => ({ ...prev, ...detail }));
    };

    window.addEventListener("page-meta", onPageMeta);
    window.addEventListener("page-meta-update", onPageMetaUpdate);

    // Also reflect manual page changes (when user clicks sidebar) by publishing a page-meta request:
    // When App's `page` changes we should reset meta to a simple default until the page emits its own meta.
    return () => {
      window.removeEventListener("page-meta", onPageMeta);
      window.removeEventListener("page-meta-update", onPageMetaUpdate);
    };
  }, [page]);

  // When user navigates via sidebar, clear header meta so the target page has chance to publish its meta.
  useEffect(() => {
    // quick default meta while page mounts
    const defaults = {
      dashboard: { title: "Dashboard Overview", subtitle: "Monitor your aquaculture analytics" },
      prediction: { title: "Fish Prediction", subtitle: "Predict your next fish catch" },
      market: { title: "Market Trends", subtitle: "Track market price forecasts" },
      environment: { title: "Environment Analytics", subtitle: "Analyze sea conditions & tides" },
      chatbot: { title: "AI Chatbot", subtitle: "Your fishing AI assistant" },
      fishpredictor: { title: "Sustainable Harvest Planner", subtitle: "Plan harvests that balance revenue and conservation" },
    }[page] || { title: page, subtitle: "" };

    setPageMeta((prev) => ({ ...prev, page, title: defaults.title, subtitle: defaults.subtitle, autoSaved: null }));
  }, [page]);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar (fixed) */}
      <div className="fixed top-0 left-0 h-full w-64 z-50">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} page={page} setPage={setPage} />
      </div>

      {/* Main content area */}
      <div className="ml-64 flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Pass page meta & handlers into Header */}
        <Header
          toggleSidebar={toggleSidebar}
          page={page}
          onExportCSV={handleExportCSV}
          onCopyJSON={handleCopyJSON}
          onToggleNotes={handleToggleNotes}
          lastSaved={pageMeta.autoSaved}
        />

        {/* Wrap page rendering in ErrorBoundary to surface errors */}
        <main className="flex-1 bg-[#0a0f1c]">
          <ErrorBoundary>{renderPage()}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;
