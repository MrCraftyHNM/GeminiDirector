import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import { ReferenceDoc, DocCategory, LogStatus, TrafficLog } from './types';
import { KNOWLEDGE_BASE } from './constants';
import { createLog } from './services/logger';

// --- Helper Components ---

const TerminalLog = ({ logs, onClear }: { logs: TrafficLog[], onClear: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-48 bg-black border-t border-gray-800 font-mono text-xs p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-500 font-bold uppercase tracking-wider">Access Log</span>
        <button 
          onClick={onClear}
          className="text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
        >
          Clear
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1">
        {logs.map((log) => (
          <div key={log.traceId} className="flex gap-2 border-l-2 pl-2" style={{
            borderColor: log.status === LogStatus.COPY ? '#22c55e' : '#3b82f6'
          }}>
            <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`font-bold w-20 ${
              log.layer === 'DATABASE' ? 'text-cyan-600' : 'text-blue-500'
            }`}>{log.layer}</span>
            <span className="text-gray-300">
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CodeBlock = ({ code, language = 'typescript' }: { code: string, language?: string }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div className="relative group">
       <pre className={`language-${language} !bg-gray-900 !p-4 !rounded-lg !border !border-gray-700 !shadow-xl`}>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

const DocList = ({ 
  docs, 
  selectedId, 
  onSelect 
}: { 
  docs: ReferenceDoc[], 
  selectedId: string, 
  onSelect: (d: ReferenceDoc) => void 
}) => {
    if (docs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 opacity-50">
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">No entries found</span>
            </div>
        );
    }

    // Flat list approach - One Index Layer
    return (
        <div className="space-y-1">
            {docs.map(doc => (
                <button
                    key={doc.id}
                    onClick={() => onSelect(doc)}
                    className={`w-full text-left px-3 py-3 rounded text-sm transition-all border-l-2 flex flex-col gap-1.5 ${
                        selectedId === doc.id 
                        ? 'bg-gray-800 border-cyan-500 text-white' 
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                >
                    <span className="font-medium truncate">{doc.title}</span>
                    <div className="flex items-center justify-between">
                         <span className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded ${
                             selectedId === doc.id ? 'bg-cyan-900 text-cyan-200' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'
                         }`}>
                            {doc.category}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};

// --- Main Fusebox Component ---

const App: React.FC = () => {
  // State
  const [activeDoc, setActiveDoc] = useState<ReferenceDoc>(KNOWLEDGE_BASE[0]);
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  
  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAlpha, setSortAlpha] = useState(false);

  // Logic
  const filteredDocs = KNOWLEDGE_BASE.filter(doc => {
    const term = searchTerm.toLowerCase();
    return doc.title.toLowerCase().includes(term) || 
           doc.category.toLowerCase().includes(term) ||
           doc.id.toLowerCase().includes(term);
  });

  const displayDocs = sortAlpha 
    ? [...filteredDocs].sort((a, b) => a.title.localeCompare(b.title))
    : filteredDocs;

  // Helpers
  const addLog = (layer: 'UI' | 'DATABASE', status: LogStatus, message: string, payload?: any) => {
    setLogs(prev => [...prev, createLog(layer, status, message, payload)]);
  };

  const clearLogs = () => setLogs([]);

  // Actions
  const handleDocChange = (doc: ReferenceDoc) => {
    addLog('UI', LogStatus.ACCESS, `Read access: ${doc.title} [${doc.id}]`);
    setActiveDoc(doc);
  };

  const handleCopy = (type: 'SNIPPET' | 'RAW') => {
    const content = type === 'RAW' 
        ? JSON.stringify(activeDoc, null, 2) 
        : activeDoc.codeSnippet;
        
    navigator.clipboard.writeText(content);
    addLog('DATABASE', LogStatus.COPY, `Content copied to clipboard: ${activeDoc.id} [${type}]`);
  };

  const toggleSort = () => {
    const newValue = !sortAlpha;
    setSortAlpha(newValue);
    addLog('UI', LogStatus.ACCESS, `Sort order changed: ${newValue ? 'A-Z' : 'Default'}`);
  }

  // Initial Log
  useEffect(() => {
    addLog('DATABASE', LogStatus.INFO, 'Reference Database mounted.', { entries: KNOWLEDGE_BASE.length });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100 overflow-hidden font-sans">
      
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950">
        <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-cyan-500 mr-3 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
            <h1 className="font-bold text-lg tracking-wider text-gray-200">GEMINI <span className="text-gray-600 font-normal">DATA MATRIX</span></h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Navigation & Search */}
        <div className="w-full md:w-1/4 bg-gray-900 border-r border-gray-800 flex flex-col">
            
            {/* Search & Sort Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900 z-10">
                <div className="relative mb-3 group">
                    <input 
                        type="text" 
                        placeholder="Search matrix..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-md py-2 pl-9 pr-3 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-900 transition-all"
                    />
                    <svg className="w-4 h-4 text-gray-600 absolute left-3 top-2 group-focus-within:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-mono text-gray-500">
                        {displayDocs.length} / {KNOWLEDGE_BASE.length}
                    </span>
                    <button 
                        onClick={toggleSort}
                        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            sortAlpha ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-400'
                        }`}
                        title="Toggle Sort Order"
                    >
                        {sortAlpha ? 'Sorted A-Z' : 'Default Order'}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <DocList 
                    docs={displayDocs} 
                    selectedId={activeDoc.id} 
                    onSelect={handleDocChange} 
                />
            </div>
        </div>

        {/* Right Panel: Reader (Unified) */}
        <div className="flex-1 flex flex-col bg-gray-950 min-w-0 overflow-y-auto relative">
          
          <div className="p-8 max-w-4xl mx-auto w-full pb-20">
            
            {/* Header: Title & Class Type ONLY */}
            <div className="mb-6 border-b border-gray-800 pb-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{activeDoc.title}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-500 border border-cyan-900 bg-cyan-950 px-2 py-0.5 rounded uppercase">
                            {activeDoc.category}
                        </span>
                         <span className="text-[10px] font-mono text-gray-500 uppercase">
                            {activeDoc.modelTarget}
                        </span>
                    </div>
                </div>
            </div>

            {/* Code Section */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Implementation Pattern</h3>
                    <button 
                        onClick={() => handleCopy('SNIPPET')}
                        className="text-xs bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 px-3 py-1 rounded border border-blue-900/50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Snippet
                    </button>
                </div>
                <CodeBlock code={activeDoc.codeSnippet} language="typescript" />
            </div>

            {/* Raw Data Section */}
            <div className="mb-8 pt-8 border-t border-gray-900">
                    <div className="flex justify-between items-end mb-3">
                    <h3 className="text-sm font-bold text-green-700 uppercase tracking-wider">Reference Object (JSON)</h3>
                    <button 
                        onClick={() => handleCopy('RAW')}
                        className="text-xs bg-green-900/30 hover:bg-green-800/50 text-green-400 px-3 py-1 rounded border border-green-900/50 transition-colors flex items-center gap-2"
                    >
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy Data
                    </button>
                </div>
                <CodeBlock code={JSON.stringify(activeDoc, null, 2)} language="json" />
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Panel: Access Log */}
      <TerminalLog logs={logs} onClear={clearLogs} />
      
    </div>
  );
};

export default App;