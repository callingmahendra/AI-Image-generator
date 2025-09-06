
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import ResultsPanel from './components/ResultsPanel';
import { type GenerationRequest, type GeneratedImage } from './types';
import { generateImagesFromApi, generateImageVariationFromApi } from './services/geminiService';

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
            setGeneratedImages(prev => [...prev, ...newImages]);
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

  const handleGenerateVariation = async (originalImage: GeneratedImage) => {
    setIsLoading(true);
    setError(null);

    try {
        const base64Image = await generateImageVariationFromApi(originalImage.base64, originalImage.prompt);
        const newImage: GeneratedImage = {
            id: crypto.randomUUID(),
            prompt: originalImage.prompt,
            labels: originalImage.labels,
            base64: base64Image,
            parentId: originalImage.id,
        };

        setGeneratedImages(prevImages => {
            const parentId = originalImage.parentId || originalImage.id;
            const parentIndex = prevImages.findIndex(img => img.id === parentId);
            if (parentIndex === -1) {
                return [...prevImages, newImage];
            }

            // Find the last item in the variation group (parent + its children)
            let lastVariationIndex = parentIndex;
            while (
                lastVariationIndex + 1 < prevImages.length &&
                (prevImages[lastVariationIndex + 1].id === parentId || prevImages[lastVariationIndex + 1].parentId === parentId)
            ) {
                lastVariationIndex++;
            }

            const newImagesList = [...prevImages];
            newImagesList.splice(lastVariationIndex + 1, 0, newImage);
            return newImagesList;
        });

    } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unexpected error occurred while generating the variation.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadAll = useCallback(() => {
    if (generatedImages.length === 0) return;

    const downloadWithDelay = (image: GeneratedImage, index: number) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${image.base64}`;
        // Sanitize prompt for filename
        const sanitizedPrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
        link.download = `img_${sanitizedPrompt}_${image.id.slice(0, 8)}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200); // 200ms delay between downloads
    };

    generatedImages.forEach(downloadWithDelay);
  }, [generatedImages]);

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
                onGenerateVariation={handleGenerateVariation} 
                onDownloadAll={handleDownloadAll}
            />
        </div>
      </main>
    </div>
  );
};

export default App;
