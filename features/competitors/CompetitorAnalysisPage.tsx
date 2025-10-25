import React, { useState } from 'react';
import { api } from '../../services/api';
import { Telescope, Search, Bot, Loader2 } from 'lucide-react';

interface CompetitorAnalysis {
  pillars: string[];
  tone: string;
  frequency: string;
}

const CompetitorAnalysisPage: React.FC = () => {
  const [competitorHandle, setCompetitorHandle] = useState('@rivalclinic');
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!competitorHandle) return;
    setLoading(true);
    setAnalysis(null);
    setPosts([]);
    try {
      const result = await api.getCompetitorAnalysis(competitorHandle);
      if (result) {
        setAnalysis(result.analysis);
        setPosts(result.posts);
      }
    } catch (error) {
      console.error("Failed to get competitor analysis", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor Analysis</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Track competitor strategies and content with AI-powered insights.</p>

      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Telescope className="w-6 h-6 mr-3 text-brand-primary" />
          Analyze a Competitor
        </h2>
        <div className="mt-4 flex gap-4">
          <input
            type="text"
            value={competitorHandle}
            onChange={(e) => setCompetitorHandle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="@competitorhandle"
            className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !competitorHandle}
            className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="ml-2 hidden sm:inline">{loading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
        </div>
      </div>

      {analysis && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Bot className="w-5 h-5 mr-3 text-brand-secondary" />
                AI Strategy Summary
              </h3>
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Content Pillars</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analysis.pillars.map(pillar => (
                      <span key={pillar} className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{pillar}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tone of Voice</h4>
                  <p className="text-gray-800 dark:text-gray-200">{analysis.tone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Est. Posting Frequency</h4>
                  <p className="text-gray-800 dark:text-gray-200">{analysis.frequency}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <p className="text-gray-700 dark:text-gray-300">{post}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysisPage;