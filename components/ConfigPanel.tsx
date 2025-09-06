import React, { useState } from 'react';
import { type GenerationRequest, type AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants';
import { PlusIcon, TrashIcon, GenerateIcon } from './IconComponents';

interface ConfigPanelProps {
  requests: GenerationRequest[];
  onAddRequest: (request: Omit<GenerationRequest, 'id'>) => void;
  onRemoveRequest: (id: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  requests,
  onAddRequest,
  onRemoveRequest,
  onGenerate,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [labels, setLabels] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || quantity < 1) return;

    onAddRequest({
      prompt,
      quantity,
      labels: labels.split(',').map(l => l.trim()).filter(Boolean),
      aspectRatio,
    });

    setPrompt('');
    setLabels('');
  };

  return (
    <div className="p-6 bg-slate-800/50 rounded-lg shadow-lg h-full overflow-y-auto flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-indigo-300">1. Configure Generation Tasks</h2>
      
      <form onSubmit={handleAddRequest} className="space-y-4 mb-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a photorealistic red apple on a wooden table"
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-1">Quantity (1-4)</label>
                <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10) || 1;
                      setQuantity(Math.min(4, Math.max(1, value)));
                    }}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    min="1"
                    max="4"
                />
            </div>
            <div>
                <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
                <select
                    id="aspectRatio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {ASPECT_RATIOS.map(ratio => (
                        <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="labels" className="block text-sm font-medium text-slate-300 mb-1">Labels (comma-separated)</label>
          <input
            type="text"
            id="labels"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            placeholder="e.g., apple, fruit, still life"
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:text-slate-400 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          disabled={isLoading || !prompt.trim()}
        >
          <PlusIcon className="w-5 h-5" /> Add to Queue
        </button>
      </form>
      
      <h3 className="text-lg font-semibold mb-3 text-indigo-300">2. Generation Queue</h3>
      <div className="flex-grow space-y-3 pr-2 overflow-y-auto">
        {requests.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Add generation tasks using the form above.</p>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-slate-700/50 p-3 rounded-md flex justify-between items-start gap-3 animate-fade-in">
              <div className="flex-1">
                <p className="font-semibold text-slate-100">{req.prompt}</p>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Qty: {req.quantity}</span>
                    <span>Ratio: {req.aspectRatio}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                    {req.labels.map(label => (
                        <span key={label} className="bg-cyan-800/50 text-cyan-300 text-xs font-medium px-2 py-0.5 rounded-full">{label}</span>
                    ))}
                </div>
              </div>
              <button
                onClick={() => onRemoveRequest(req.id)}
                className="text-slate-400 hover:text-red-400 transition"
                aria-label="Remove request"
                disabled={isLoading}
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-6">
        <button
            onClick={onGenerate}
            disabled={isLoading || requests.length === 0}
            className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 text-lg"
        >
            <GenerateIcon />
            Generate Dataset ({requests.reduce((sum, req) => sum + req.quantity, 0)} images)
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;