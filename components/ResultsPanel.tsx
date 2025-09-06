
import React from 'react';
import { type GeneratedImage } from '../types';
import Spinner from './Spinner';
import { DownloadIcon, GenerateIcon, VariationsIcon } from './IconComponents';

interface ResultsPanelProps {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  onGenerateVariation: (image: GeneratedImage) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ images, isLoading, error, onGenerateVariation }) => {
    
  const handleDownload = (base64: string, id: string) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64}`;
    link.download = `generated-image-${id.slice(0, 8)}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupedImages = images.reduce((acc, image) => {
    (acc[image.prompt] = acc[image.prompt] || []).push(image);
    return acc;
  }, {} as Record<string, GeneratedImage[]>);

  const renderContent = () => {
    if (isLoading && images.length === 0) {
      return (
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-lg text-slate-300">Generating your dataset...</p>
          <p className="text-sm text-slate-400">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center bg-red-900/50 border border-red-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-red-300">An Error Occurred</h3>
          <p className="text-red-400 mt-2">{error}</p>
        </div>
      );
    }

    if (images.length === 0) {
      return (
        <div className="text-center text-slate-400">
            <GenerateIcon className="mx-auto h-16 w-16 text-slate-600" />
            <h3 className="mt-2 text-xl font-semibold text-slate-300">Ready to Generate</h3>
            <p className="mt-1 text-md">Configure your image requests on the left and click "Generate Dataset" to begin.</p>
        </div>
      );
    }

    return (
        <div className="space-y-8">
            {Object.entries(groupedImages).map(([prompt, imageGroup]) => (
                <div key={prompt}>
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2 px-1 z-10">
                        <h3 className="text-lg font-semibold text-indigo-300">{prompt}</h3>
                        {isLoading && <Spinner />}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {imageGroup.map((image) => {
                            const isVariation = !!image.parentId;
                            return (
                                <div
                                    key={image.id}
                                    className={`group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 ${isVariation ? 'border-l-4 border-cyan-600' : ''}`}
                                >
                                    {isVariation && <span className="absolute top-1 left-1 bg-cyan-600 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">Variation</span>}
                                    <img src={`data:image/jpeg;base64,${image.base64}`} alt={image.prompt} className="w-full h-auto aspect-square object-cover" />
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-wrap gap-1">
                                                {image.labels.map(label => (
                                                    <span key={label} className="bg-cyan-800/50 text-cyan-300 text-xs font-medium px-2 py-0.5 rounded-full">{label}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="self-end flex gap-2">
                                            <button
                                                onClick={() => onGenerateVariation(image)}
                                                className="bg-slate-100/20 hover:bg-slate-100/40 text-white p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isLoading}
                                                aria-label="Generate variation"
                                                title="Generate variation"
                                            >
                                                <VariationsIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(image.base64, image.id)}
                                                className="self-end bg-slate-100/20 hover:bg-slate-100/40 text-white p-2 rounded-full transition"
                                                aria-label="Download image"
                                                title="Download image"
                                            >
                                                <DownloadIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className={`${images.length > 0 ? 'block' : 'flex items-center justify-center h-full'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ResultsPanel;
