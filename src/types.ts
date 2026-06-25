export interface SequenceConfig {
  baseUrl: string;
  generatedUrls: string[];
}

export interface ExtractionStatus {
  url: string;
  status: "idle" | "loading" | "success" | "failed";
  extractedUrl?: string;
  error?: string;
}

export interface CsvRow {
  anime: string;
  title: string;
  number: number;
  released: string;
  video: string;
  type: string;
}

export interface CsvBuilderConfig {
  animeName: string;
  titlePattern: string;
  startEpisode: number;
  numEpisodes: number;
  videoLinksText: string;
  releasedDate: string;
  embedType: string;
}
