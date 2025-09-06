
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import ResultsPanel from './components/ResultsPanel';
import { type GenerationRequest, type GeneratedImage } from './types';
import { generateImagesFromApi } from './services/geminiService';

const App: React.FC = () => {
  const [requests, setRequests] = useState<GenerationRequest[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddRequest = useCallback((request: Omit<GenerationRequest, 'id'>) => {
    setRequests(prev => [...prev, { ...request, id: crypto.randomUUID() }]);
  }, []);

  const handleRemoveRequest = useCallback((id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  const handleGenerateDataset = async () => {
    if (requests.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    
    const allGeneratedImages: GeneratedImage[] = [];

    try {
        for (const req of requests) {
            const base64Images = await generateImagesFromApi(req.prompt, req.quantity, req.aspectRatio);
            const newImages: GeneratedImage[] = base64Images.map(base64 => ({
                id: crypto.randomUUID(),
                prompt: req.prompt,
                labels: req.labels,
                base64,
            }));
            allGeneratedImages.push(...newImages);
            // Optional: update state incrementally
            setGeneratedImages([...allGeneratedImages]);
        }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl h-[calc(100vh-80px)]">
        <div className="lg:col-span-1 h-full">
            <ConfigPanel
                requests={requests}
                onAddRequest={handleAddRequest}
                onRemoveRequest={handleRemoveRequest}
                onGenerate={handleGenerateDataset}
                isLoading={isLoading}
            />
        </div>
        <div className="lg:col-span-2 bg-slate-800/50 rounded-lg shadow-lg h-full">
            <ResultsPanel 
                images={generatedImages} 
                isLoading={isLoading} 
                error={error} 
            />
        </div>
      </main>
    </div>
  );
};

export default App;
