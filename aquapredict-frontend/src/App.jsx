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

/* ======================================================
   Error Boundary — keeps app alive on runtime crashes
====================================================== */
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
        <div className="h-screen flex items-center justify-center bg-[#020617] text-white p-8">
          <div className="max-w-xl w-full">
            <h2 className="text-2xl font-bold text-rose-400 mb-4">
              Runtime error — check console
            </h2>
            <pre className="whitespace-pre-wrap bg-black/70 p-4 rounded text-sm text-yellow-100">
              {String(this.state.err?.message ?? this.state.err)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ======================================================
   Main App
====================================================== */
function App() {
  /* ---------------- Sidebar State ---------------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);        // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop
  const [page, setPage] = useState("dashboard");

  /* ---------------- Header Meta ---------------- */
  const [pageMeta, setPageMeta] = useState({
    page: "dashboard",
    title: "Dashboard Overview",
    subtitle: "Monitor your aquaculture analytics",
    autoSaved: null,
    actions: {},
  });

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  /* ---------------- Page Renderer ---------------- */
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

  /* ---------------- Header Action Bridges ---------------- */
  const handleExportCSV = useCallback(() => {
    window.dispatchEvent(new CustomEvent("export-csv"));
  }, []);

  const handleCopyJSON = useCallback(() => {
    window.dispatchEvent(new CustomEvent("copy-json"));
  }, []);

  const handleToggleNotes = useCallback(() => {
    window.dispatchEvent(new CustomEvent("toggle-notes"));
  }, []);

  /* ---------------- Page Meta Sync ---------------- */
  useEffect(() => {
    const onPageMeta = (e) => {
      const detail = e?.detail || {};
      setPageMeta((prev) => ({ ...prev, ...detail }));
      if (detail.page && detail.page !== page) {
        setPage(detail.page);
      }
    };

    const onPageMetaUpdate = (e) => {
      const detail = e?.detail || {};
      setPageMeta((prev) => ({ ...prev, ...detail }));
    };

    window.addEventListener("page-meta", onPageMeta);
    window.addEventListener("page-meta-update", onPageMetaUpdate);

    return () => {
      window.removeEventListener("page-meta", onPageMeta);
      window.removeEventListener("page-meta-update", onPageMetaUpdate);
    };
  }, [page]);

  /* ---------------- Default Header Meta ---------------- */
  useEffect(() => {
    const defaults = {
      dashboard: {
        title: "Dashboard Overview",
        subtitle: "Monitor your aquaculture analytics",
      },
      prediction: {
        title: "Fish Prediction",
        subtitle: "Predict your next fish catch",
      },
      market: {
        title: "Market Trends",
        subtitle: "Track market price forecasts",
      },
      environment: {
        title: "Environment Analytics",
        subtitle: "Analyze sea conditions & tides",
      },
      chatbot: {
        title: "AI Chatbot",
        subtitle: "Your fishing AI assistant",
      },
      fishpredictor: {
        title: "Sustainable Harvest Planner",
        subtitle: "Balance revenue & conservation",
      },
    }[page];

    if (defaults) {
      setPageMeta((prev) => ({
        ...prev,
        page,
        title: defaults.title,
        subtitle: defaults.subtitle,
        autoSaved: null,
      }));
    }
  }, [page]);

  /* ======================================================
     LAYOUT — SIDEBAR STATIC, CONTENT SCROLLS
  ====================================================== */
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020617] text-white">
      
      {/* ===== Sidebar (STATIC) ===== */}
      <div className="shrink-0 h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          page={page}
          setPage={setPage}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* ===== Main Column ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header (Sticky by layout, not CSS hacks) */}
        <Header
          toggleSidebar={toggleSidebar}
          page={page}
          onExportCSV={handleExportCSV}
          onCopyJSON={handleCopyJSON}
          onToggleNotes={handleToggleNotes}
          lastSaved={pageMeta.autoSaved}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0a0f1c]">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;
