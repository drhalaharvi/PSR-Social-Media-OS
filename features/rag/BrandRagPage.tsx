
import React, { useState } from 'react';
import { UploadCloud, Send, Bot, FileText, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BrandRagPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ answer: string; sources: string[] } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setUploadStatus('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first.');
      return;
    }
    setUploadStatus(`Uploading ${file.name}...`);
    try {
      const response = await api.uploadBrandDocument(file);
      if (response.success) {
        setUploadStatus(`Successfully processed ${response.chunks_created} facts.`);
      }
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await api.getBrandAnswer(question);
      setResult(response);
    } catch (error) {
      setResult({ answer: 'An error occurred. Please try again.', sources: [] });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAskQuestion();
    }
  };


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand RAG Knowledge Base</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Upload brand documents and ask questions to get grounded, source-cited answers.</p>
      
      {/* Upload Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <UploadCloud className="w-6 h-6 mr-3 text-brand-primary" />
          Step 1: Upload Knowledge Document
        </h2>
        <p className="text-sm text-gray-500 mt-1">Upload a .txt or .md file. Each upload replaces the previous knowledge base.</p>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md cursor-pointer border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {file ? file.name : 'Choose File'}
            <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileChange} />
          </label>
          <button 
            onClick={handleUpload} 
            disabled={!file}
            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload & Process
          </button>
        </div>
        {uploadStatus && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{uploadStatus}</p>}
      </div>

      {/* Q&A Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Bot className="w-6 h-6 mr-3 text-brand-primary" />
            Step 2: Ask a Question
        </h2>
        <div className="mt-4 flex gap-4">
            <input 
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'What are the Saturday hours?'"
                className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
            <button 
                onClick={handleAskQuestion}
                disabled={isLoading || !question.trim()}
                className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                <span className="ml-2 hidden sm:inline">Ask</span>
            </button>
        </div>
      </div>

      {/* Results Section */}
      { (isLoading || result) && (
        <div className="mt-8">
            {isLoading && <p className="text-center text-gray-600 dark:text-gray-400">AI is thinking...</p>}
            {result && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Answer:</h3>
                    <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{result.answer}</p>
                    
                    {result.sources.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Sources:</h4>
                            <div className="mt-2 space-y-3">
                                {result.sources.map((source, index) => (
                                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex">
                                            <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                            <span>{source}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default BrandRagPage;
