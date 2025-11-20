import { AnalysisResult, EmailInputData, PredictionLabel } from '../types';

const DELAY_MS = 1500;

// Heuristic keywords for the mock
const DANGER_KEYWORDS = ['verify your account', 'urgent action', 'password expiration', 'lottery winner', 'bank of america', 'update payment'];
const SUSPICIOUS_DOMAINS = ['bit.ly', 'tinyurl.com', 'ngrok.io'];

export const analyzeEmail = async (data: EmailInputData): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const text = (data.subject + " " + data.body).toLowerCase();
      
      let score = 0;
      const foundExplanations: any[] = [];
      const foundHighlights: any[] = [];

      // 1. Keyword Analysis
      DANGER_KEYWORDS.forEach(kw => {
        if (text.includes(kw)) {
          score += 30;
          foundExplanations.push({
            type: 'keyword',
            value: kw,
            weight: 0.8,
            description: `High-risk phrase "${kw}" often found in phishing.`
          });
          foundHighlights.push({
            phrase: kw,
            category: 'danger',
            reason: 'High-risk phishing keyword'
          });
        }
      });

      // 2. URL Analysis (Mock)
      if (data.body.includes('http://')) {
        score += 10;
        foundExplanations.push({
          type: 'url',
          value: 'Unsecured HTTP',
          weight: 0.4,
          description: 'Contains unsecured HTTP links.'
        });
      }

      // 3. Header Analysis (Mock)
      const spfFail = Math.random() > 0.8;
      if (spfFail) {
        score += 25;
        foundExplanations.push({
          type: 'header',
          value: 'SPF Fail',
          weight: 0.6,
          description: 'Sender Policy Framework (SPF) check failed.'
        });
      }

      // Normalize Score
      let finalLabel = PredictionLabel.SAFE;
      let confidence = 95; // Default high confidence for safe

      if (score > 50) {
        finalLabel = PredictionLabel.FAKE;
        confidence = Math.min(99, 70 + score / 2);
      } else if (score > 20) {
        finalLabel = PredictionLabel.SUSPICIOUS;
        confidence = 60 + Math.random() * 20;
      } else {
        // If safe, confidence is high that it is safe
        confidence = 90 + Math.random() * 8;
      }

      resolve({
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        prediction: finalLabel,
        confidence: Math.floor(confidence),
        explanations: foundExplanations,
        highlightedPhrases: foundHighlights,
        indicators: {
          urls_count: Math.floor(Math.random() * 5),
          has_ip_url: Math.random() > 0.9,
          spf_pass: !spfFail,
          dkim_pass: true,
          mismatched_sender: Math.random() > 0.85,
        }
      });
    }, DELAY_MS);
  });
};

export const getDashboardStats = async () => {
  return [
    { name: 'Mon', legit: 40, phishing: 24 },
    { name: 'Tue', legit: 30, phishing: 13 },
    { name: 'Wed', legit: 20, phishing: 58 },
    { name: 'Thu', legit: 27, phishing: 39 },
    { name: 'Fri', legit: 18, phishing: 48 },
    { name: 'Sat', legit: 23, phishing: 38 },
    { name: 'Sun', legit: 34, phishing: 43 },
  ];
};