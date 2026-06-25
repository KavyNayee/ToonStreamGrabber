import { useState, useEffect } from "react";
import { Download, Play, Copy, Check, Eye, Loader2, ListChecks, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface IframeExtractorProps {
  initialUrls?: string[];
  onIframesExtracted: (iframes: string[]) => void;
}

export default function IframeExtractor({ initialUrls = [], onIframesExtracted }: IframeExtractorProps) {
  const [inputText, setInputText] = useState("");
  const [extracted, setExtracted] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<{ url: string; status: "success" | "failed" | "pending" }[]>([]);

  // Update input text if we get initial URLs from Step 1
  useEffect(() => {
    if (initialUrls.length > 0) {
      setInputText(initialUrls.join("\n"));
    }
  }, [initialUrls]);

  const handleExtract = async () => {
    const urls = inputText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) return;

    setIsExtracting(true);
    setExtracted([]);
    setProgress(0);
    setLogs(urls.map((url) => ({ url, status: "pending" })));

    try {
      // Let's divide into smaller chunks or process them step-by-step
      // to give the user a live streaming updates feel
      const results: string[] = [];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        setCurrentUrl(url);
        setProgress(Math.round(((i) / urls.length) * 100));

        try {
          const res = await fetch("/api/extract-iframes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: [url] }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.iframes && data.iframes.length > 0) {
              results.push(data.iframes[0]);
              setLogs((prev) =>
                prev.map((log, idx) => (idx === i ? { ...log, status: "success" } : log))
              );
            } else {
              results.push(`// No iframe found for: ${url}`);
              setLogs((prev) =>
                prev.map((log, idx) => (idx === i ? { ...log, status: "failed" } : log))
              );
            }
          } else {
            results.push(`// Extraction failed for: ${url}`);
            setLogs((prev) =>
              prev.map((log, idx) => (idx === i ? { ...log, status: "failed" } : log))
            );
          }
        } catch {
          results.push(`// Request error for: ${url}`);
          setLogs((prev) =>
            prev.map((log, idx) => (idx === i ? { ...log, status: "failed" } : log))
          );
        }

        // Add a slight throttle delay to simulate processing and avoid slamming the server
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setProgress(100);
      setExtracted(results);
      onIframesExtracted(results);
    } catch (error) {
      console.error("Error during extraction:", error);
    } finally {
      setIsExtracting(false);
      setCurrentUrl("");
    }
  };

  const handleCopy = () => {
    if (extracted.length === 0) return;
    navigator.clipboard.writeText(extracted.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="iframe-extractor-card" className="bg-brand-card rounded-xl border border-slate-700/60 p-6 glow-effect">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100">
            Extract Multiple Iframe URLs
          </h2>
          <p className="text-xs text-slate-400">
            Scrape player embed sources from ToonStream or custom portal lists
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex justify-between items-center">
            <span>Paste Episode URLs (one per line)</span>
            <span className="text-slate-500 font-normal">Auto-populated from Step 1</span>
          </label>
          <textarea
            id="urls-input-textarea"
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="https://toonstream.co/episode/ben-10-alien-force-1x1/&#10;https://toonstream.co/episode/ben-10-alien-force-1x2/"
            className="w-full font-mono text-xs bg-slate-900 border border-slate-700/80 rounded-lg p-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 transition-all focus:ring-1 focus:ring-emerald-500/20 leading-relaxed custom-scrollbar"
          />
        </div>

        <div className="flex gap-3">
          <button
            id="btn-extract-iframes"
            onClick={handleExtract}
            disabled={isExtracting || !inputText.trim()}
            className="flex-1 font-display font-medium bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed text-slate-950 py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 glow-btn cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                Scraping Iframes ({progress}%)
              </>
            ) : (
              <>
                <Play className="h-4 w-4 text-slate-950" />
                Extract Iframes
              </>
            )}
          </button>

          {extracted.length > 0 && (
            <button
              id="btn-copy-extracted-iframes"
              onClick={handleCopy}
              className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/80 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              title="Copy All Extracted Links"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">Copy All</span>
                </>
              )}
            </button>
          )}
        </div>

        {isExtracting && (
          <div className="space-y-2.5 bg-slate-900/80 rounded-lg p-3.5 border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-medium truncate">
                {currentUrl ? `Scraping: ${new URL(currentUrl).pathname}` : "Preparing requests..."}
              </span>
              <span className="font-mono text-emerald-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <ListChecks className="h-3.5 w-3.5 text-emerald-400" />
                Real-time Scraper Monitor
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto bg-slate-950 border border-slate-900 rounded-lg p-2.5 font-mono text-[11px] leading-relaxed space-y-1 custom-scrollbar">
              {logs.map((log, index) => (
                <div key={index} className="flex justify-between items-center border-b border-slate-900/60 pb-1 last:border-0">
                  <span className="text-slate-400 truncate max-w-[280px] md:max-w-md">
                    {log.url}
                  </span>
                  {log.status === "success" && (
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                      SUCCESS
                    </span>
                  )}
                  {log.status === "failed" && (
                    <span className="text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]">
                      FAILED
                    </span>
                  )}
                  {log.status === "pending" && (
                    <span className="text-yellow-400 font-semibold bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                      WAITING
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {extracted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mt-2"
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-medium text-slate-400">
                Extracted Players ({extracted.length})
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1.5 custom-scrollbar">
              {extracted.map((iframeUrl, index) => (
                <div key={index} className="truncate text-slate-300 select-all hover:text-emerald-300">
                  {iframeUrl}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
