import { useState } from "react";
import { Link2, Eye, Layers, Sparkles, AlertCircle, Terminal, RefreshCw, Github } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import UrlSequenceGenerator from "./components/UrlSequenceGenerator";
import IframeExtractor from "./components/IframeExtractor";
import EpisodeCsvBuilder from "./components/EpisodeCsvBuilder";

export default function App() {
  const [activeTab, setActiveTab] = useState<"sequence" | "extractor" | "csv" | "pipeline">("pipeline");
  
  // State pipeline to automatically flow data from one tool to the next
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [extractedIframes, setExtractedIframes] = useState<string[]>([]);

  const handleUrlsGenerated = (urls: string[]) => {
    setGeneratedUrls(urls);
    // Auto flow to extractor tab if they are in individual tabs mode
    if (activeTab === "sequence") {
      setActiveTab("extractor");
    }
  };

  const handleIframesExtracted = (iframes: string[]) => {
    setExtractedIframes(iframes);
    // Auto flow to CSV builder tab if they are in individual tabs mode
    if (activeTab === "extractor") {
      setActiveTab("csv");
    }
  };

  const handleResetAll = () => {
    setGeneratedUrls([]);
    setExtractedIframes([]);
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-display font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/15">
                AP
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2">
                Anime Publisher Tools Suite
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Standardized automation tools for episode sequence expansion and bulk WordPress imports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-reset-all"
              onClick={handleResetAll}
              className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-slate-700/80 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Workspace
            </button>
            <div className="text-[11px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>v1.2.0 - LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-2">
          <div className="flex flex-wrap gap-2">
            <button
              id="tab-pipeline"
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "pipeline"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Workflow Pipeline
            </button>

            <button
              id="tab-sequence"
              onClick={() => setActiveTab("sequence")}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "sequence"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Link2 className="h-4 w-4" />
              1. URL Sequence
            </button>

            <button
              id="tab-extractor"
              onClick={() => setActiveTab("extractor")}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "extractor"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Eye className="h-4 w-4" />
              2. Iframe Extractor
            </button>

            <button
              id="tab-csv"
              onClick={() => setActiveTab("csv")}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-display transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "csv"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Layers className="h-4 w-4" />
              3. Episode CSV Builder
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 px-3.5 py-1.5 rounded-lg border border-slate-800/80">
            <AlertCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>State Synchronizer is active. Data flows automatically from Step 1 to Step 3.</span>
          </div>
        </div>

        {/* Dynamic Workspace Container */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "pipeline" && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Step 1: Sequence expansion */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold tracking-wider text-emerald-400 font-mono uppercase bg-emerald-500/5 border border-emerald-500/10 py-1 px-2.5 rounded-md">
                      Step 1
                    </span>
                    {generatedUrls.length > 0 && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        Active ({generatedUrls.length} URLs)
                      </span>
                    )}
                  </div>
                  <UrlSequenceGenerator onUrlsGenerated={handleUrlsGenerated} />
                </div>

                {/* Step 2: Iframe extraction */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold tracking-wider text-emerald-400 font-mono uppercase bg-emerald-500/5 border border-emerald-500/10 py-1 px-2.5 rounded-md">
                      Step 2
                    </span>
                    {extractedIframes.length > 0 && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        Scraped ({extractedIframes.length} Players)
                      </span>
                    )}
                  </div>
                  <IframeExtractor
                    initialUrls={generatedUrls}
                    onIframesExtracted={handleIframesExtracted}
                  />
                </div>

                {/* Step 3: CSV builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold tracking-wider text-emerald-400 font-mono uppercase bg-emerald-500/5 border border-emerald-500/10 py-1 px-2.5 rounded-md">
                      Step 3
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Ready for download</span>
                  </div>
                  <EpisodeCsvBuilder initialVideoLinks={extractedIframes} />
                </div>
              </motion.div>
            )}

            {activeTab === "sequence" && (
              <motion.div
                key="sequence"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <UrlSequenceGenerator onUrlsGenerated={handleUrlsGenerated} />
              </motion.div>
            )}

            {activeTab === "extractor" && (
              <motion.div
                key="extractor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <IframeExtractor
                  initialUrls={generatedUrls}
                  onIframesExtracted={handleIframesExtracted}
                />
              </motion.div>
            )}

            {activeTab === "csv" && (
              <motion.div
                key="csv"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <EpisodeCsvBuilder initialVideoLinks={extractedIframes} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Anime Publisher Tools Suite. Optimized for premium web extraction and bulk imports.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Sandbox Verified</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer font-mono">No telemetry - 100% Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
