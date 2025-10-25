import React, { useState } from 'react';
import { Sparkles, Loader2, Clipboard, Check, Bot } from 'lucide-react';
import { api, CreativeSuggestion } from '../../services/api';
import { brandTemplate } from '../../services/templates';

const ContentStudioPage: React.FC = () => {
    const [brief, setBrief] = useState({ objective: 'engagement', channel: 'INSTAGRAM', tone: 'friendly', notes: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<CreativeSuggestion[]>([]);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBrief(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setSuggestions([]);
        try {
            const response = await api.getCreativeSuggestions(brief);
            setSuggestions(response);
        } catch (err) {
            setError('Failed to generate content. Please check the API key and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const CopyButton: React.FC<{ text: string }> = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button onClick={handleCopy} className="text-gray-400 hover:text-brand-primary transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4" />}
            </button>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Studio</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Generate brand-aware creative content using AI.</p>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Inputs */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Creative Brief</h2>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="objective" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objective</label>
                            <select id="objective" name="objective" value={brief.objective} onChange={handleInputChange} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                <option>Engagement</option>
                                <option>Lead Generation</option>
                                <option>Brand Awareness</option>
                                <option>Education</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="channel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Channel</label>
                            <select id="channel" name="channel" value={brief.channel} onChange={handleInputChange} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                <option>INSTAGRAM</option>
                                <option>FACEBOOK</option>
                                <option>LINKEDIN</option>
                                <option>TWITTER</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tone of Voice</label>
                            <select id="tone" name="tone" value={brief.tone} onChange={handleInputChange} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                <option>Friendly</option>
                                <option>Professional</option>
                                <option>Empathetic</option>
                                <option>Authoritative</option>
                                <option>Humorous</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prompt / Notes</label>
                            <textarea id="notes" name="notes" rows={4} value={brief.notes} onChange={handleInputChange} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" placeholder="e.g., 'A post about the importance of annual flu shots.'"></textarea>
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="mt-6 w-full flex items-center justify-center bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50">
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {isLoading ? 'Generating...' : 'Generate Content'}
                    </button>
                </div>

                {/* Right Panel: Suggestions */}
                <div className="lg:col-span-2">
                    {isLoading && <p className="text-center text-gray-600 dark:text-gray-400">AI is crafting some ideas...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {suggestions.length > 0 && (
                        <div className="space-y-6">
                            {suggestions.map((s, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fade-in overflow-hidden">
                                    {s.imageUrl && (
                                        <img src={s.imageUrl} alt={s.altText} className="w-full h-auto object-cover bg-gray-200" />
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-brand-primary dark:text-brand-secondary">Variant {i + 1}</h3>
                                        <div className="mt-4 space-y-4">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <div className="flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-300"><span>Hook</span><CopyButton text={s.hook} /></div>
                                                <p className="mt-1 text-gray-800 dark:text-gray-200">{s.hook}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <div className="flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-300"><span>Caption</span><CopyButton text={s.caption} /></div>
                                                <p className="mt-1 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{s.caption}</p>
                                                <button onClick={() => alert('UTM Appended!')} className="text-xs font-semibold text-brand-secondary hover:underline mt-2">Insert UTM</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                    <div className="flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-300"><span>Hashtags</span><CopyButton text={s.hashtags.join(' ')} /></div>
                                                    <p className="mt-1 text-sm text-blue-500">{s.hashtags.join(' ')}</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                    <div className="flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-300"><span>First Comment</span><CopyButton text={s.firstComment} /></div>
                                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{s.firstComment}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                                                    <Bot className="w-4 h-4 mr-2" />
                                                    Grounded in: <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{s.citations.join(', ') || 'General Knowledge'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentStudioPage;