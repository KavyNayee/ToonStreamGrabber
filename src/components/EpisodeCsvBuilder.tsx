import { useState, useEffect } from "react";
import { 
  FileDown, 
  Calendar, 
  Layers, 
  Type, 
  Hash, 
  ListPlus, 
  Film, 
  Info, 
  RefreshCw, 
  Settings, 
  Database, 
  Check, 
  Trash2, 
  Plus, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";

interface EpisodeCsvBuilderProps {
  initialVideoLinks?: string[];
}

interface EpisodeData {
  id: string;
  anime: string;
  title: string;
  number: number;
  released: string;
  video: string;
  type: string;
  host: string;
  status: string;
  thumbnail: string;
  download_res: string;
  download_host: string;
  download_url: string;
}

export default function EpisodeCsvBuilder({ initialVideoLinks = [] }: EpisodeCsvBuilderProps) {
  // Bulk Configurations
  const [activeConfigTab, setActiveConfigTab] = useState<"basic" | "players" | "downloads">("basic");
  const [animeName, setAnimeName] = useState("Overlord");
  const [titlePattern, setTitlePattern] = useState("Title to show");
  const [startEpisode, setStartEpisode] = useState(1);
  const [numEpisodes, setNumEpisodes] = useState(12);
  const [releasedDate, setReleasedDate] = useState("2023-10-31"); // Default date matching the Google Sheet example
  const [onlyDateOnFirst, setOnlyDateOnFirst] = useState(true); // Matches sheet where only the first row has date
  
  // Players bulk configs
  const [videoLinksText, setVideoLinksText] = useState("");
  const [defaultType, setDefaultType] = useState("sub;sub");
  const [defaultHost, setDefaultHost] = useState("YT1;YT2");
  const [defaultStatus, setDefaultStatus] = useState("publish");
  const [defaultThumbnail, setDefaultThumbnail] = useState("");

  // Downloads bulk configs
  const [downloadRes, setDownloadRes] = useState("720;720;720;1080");
  const [downloadHost, setDownloadHost] = useState("host_720_1;host_720_2;host_720_3;host_1080_1");
  const [downloadUrlsText, setDownloadUrlsText] = useState("");

  // Table Episode State
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncedState, setLastSyncedState] = useState("");

  // Sync if links are extracted from step 2
  useEffect(() => {
    if (initialVideoLinks.length > 0) {
      setVideoLinksText(initialVideoLinks.join("\n"));
      setNumEpisodes(initialVideoLinks.length);
      setAutoSync(true);
    }
  }, [initialVideoLinks]);

  // Format YYYY-MM-DD to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  // Helper to generate full list from current bulk parameters
  const getGeneratedEpisodes = () => {
    const videoLines = videoLinksText.split("\n").map(l => l.trim());
    const downloadLines = downloadUrlsText.split("\n").map(l => l.trim());
    const count = Math.max(numEpisodes, videoLines.filter(l => l.length > 0).length, downloadLines.filter(l => l.length > 0).length, 1);
    
    const list: EpisodeData[] = [];
    for (let i = 0; i < count; i++) {
      const epNum = startEpisode + i;
      
      // Mimic the title behavior or title pattern
      let epTitle = `${titlePattern}`;
      if (count > 1) {
        // If there are multiple, title could be formatted or customized
        // In the sheet, titles are custom strings like "Title to show", "This is not", "the post title", "but", "the episode"
        // We can fallback to "Title Pattern + Episode #" if they don't specify custom ones, or let them keep title pattern
        if (titlePattern.toLowerCase().includes("episode") || titlePattern.toLowerCase().includes("season")) {
          epTitle = `${titlePattern} ${epNum}`;
        } else {
          // If title pattern is just a phrase, we can append a number or keep as is.
          // Let's make it `{titlePattern} ${epNum}` if it has a placeholder, or just `{titlePattern}` for first, and append number for rest unless they customize.
          epTitle = i === 0 ? titlePattern : `${titlePattern} ${epNum}`;
        }
      }

      // Date only on first episode by default (matches user sheet format)
      let epReleased = "";
      if (i === 0 || !onlyDateOnFirst) {
        epReleased = formatDateToDDMMYYYY(releasedDate);
      }

      // Semicolon separated items
      const video = videoLines[i] || "video_url1;video_url2";
      const type = defaultType;
      const host = defaultHost;
      
      // Status formatting (First few publish, then future or draft like sheet example)
      let epStatus = defaultStatus;
      if (defaultStatus === "publish" && count >= 12) {
        if (i === count - 2) epStatus = "future";
        else if (i === count - 1) epStatus = "draft";
      }

      list.push({
        id: `ep-${i}-${Date.now()}`,
        anime: animeName,
        title: epTitle,
        number: epNum,
        released: epReleased,
        video: video,
        type: type,
        host: host,
        status: epStatus,
        thumbnail: defaultThumbnail,
        download_res: downloadRes,
        download_host: downloadHost,
        download_url: downloadLines[i] || "url_720_1;url_720_2;url_720_3;url_1080_1",
      });
    }
    return list;
  };

  // Generate / Sync Table when inputs change in autoSync mode
  useEffect(() => {
    if (autoSync) {
      const newStateString = JSON.stringify({
        animeName,
        titlePattern,
        startEpisode,
        numEpisodes,
        releasedDate,
        onlyDateOnFirst,
        videoLinksText,
        defaultType,
        defaultHost,
        defaultStatus,
        defaultThumbnail,
        downloadRes,
        downloadHost,
        downloadUrlsText
      });

      if (newStateString !== lastSyncedState) {
        setEpisodes(getGeneratedEpisodes());
        setLastSyncedState(newStateString);
      }
    }
  }, [
    autoSync,
    animeName,
    titlePattern,
    startEpisode,
    numEpisodes,
    releasedDate,
    onlyDateOnFirst,
    videoLinksText,
    defaultType,
    defaultHost,
    defaultStatus,
    defaultThumbnail,
    downloadRes,
    downloadHost,
    downloadUrlsText
  ]);

  // Handle manual edits to cells
  const handleCellChange = (id: string, field: keyof EpisodeData, value: string | number) => {
    setAutoSync(false); // Stop auto overwrite
    setEpisodes(prev => prev.map(ep => {
      if (ep.id === id) {
        return { ...ep, [field]: value };
      }
      return ep;
    }));
  };

  // Add empty row
  const handleAddRow = () => {
    setAutoSync(false);
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map(e => e.number)) + 1 : startEpisode;
    const newEp: EpisodeData = {
      id: `manual-ep-${Date.now()}`,
      anime: animeName,
      title: `${titlePattern} ${nextNum}`,
      number: nextNum,
      released: "",
      video: "",
      type: defaultType,
      host: defaultHost,
      status: defaultStatus,
      thumbnail: "",
      download_res: downloadRes,
      download_host: downloadHost,
      download_url: "",
    };
    setEpisodes([...episodes, newEp]);
  };

  // Remove row
  const handleRemoveRow = (id: string) => {
    setAutoSync(false);
    setEpisodes(episodes.filter(ep => ep.id !== id));
  };

  // Force Full Re-Sync
  const handleForceSync = () => {
    setEpisodes(getGeneratedEpisodes());
    setAutoSync(true);
  };

  // Presets trigger
  const applyPreset = (presetType: "single" | "dual" | "triple") => {
    if (presetType === "single") {
      setDefaultType("sub");
      setDefaultHost("YT");
      setDownloadRes("720");
      setDownloadHost("host_720");
    } else if (presetType === "dual") {
      setDefaultType("sub;sub");
      setDefaultHost("YT1;YT2");
      setDownloadRes("720;1080");
      setDownloadHost("host_720_1;host_1080_1");
    } else if (presetType === "triple") {
      setDefaultType("sub;sub;dub");
      setDefaultHost("YT1;YT2;YT3");
      setDownloadRes("720;720;1080");
      setDownloadHost("host_720_1;host_720_2;host_1080_1");
    }
  };

  const handleGenerateCsv = () => {
    // Generate CSV using exactly the columns from the user's template
    const headers = [
      "anime",
      "title",
      "number",
      "released",
      "video",
      "type",
      "host",
      "status",
      "thumbnail",
      "download_res",
      "download_host",
      "download_url"
    ];

    const rows: string[][] = [headers];

    episodes.forEach((ep) => {
      rows.push([
        ep.anime.trim(),
        ep.title.trim(),
        String(ep.number),
        ep.released,
        ep.video,
        ep.type,
        ep.host,
        ep.status,
        ep.thumbnail,
        ep.download_res,
        ep.download_host,
        ep.download_url
      ]);
    });

    // Convert to CSV string matching Google Sheets export (only quoting when required, e.g. contains commas, quotes, or newlines)
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? "");
            // Only wrap in double quotes if it contains a comma, double-quote, or newline
            if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
              const escaped = str.replace(/"/g, '""');
              return `"${escaped}"`;
            }
            return str;
          })
          .join(",")
      )
      .join("\n");

    // File download trigger - No UTF-8 BOM to prevent PHP/WordPress header detection errors
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${animeName.toLowerCase().replace(/\s+/g, "_")}_episodes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fill placeholder links for direct testing
  const autofillVideoLinks = () => {
    const mockLinks = [];
    const mockDownloads = [];
    for (let i = 1; i <= numEpisodes; i++) {
      mockLinks.push(`video_url_ep${i}_s1;video_url_ep${i}_s2`);
      mockDownloads.push(`url_720_ep${i}_1;url_720_ep${i}_2;url_720_ep${i}_3;url_1080_ep${i}_1`);
    }
    setVideoLinksText(mockLinks.join("\n"));
    setDownloadUrlsText(mockDownloads.join("\n"));
  };

  return (
    <div id="episode-csv-builder-card" className="bg-brand-card rounded-xl border border-slate-700/60 p-6 glow-effect space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-100">
              Anime Episode CSV Builder
            </h2>
            <p className="text-xs text-slate-400">
              Generate advanced bulk WordPress spreadsheets aligning perfectly with Kira Tools format
            </p>
          </div>
        </div>
        <a 
          href="https://docs.google.com/spreadsheets/d/1FduCXS6AsPaYCTnTr6orv6u4lOiS5FuQei_neV-P_aQ/edit?gid=0#gid=0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono tracking-wider font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
        >
          <span>View Excel Template</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Tabs Selector for Bulk Config */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveConfigTab("basic")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeConfigTab === "basic"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          1. Basic Details
        </button>
        <button
          onClick={() => setActiveConfigTab("players")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeConfigTab === "players"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          2. Video Stream Setup
        </button>
        <button
          onClick={() => setActiveConfigTab("downloads")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
            activeConfigTab === "downloads"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          3. Download Link Setup
        </button>
      </div>

      {/* Bulk Config Panels */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-4">
        
        {activeConfigTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-slate-500" />
                Anime Name
              </label>
              <input
                type="text"
                value={animeName}
                onChange={(e) => setAnimeName(e.target.value)}
                placeholder="e.g. Overlord"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500/80 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-slate-500" />
                Episode Title Pattern
              </label>
              <input
                type="text"
                value={titlePattern}
                onChange={(e) => setTitlePattern(e.target.value)}
                placeholder="e.g. Title to show"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500/80 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                Release Date (DD/MM/YYYY target)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={releasedDate}
                  onChange={(e) => setReleasedDate(e.target.value)}
                  className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/80 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setReleasedDate(today);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-semibold text-slate-300 rounded-lg transition-all"
                >
                  Today
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-slate-500" />
                Start Episode #
              </label>
              <input
                type="number"
                min={1}
                value={startEpisode}
                onChange={(e) => setStartEpisode(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <ListPlus className="h-3.5 w-3.5 text-slate-500" />
                Number of Episodes
              </label>
              <input
                type="number"
                min={1}
                value={numEpisodes}
                onChange={(e) => setNumEpisodes(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Default Status
              </label>
              <select
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-2 text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="publish">publish</option>
                <option value="future">future</option>
                <option value="draft">draft</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyDateOnFirst}
                  onChange={(e) => setOnlyDateOnFirst(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-950 h-4 w-4"
                />
                <span className="text-xs text-slate-300">
                  Only set release date on the first episode (leaves others blank as shown in the Google Sheet example)
                </span>
              </label>
            </div>
          </div>
        )}

        {activeConfigTab === "players" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Video Types (Semicolon-separated for multiple mirrors)
                </label>
                <input
                  type="text"
                  value={defaultType}
                  onChange={(e) => setDefaultType(e.target.value)}
                  placeholder="e.g. sub;sub"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Video Hosts (Semicolon-separated)
                </label>
                <input
                  type="text"
                  value={defaultHost}
                  onChange={(e) => setDefaultHost(e.target.value)}
                  placeholder="e.g. YT1;YT2"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Player Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Quick Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("single")}
                className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] hover:text-emerald-400 transition-all font-semibold"
              >
                Single Server (Sub)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("dual")}
                className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] hover:text-emerald-400 transition-all font-semibold"
              >
                Dual Server (Sub;Sub)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("triple")}
                className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] hover:text-emerald-400 transition-all font-semibold"
              >
                Triple Server (Sub;Sub;Dub)
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Video Playback Links (One line per episode. Multiple mirrors separated by semicolon)
                </label>
                <button
                  type="button"
                  onClick={autofillVideoLinks}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 border border-emerald-500/25 px-2 py-0.5 rounded bg-emerald-500/5 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  Autofill test placeholders
                </button>
              </div>
              <textarea
                rows={4}
                value={videoLinksText}
                onChange={(e) => setVideoLinksText(e.target.value)}
                placeholder="https://video_url_1;https://video_url_2&#10;https://video_url_second_episode_1;https://video_url_second_episode_2"
                className="w-full font-mono text-[11px] bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/80"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Thumbnail Image URLs (Optional, left empty by default)
              </label>
              <input
                type="text"
                value={defaultThumbnail}
                onChange={(e) => setDefaultThumbnail(e.target.value)}
                placeholder="e.g. https://domain.com/overlord_banner.jpg"
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeConfigTab === "downloads" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Download Resolutions (Semicolon-separated)
                </label>
                <input
                  type="text"
                  value={downloadRes}
                  onChange={(e) => setDownloadRes(e.target.value)}
                  placeholder="e.g. 720;720;720;1080"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Download Hosts (Semicolon-separated)
                </label>
                <input
                  type="text"
                  value={downloadHost}
                  onChange={(e) => setDownloadHost(e.target.value)}
                  placeholder="e.g. host_720_1;host_720_2;host_720_3;host_1080_1"
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Download URLs (One line per episode, multiple links separated by semicolon)
              </label>
              <textarea
                rows={4}
                value={downloadUrlsText}
                onChange={(e) => setDownloadUrlsText(e.target.value)}
                placeholder="url_720_1;url_720_2;url_720_3;url_1080_1&#10;url_second_ep_720_1;url_second_ep_720_2"
                className="w-full font-mono text-[11px] bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Synchronizer Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-2">
          {autoSync ? (
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Auto-Sync Active</span>
              <span className="text-xs text-slate-400">- Bulk inputs automatically populate the preview below</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-400">Manual Mode</span>
              <span className="text-xs text-slate-400">- Customize individual cells or click generate to refresh rows</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleForceSync}
            className="text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-400/10 active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate Rows from Config
          </button>
        </div>
      </div>

      {/* Interactive Spreadsheet Grid Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold text-slate-200 flex items-center gap-2">
            <span>Spreadsheet Preview Grid</span>
            <span className="text-xs font-mono font-normal text-slate-500">({episodes.length} Rows ready to export)</span>
          </h3>
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </button>
        </div>

        {/* Horizontal scrollable Excel-like table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <div className="overflow-x-auto custom-scrollbar" style={{ maxWidth: "100%" }}>
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase select-none">
                  <th className="p-2 border-r border-slate-800 text-center w-12 shrink-0">#</th>
                  <th className="p-2 border-r border-slate-800 min-w-[120px]">anime</th>
                  <th className="p-2 border-r border-slate-800 min-w-[160px]">title</th>
                  <th className="p-2 border-r border-slate-800 w-20 text-center">number</th>
                  <th className="p-2 border-r border-slate-800 w-28 text-center">released</th>
                  <th className="p-2 border-r border-slate-800 min-w-[180px]">video</th>
                  <th className="p-2 border-r border-slate-800 min-w-[100px]">type</th>
                  <th className="p-2 border-r border-slate-800 min-w-[100px]">host</th>
                  <th className="p-2 border-r border-slate-800 w-28">status</th>
                  <th className="p-2 border-r border-slate-800 min-w-[120px]">thumbnail</th>
                  <th className="p-2 border-r border-slate-800 min-w-[120px]">download_res</th>
                  <th className="p-2 border-r border-slate-800 min-w-[120px]">download_host</th>
                  <th className="p-2 border-r border-slate-800 min-w-[180px]">download_url</th>
                  <th className="p-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {episodes.map((ep, idx) => (
                  <tr key={ep.id} className="hover:bg-slate-900/30 text-xs text-slate-200 transition-colors">
                    
                    {/* Index */}
                    <td className="p-1 border-r border-slate-900 text-center font-mono text-slate-500 select-none">
                      {idx + 1}
                    </td>

                    {/* Anime */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.anime}
                        onChange={(e) => handleCellChange(ep.id, "anime", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs"
                      />
                    </td>

                    {/* Title */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.title}
                        onChange={(e) => handleCellChange(ep.id, "title", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs font-semibold text-emerald-400"
                      />
                    </td>

                    {/* Number */}
                    <td className="p-1 border-r border-slate-900 text-center">
                      <input
                        type="number"
                        value={ep.number}
                        onChange={(e) => handleCellChange(ep.id, "number", parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs font-mono"
                      />
                    </td>

                    {/* Released */}
                    <td className="p-1 border-r border-slate-900 text-center">
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={ep.released}
                        onChange={(e) => handleCellChange(ep.id, "released", e.target.value)}
                        className="w-full text-center bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs font-mono"
                      />
                    </td>

                    {/* Video */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.video}
                        onChange={(e) => handleCellChange(ep.id, "video", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs font-mono"
                      />
                    </td>

                    {/* Type */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.type}
                        onChange={(e) => handleCellChange(ep.id, "type", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs"
                      />
                    </td>

                    {/* Host */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.host}
                        onChange={(e) => handleCellChange(ep.id, "host", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs"
                      />
                    </td>

                    {/* Status */}
                    <td className="p-1 border-r border-slate-900">
                      <select
                        value={ep.status}
                        onChange={(e) => handleCellChange(ep.id, "status", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/85 rounded px-1 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="publish" className="bg-slate-900">publish</option>
                        <option value="future" className="bg-slate-900">future</option>
                        <option value="draft" className="bg-slate-900">draft</option>
                      </select>
                    </td>

                    {/* Thumbnail */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.thumbnail}
                        onChange={(e) => handleCellChange(ep.id, "thumbnail", e.target.value)}
                        placeholder="none"
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs"
                      />
                    </td>

                    {/* Download Res */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.download_res}
                        onChange={(e) => handleCellChange(ep.id, "download_res", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs font-mono"
                      />
                    </td>

                    {/* Download Host */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.download_host}
                        onChange={(e) => handleCellChange(ep.id, "download_host", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs"
                      />
                    </td>

                    {/* Download Url */}
                    <td className="p-1 border-r border-slate-900">
                      <input
                        type="text"
                        value={ep.download_url}
                        onChange={(e) => handleCellChange(ep.id, "download_url", e.target.value)}
                        className="w-full bg-transparent border-0 focus:bg-slate-900/80 focus:ring-1 focus:ring-emerald-500/50 rounded px-1.5 py-1 text-xs font-mono"
                      />
                    </td>

                    {/* Delete action */}
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(ep.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>

                  </tr>
                ))}
                {episodes.length === 0 && (
                  <tr>
                    <td colSpan={14} className="p-10 text-center text-slate-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                        <Layers className="h-8 w-8 text-slate-600 animate-pulse mb-1" />
                        <span className="font-semibold text-slate-300">Spreadsheet Preview Grid is Empty</span>
                        <span>Click the <strong className="text-emerald-400">"Generate Rows from Config"</strong> button above or extract links from Step 2 to populate the spreadsheet rows automatically.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CSV Exporter Formatting Notes */}
      <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800 flex gap-3 items-start text-xs text-slate-400 leading-relaxed">
        <Info className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Kira Tools Format Specifications:</span>
          <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-400">
            <li>The exporter generates exactly <code className="text-emerald-400 font-mono bg-slate-950 px-1 py-0.5 rounded text-[11px]">12 spreadsheet columns</code> matching your exact template layout.</li>
            <li>Multiple video player links are correctly parsed as semicolon-separated lists (e.g. <code className="text-emerald-400 font-mono bg-slate-950 px-1 py-0.5 rounded text-[11px]">video_url1;video_url2</code>) mapping directly to their respective <code className="text-slate-300">type</code> and <code className="text-slate-300 font-mono">host</code> listings.</li>
            <li>Multiple download links map perfectly to resolutions and hosts in chronological sequence (e.g., <code className="text-slate-300">720;1080</code> resolution matches first and second download host/url entries).</li>
          </ul>
        </div>
      </div>

      {/* Trigger CSV generation and download */}
      <button
        id="btn-generate-csv-file"
        onClick={handleGenerateCsv}
        className="w-full font-display font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 glow-btn cursor-pointer"
      >
        <FileDown className="h-5 w-5 text-slate-950 animate-bounce" />
        Export & Download Spreadsheet (.CSV)
      </button>

    </div>
  );
}
