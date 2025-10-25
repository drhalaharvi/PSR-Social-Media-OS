
import React, { useState, useEffect } from 'react';
import { api, Experiment } from '../../services/api';
import { Beaker, Plus, Play, Loader2 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [loading, setLoading] = useState(false);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        const loadExperiments = async () => {
            setLoading(true);
            // Create a default experiment on first load if none exist
            let existingExperiments = await api.getExperiments();
            if (existingExperiments.length === 0) {
                await api.createExperiment("Initial Ad Campaign", ["Hook A: Question", "Hook B: Statistic", "Hook C: Story"]);
                existingExperiments = await api.getExperiments();
            }
            setExperiments(existingExperiments);
            setSelectedExperiment(existingExperiments[0]);
            setLoading(false);
        };
        loadExperiments();
    }, []);

    const handleRunSimulation = async () => {
        if (!selectedExperiment) return;
        setSimulating(true);
        const updatedExperiment = await api.runExperimentSimulation(selectedExperiment.id, 50); // Run 50 iterations
        setExperiments(prev => prev.map(e => e.id === updatedExperiment.id ? updatedExperiment : e));
        setSelectedExperiment(updatedExperiment);
        setSimulating(false);
    };
    
    const getWinRate = (alpha: number, beta: number) => {
      if (alpha + beta - 2 <= 0) return 0;
      // Using the mean of the Beta distribution as a proxy for win rate
      return alpha / (alpha + beta);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attribution & Experiments</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Optimize content with multi-armed bandits and track performance.</p>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Beaker className="w-5 h-5 mr-3 text-brand-primary" />
                        A/B/n Experiments
                    </h2>
                    <button className="flex items-center text-sm font-semibold bg-brand-primary text-white py-2 px-3 rounded-lg hover:bg-brand-secondary">
                        <Plus className="w-4 h-4 mr-2" /> New Experiment
                    </button>
                </div>
                
                {loading && <p className="p-6">Loading experiments...</p>}

                {selectedExperiment && (
                    <div className="p-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Campaign: {selectedExperiment.name}</h3>
                        <div className="mt-4 space-y-4">
                            {selectedExperiment.variants.map(variant => {
                                const ctr = variant.impressions > 0 ? (variant.clicks / variant.impressions) * 100 : 0;
                                const winRate = getWinRate(variant.alpha, variant.beta);
                                
                                return (
                                <div key={variant.id} className="border dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{variant.name}</p>
                                        <p className="text-sm text-gray-500">{variant.impressions.toLocaleString()} impressions</p>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Predicted Win Rate: {(winRate * 100).toFixed(1)}%</p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                            <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${winRate * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-xs flex space-x-4">
                                        <span>Clicks: {variant.clicks}</span>
                                        <span>CTR: {ctr.toFixed(2)}%</span>
                                        <span className="text-gray-500">(α: {variant.alpha}, β: {variant.beta})</span>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                        <button onClick={handleRunSimulation} disabled={simulating} className="mt-6 flex items-center text-sm font-semibold bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {simulating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
                            {simulating ? 'Simulating...' : 'Run 50 More Iterations'}
                        </button>
                         <p className="text-xs text-gray-500 mt-2">This simulation demonstrates how the Thompson Sampling bandit learns and reallocates traffic to the winning variant over time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
