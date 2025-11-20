import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AnalysisReport } from './components/AnalysisReport';
import { LoginPage } from './components/LoginPage';
import { analyzeEmail, getDashboardStats } from './services/mockApi';
import { AnalysisResult, EmailInputData, HistoryItem, PredictionLabel } from './types';
import { FileText, Upload, AlertCircle, Loader2, BarChart2, Settings, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [inputData, setInputData] = useState<EmailInputData>({
    subject: '',
    body: '',
    raw_headers: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [dashboardData, setDashboardData] = useState<any[]>([]);

  useEffect(() => {
    // Load mock dashboard data on mount
    getDashboardStats().then(setDashboardData);
  }, []);

  const handleAnalyze = async () => {
    if (!inputData.body && !inputData.subject) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeEmail(inputData);
      setResult(analysis);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: analysis.id,
        subject: inputData.subject || '(No Subject)',
        date: new Date().toLocaleDateString(),
        label: analysis.prediction,
        confidence: analysis.confidence
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we would parse .eml/.msg here. 
      // For this demo, we just mock populating the fields.
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputData(prev => ({
          ...prev,
          subject: 'Uploaded Email: ' + file.name,
          body: text.substring(0, 2000) // Truncate for demo
        }));
      };
      reader.readAsText(file);
    }
  };

  const renderAnalyzeView = () => {
    if (result) {
      return (
        <AnalysisReport 
          result={result} 
          originalBody={inputData.subject + '\n\n' + inputData.body}
          onReset={() => setResult(null)}
        />
      );
    }

    return (
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Fake Email Detector</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Paste an email or upload a file to analyze it for phishing attempts using our advanced ML model.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button className="flex-1 py-4 text-sm font-medium text-brand-600 border-b-2 border-brand-600 bg-brand-50">
              Paste Text
            </button>
            <button className="flex-1 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50">
              Upload .EML
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject Line</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                placeholder="e.g. URGENT: Verify your account now"
                value={inputData.subject}
                onChange={(e) => setInputData({...inputData, subject: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Body</label>
              <textarea 
                className="w-full h-64 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition resize-none"
                placeholder="Paste the email content here..."
                value={inputData.body}
                onChange={(e) => setInputData({...inputData, body: e.target.value})}
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="relative">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".eml,.txt,.msg"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 cursor-pointer transition-colors"
                >
                  <Upload size={16} />
                  <span>Load from file</span>
                </label>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!inputData.body && !inputData.subject)}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 ${
                  isAnalyzing || (!inputData.body && !inputData.subject)
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Analyze Email
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="bg-slate-50 px-8 py-4 text-xs text-slate-500 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>Privacy Note: For this demo, data is processed locally in the browser mock service. In a production environment, never submit PII without encryption.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-900">Threat Intelligence Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Total Scanned</div>
          <div className="text-3xl font-bold text-slate-900">1,284</div>
          <div className="text-xs text-green-600 mt-2 font-medium">+12% from last week</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Phishing Detected</div>
          <div className="text-3xl font-bold text-red-600">342</div>
          <div className="text-xs text-slate-400 mt-2">26.6% detection rate</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">Accuracy Rate</div>
          <div className="text-3xl font-bold text-brand-600">98.2%</div>
          <div className="text-xs text-slate-400 mt-2">Based on user feedback</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart2 size={20} /> Weekly Threat Volume
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend />
              <Bar dataKey="legit" name="Legitimate" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="phishing" name="Phishing" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Scan History</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p>No scans performed yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-xs">{item.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.label === PredictionLabel.SAFE ? 'bg-green-100 text-green-700' :
                      item.label === PredictionLabel.FAKE ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // If not authenticated, show Login Page
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={() => setIsAuthenticated(false)}
    >
      {activeTab === 'analyze' && renderAnalyzeView()}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'settings' && (
        <div className="text-center py-20 text-slate-500">
          <Settings size={48} className="mx-auto mb-4 opacity-20" />
          <p>Settings panel not implemented in demo.</p>
        </div>
      )}
    </Layout>
  );
};

export default App;