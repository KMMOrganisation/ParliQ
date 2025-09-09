import React from 'react';
import { Plus, Youtube, Upload, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { IngestionProgress, ProcessedVideo } from '../../types/video';
import { VideoIngestionService } from '../../services/videoIngestion';

interface VideoIngestionPanelProps {
  onVideoProcessed: (video: ProcessedVideo) => void;
  onClose: () => void;
}

export function VideoIngestionPanel({ onVideoProcessed, onClose }: VideoIngestionPanelProps) {
  const [url, setUrl] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState<IngestionProgress | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [processedVideos, setProcessedVideos] = React.useState<ProcessedVideo[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setProgress(null);

    try {
      const processedVideo = await VideoIngestionService.processVideo(
        url.trim(),
        (progressUpdate) => setProgress(progressUpdate)
      );

      setProcessedVideos(prev => [...prev, processedVideo]);
      onVideoProcessed(processedVideo);
      setUrl('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const getProgressColor = (stage: IngestionProgress['stage']) => {
    switch (stage) {
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getProgressIcon = (stage: IngestionProgress['stage']) => {
    switch (stage) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Add YouTube Content</h2>
              <p className="text-sm text-slate-400">Process videos or channels to build the knowledge graph</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 p-2"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="youtube-url" className="block text-sm font-medium text-slate-300 mb-2">
                YouTube URL
              </label>
              <div className="flex space-x-3">
                <input
                  id="youtube-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or channel URL"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={!url.trim() || isProcessing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Process</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              <p className="mb-1">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Individual videos: youtube.com/watch?v=VIDEO_ID</li>
                <li>Channels: youtube.com/@channel or youtube.com/channel/CHANNEL_ID</li>
                <li>Short URLs: youtu.be/VIDEO_ID</li>
              </ul>
            </div>
          </form>

          {/* Progress Display */}
          {progress && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center space-x-3 mb-3">
                <div className={getProgressColor(progress.stage)}>
                  {getProgressIcon(progress.stage)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{progress.message}</p>
                  <p className="text-xs text-slate-400">Video ID: {progress.videoId}</p>
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {progress.progress}%
                </span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.stage === 'error' ? 'bg-red-500' : 
                    progress.stage === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {progress.error && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <p className="text-sm text-red-300">{progress.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && !progress && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Processed Videos List */}
          {processedVideos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Recently Processed</h3>
              <div className="space-y-3">
                {processedVideos.map((video) => (
                  <div key={video.metadata.id} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start space-x-3">
                      <img
                        src={video.metadata.thumbnailUrl}
                        alt={video.metadata.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-200 text-sm mb-1 truncate">
                          {video.metadata.title}
                        </h4>
                        <p className="text-xs text-slate-400 mb-2">
                          {video.metadata.channel} • {Math.floor(video.metadata.duration / 60)}m {video.metadata.duration % 60}s
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>{video.transcript.length} segments</span>
                          <span>{video.entities.length} entities</span>
                          <a
                            href={video.metadata.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View</span>
                          </a>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-200 mb-2">API Keys Required</h4>
            <p className="text-xs text-amber-300 mb-3">
              Configure these environment variables in your deployment platform:
            </p>
            <div className="bg-slate-800 rounded p-3 font-mono text-xs text-slate-300 space-y-1">
              <div>VITE_YOUTUBE_API_KEY</div>
              <div>VITE_GEMINI_API_KEY (optional)</div>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <p className="text-amber-400">
                <strong>Netlify:</strong> Add in Site Settings → Environment Variables
              </p>
              <p className="text-amber-400">
                <strong>Local:</strong> Add to .env file in project root
              </p>
              <p className="text-slate-400">
                YouTube API key is required. Gemini API key enables AI entity extraction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}