export enum PredictionLabel {
  SAFE = 'Legitimate',
  SUSPICIOUS = 'Suspicious',
  FAKE = 'Phishing / Fake',
}

export interface FeatureExplanation {
  type: 'keyword' | 'url' | 'header' | 'structure';
  value: string;
  weight: number; // 0 to 1 impact
  description: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  prediction: PredictionLabel;
  confidence: number; // 0 to 100
  explanations: FeatureExplanation[];
  highlightedPhrases: {
    phrase: string;
    category: 'danger' | 'warning';
    reason: string;
  }[];
  indicators: {
    urls_count: number;
    has_ip_url: boolean;
    spf_pass: boolean;
    dkim_pass: boolean;
    mismatched_sender: boolean;
  };
}

export interface EmailInputData {
  subject: string;
  body: string;
  raw_headers: string;
  from_address?: string;
}

export interface HistoryItem {
  id: string;
  subject: string;
  date: string;
  label: PredictionLabel;
  confidence: number;
}