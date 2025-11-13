import React, { useState, useCallback } from 'react';
import { summarizeText } from './services/geminiService';
import { SummaryLength } from './types';

// Helper Components (defined outside the main App to prevent re-renders)

const Header: React.FC = () => (
    <header className="w-full py-6">
        <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                AI Text Summarizer
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                Paste any article and get a concise summary in seconds.
            </p>
        </div>
    </header>
);

const Loader: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface SummaryOutputProps {
    summary: string;
}
const SummaryOutput: React.FC<SummaryOutputProps> = ({ summary }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg relative">
             <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Copy summary to clipboard"
            >
                {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardIcon className="h-5 w-5" />}
            </button>
            <div className="prose prose-invert max-w-none prose-p:text-gray-300">
               <p className="whitespace-pre-wrap">{summary}</p>
            </div>
        </div>
    );
};


// Main App Component
const App: React.FC = () => {
    const [inputText, setInputText] = useState<string>('');
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [summaryLength, setSummaryLength] = useState<SummaryLength>(SummaryLength.MEDIUM);

    const handleSubmit = useCallback(async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to summarize.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSummary('');

        try {
            const result = await summarizeText(inputText, summaryLength);
            if (result.startsWith('Failed') || result.startsWith('An unknown error')) {
                setError(result);
            } else {
                setSummary(result);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, summaryLength]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl">
                <Header />
                <main className="mt-8 space-y-8">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-gray-200">Enter Your Text</h2>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your article here..."
                            className="w-full h-64 p-4 bg-gray-900 border-2 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-300 resize-y"
                            disabled={isLoading}
                        />

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-gray-400">Summary Length:</span>
                                <div className="flex gap-2 rounded-lg bg-gray-900 p-1">
                                    {Object.values(SummaryLength).map((len) => (
                                        <button
                                            key={len}
                                            onClick={() => setSummaryLength(len)}
                                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                                summaryLength === len
                                                    ? 'bg-indigo-600 text-white shadow'
                                                    : 'text-gray-400 hover:bg-gray-700'
                                            }`}
                                        >
                                            {len.charAt(0).toUpperCase() + len.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !inputText.trim()}
                                className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Summarizing...
                                    </>
                                ) : (
                                    'Generate Summary'
                                )}
                            </button>
                        </div>
                    </div>

                    {isLoading && <Loader />}
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {summary && !isLoading && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-200">Your Summary</h2>
                            <SummaryOutput summary={summary} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
