import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AnalysisResult, PredictionLabel } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert, Info } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface AnalysisReportProps {
  result: AnalysisResult;
  originalBody: string;
  onReset: () => void;
}

const COLORS = {
  [PredictionLabel.SAFE]: '#10b981',
  [PredictionLabel.SUSPICIOUS]: '#f59e0b',
  [PredictionLabel.FAKE]: '#ef4444',
};

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ result, originalBody, onReset }) => {
  
  const getColor = () => COLORS[result.prediction];
  const isSafe = result.prediction === PredictionLabel.SAFE;

  const chartData = [
    { name: 'Confidence', value: result.confidence },
    { name: 'Uncertainty', value: 100 - result.confidence },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Column: Verdict & Explanations */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className={`p-6 text-center border-b-4 ${isSafe ? 'border-brand-500' : 'border-risk-danger'}`} style={{ borderColor: getColor() }}>
            <h2 className="text-lg font-semibold text-slate-500 uppercase tracking-wide mb-1">Detection Result</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
               {result.prediction === PredictionLabel.SAFE && <CheckCircle size={32} className="text-risk-safe" />}
               {result.prediction === PredictionLabel.SUSPICIOUS && <AlertTriangle size={32} className="text-risk-warning" />}
               {result.prediction === PredictionLabel.FAKE && <ShieldAlert size={32} className="text-risk-danger" />}
               <span className="text-3xl font-bold text-slate-900">{result.prediction}</span>
            </div>
            
            {/* Confidence Chart */}
            <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={getColor()} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{result.confidence}%</span>
                  <span className="text-xs text-slate-400 uppercase">Confidence</span>
                </div>
            </div>

            <p className="text-slate-600 mt-2 text-sm">
              {isSafe 
                ? "This email appears legitimate based on our analysis." 
                : "We found multiple indicators suggesting this email is malicious."}
            </p>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Key Indicators</h3>
             <ul className="space-y-2 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-slate-600">URL Count</span>
                  <span className="font-mono font-medium">{result.indicators.urls_count}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-600">SPF Check</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${result.indicators.spf_pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.indicators.spf_pass ? 'PASS' : 'FAIL'}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-600">Mismatched Sender</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${!result.indicators.mismatched_sender ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.indicators.mismatched_sender ? 'YES' : 'NO'}
                  </span>
                </li>
             </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Info size={18} /> Explainability
          </h3>
          <div className="space-y-3">
            {result.explanations.length === 0 ? (
              <p className="text-slate-500 italic text-sm">No specific red flags detected.</p>
            ) : (
              result.explanations.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                   <div className={`w-1.5 h-1.5 mt-2 rounded-full shrink-0 ${exp.weight > 0.6 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                   <div>
                     <div className="text-sm font-medium text-slate-900">{exp.value}</div>
                     <div className="text-xs text-slate-500 mt-0.5">{exp.description}</div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <button onClick={onReset} className="w-full py-3 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
          Analyze Another Email
        </button>
      </div>

      {/* Right Column: Body Highlight */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
           <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
             <h3 className="font-semibold text-slate-800">Email Content Analysis</h3>
             <div className="text-xs text-slate-500 flex gap-3">
               <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-200 border border-red-400 rounded-sm"></span> High Risk</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-200 border border-yellow-400 rounded-sm"></span> Warning</span>
             </div>
           </div>
           <div className="p-6 overflow-y-auto max-h-[800px]">
              <div className="mb-6 p-4 bg-white border border-slate-200 rounded shadow-sm">
                <div className="text-xs text-slate-400 uppercase mb-1">Subject</div>
                <HighlightText text={originalBody.split('\n')[0] || "No Subject"} highlights={result.highlightedPhrases} />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded shadow-sm min-h-[300px]">
                <div className="text-xs text-slate-400 uppercase mb-2">Body</div>
                <HighlightText text={originalBody} highlights={result.highlightedPhrases} />
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};