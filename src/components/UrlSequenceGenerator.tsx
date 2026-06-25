import { useState } from "react";
import { Link2, Sparkles, Copy, Check, Info } from "lucide-react";
import { motion } from "motion/react";

interface UrlSequenceGeneratorProps {
  onUrlsGenerated: (urls: string[]) => void;
}

export default function UrlSequenceGenerator({ onUrlsGenerated }: UrlSequenceGeneratorProps) {
  const [template, setTemplate] = useState(
    "https://toonstream.co/episode/ben-10-alien-force-1x[1,13]/"
  );
  const [generated, setGenerated] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    // Check if bracket syntax is used: [start,end]
    const bracketRegex = /\[(\d+)\s*,\s*(\d+)\]/;
    const match = template.match(bracketRegex);

    if (match) {
      const startNum = parseInt(match[1], 10);
      const endNum = parseInt(match[2], 10);
      const results: string[] = [];

      const start = Math.min(startNum, endNum);
      const end = Math.max(startNum, endNum);

      for (let i = start; i <= end; i++) {
        results.push(template.replace(bracketRegex, String(i)));
      }

      setGenerated(results);
      onUrlsGenerated(results);
    } else {
      // Fallback: If no bracket syntax is found, check if it ends with digit-like string
      // or try to find any single digit to replace or duplicate
      const numRegex = /(\d+)(?!.*\d)/; // last number
      const numMatch = template.match(numRegex);
      if (numMatch) {
        const lastNum = parseInt(numMatch[1], 10);
        const results: string[] = [];
        // Generate a 12-episode sequence by default if template is basic
        for (let i = 1; i <= 13; i++) {
          results.push(template.replace(numRegex, String(i)));
        }
        setGenerated(results);
        onUrlsGenerated(results);
      } else {
        // Just return the template
        setGenerated([template]);
        onUrlsGenerated([template]);
      }
    }
  };

  const handleCopy = () => {
    if (generated.length === 0) return;
    navigator.clipboard.writeText(generated.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="url-sequence-generator-card" className="bg-brand-card rounded-xl border border-slate-700/60 p-6 glow-effect">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Link2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100">
            URL Sequence Generator
          </h2>
          <p className="text-xs text-slate-400">
            Expand template strings with bracket placeholders into lists of links
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Enter Base template URL</span>
            <span className="text-slate-500 font-normal">Use [start,end] to define range</span>
          </label>
          <div className="relative">
            <input
              id="template-url-input"
              type="text"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="e.g., https://toonstream.co/episode/ben-10-alien-force-1x[1,13]/"
              className="w-full font-mono text-sm bg-slate-900 border border-slate-700/80 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-all focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800 flex gap-2.5 items-start text-xs text-slate-400">
          <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Specify the sequence range in brackets, for example:{" "}
            <code className="text-emerald-400 font-mono bg-slate-950 px-1 rounded">1x[1,13]</code> will expand into 13 separate URLs from 
            <code className="text-slate-300 font-mono"> 1x1 </code> to <code className="text-slate-300 font-mono"> 1x13</code>.
          </div>
        </div>

        <div className="flex gap-3">
          <button
            id="btn-generate-sequence"
            onClick={handleGenerate}
            className="flex-1 font-display font-medium bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 glow-btn cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-slate-950" />
            Generate URLs
          </button>

          {generated.length > 0 && (
            <button
              id="btn-copy-urls"
              onClick={handleCopy}
              className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/80 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              title="Copy All Generated Links"
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

        {generated.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mt-2"
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-medium text-slate-400">
                Generated Links ({generated.length})
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1.5 custom-scrollbar">
              {generated.map((url, index) => (
                <div key={index} className="truncate hover:text-emerald-400 transition-colors">
                  {url}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
