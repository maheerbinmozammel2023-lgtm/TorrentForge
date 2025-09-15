import React, { useState, useCallback } from 'react';
import { TorrentType, SourceType, TorrentInfo, CreatedTorrentData } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FileIcon } from './icons/FileIcon';
import { CloudIcon } from './icons/CloudIcon';
import { DownloadIcon } from './icons/DownloadIcon';

const pieceSizes = [
  "Auto", "16 KB", "32 KB", "64 KB", "128 KB", "256 KB", "512 KB",
  "1 MB", "2 MB", "4 MB", "8 MB", "16 MB", "32 MB"
];

const defaultTrackers = [
    "udp://tracker.openbittorrent.com:80/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker.internetwarriors.net:1337/announce"
];

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
    <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

const ResultDisplay: React.FC<{ data: CreatedTorrentData; onDownload: () => void; onReset: () => void }> = ({ data, onDownload, onReset }) => {
    
    const renderInfoHash = (label: string, hash?: string) => {
        if (!hash) return null;
        return (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-700">
                <dt className="text-slate-400 font-medium">{label}</dt>
                <dd className="text-white font-mono text-sm mt-1 sm:mt-0 break-all">{hash}</dd>
            </div>
        )
    }

    return (
        <div className="bg-slate-800 border border-blue-500/50 rounded-lg p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">Torrent Created Successfully!</h2>
            
            <dl className="divide-y divide-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3">
                    <dt className="text-slate-400 font-medium">Content Name</dt>
                    <dd className="text-white font-semibold mt-1 sm:mt-0">{data.fileName}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3">
                    <dt className="text-slate-400 font-medium">Total Size</dt>
                    <dd className="text-white mt-1 sm:mt-0">{data.fileSize}</dd>
                </div>
                {renderInfoHash("Info Hash (v1)", data.infoHashV1)}
                {renderInfoHash("Info Hash (v2)", data.infoHashV2)}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3">
                    <dt className="text-slate-400 font-medium">Torrent Type</dt>
                    <dd className="text-white uppercase mt-1 sm:mt-0">{data.torrentType}</dd>
                </div>
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3">
                    <dt className="text-slate-400 font-medium">Piece Size</dt>
                    <dd className="text-white mt-1 sm:mt-0">{data.pieceSize} ({data.totalPieces} pieces)</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3">
                    <dt className="text-slate-400 font-medium">Trackers</dt>
                    <dd className="text-white text-sm mt-1 sm:mt-0">
                        <ul>
                            {data.trackers.map((t, i) => <li key={i} className="truncate">{t}</li>)}
                        </ul>
                    </dd>
                </div>
            </dl>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onDownload}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors"
                >
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Download .torrent
                </button>
                 <button
                    onClick={onReset}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-colors"
                >
                    Create Another
                </button>
            </div>
        </div>
    );
};

export const TorrentCreator: React.FC = () => {
  const [torrentInfo, setTorrentInfo] = useState<TorrentInfo>({
    sourceType: SourceType.Local,
    sourceUrl: '',
    torrentType: TorrentType.Hybrid,
    trackers: defaultTrackers,
    pieceSize: 'Auto',
    isPrivate: false,
    comment: '',
  });
  const [newTracker, setNewTracker] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdTorrentData, setCreatedTorrentData] = useState<CreatedTorrentData | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [cloudFileInfo, setCloudFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);


  const handleAddTracker = () => {
    if (newTracker && !torrentInfo.trackers.includes(newTracker)) {
      try {
        new URL(newTracker); // Basic validation
        setTorrentInfo(prev => ({...prev, trackers: [...prev.trackers, newTracker]}));
        setNewTracker('');
      } catch (_) {
        setError("Invalid tracker URL format.");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleRemoveTracker = (index: number) => {
    setTorrentInfo(prev => ({
        ...prev, 
        trackers: prev.trackers.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTorrentInfo(prev => ({ ...prev, sourceFiles: Array.from(e.target.files!) }));
      setError(null);
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setTorrentInfo(prev => ({ ...prev, sourceFiles: Array.from(e.dataTransfer.files) }));
        setError(null);
    }
  }, []);

  const handleSourceTypeChange = useCallback((newType: SourceType) => {
    setTorrentInfo(prev => ({
        ...prev,
        sourceType: newType,
        sourceFiles: newType === SourceType.Cloud ? undefined : prev.sourceFiles,
        sourceUrl: newType === SourceType.Local ? '' : prev.sourceUrl,
    }));
    
    if (newType === SourceType.Local) {
        setCloudFileInfo(null);
        setMetadataError(null);
    }
    setError(null);
  }, []);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTorrentInfo(prev => ({...prev, sourceUrl: e.target.value}));
    if (cloudFileInfo) {
        setCloudFileInfo(null);
    }
    if (metadataError) {
        setMetadataError(null);
    }
    if(error) {
        setError(null);
    }
  }, [cloudFileInfo, metadataError, error]);

  const handleFetchMetadata = useCallback(async () => {
    if (!torrentInfo.sourceUrl) {
        setMetadataError("Please enter a URL.");
        return;
    }
    try {
        new URL(torrentInfo.sourceUrl);
    } catch (_) {
        setMetadataError("Invalid URL format.");
        return;
    }

    setIsFetchingMetadata(true);
    setMetadataError(null);
    setCloudFileInfo(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success or failure for demonstration
    if (torrentInfo.sourceUrl.includes("fail")) {
        setMetadataError("Could not fetch file metadata. The URL might be incorrect or the server is not accessible.");
    } else {
        const fileName = torrentInfo.sourceUrl.substring(torrentInfo.sourceUrl.lastIndexOf('/') + 1) || "file_from_url.dat";
        const fileSize = Math.floor(Math.random() * 1e9) + 1e6; // Random size for demo
        setCloudFileInfo({ name: fileName, size: fileSize });
    }
    setIsFetchingMetadata(false);
  }, [torrentInfo.sourceUrl]);
  
  const createMockTorrentData = useCallback((): CreatedTorrentData => {
      const isLocal = torrentInfo.sourceType === SourceType.Local;
      let fileName = "unknown_file";
      let fileSizeNum = 0;

      if (isLocal && torrentInfo.sourceFiles && torrentInfo.sourceFiles.length > 0) {
          const files = torrentInfo.sourceFiles;
          fileSizeNum = files.reduce((sum, f) => sum + f.size, 0);

          if (files.length === 1) {
              fileName = files[0].name;
          } else {
              const firstPath = files[0].webkitRelativePath;
              if (firstPath) {
                  fileName = firstPath.split('/')[0];
              } else {
                  fileName = `${files.length} files`;
              }
          }
      } else if (!isLocal && cloudFileInfo) {
          fileName = cloudFileInfo.name;
          fileSizeNum = cloudFileInfo.size;
      }
      
      const generateInfoHash = () => [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      return {
          ...torrentInfo,
          fileName: fileName,
          fileSize: fileSizeNum ? (fileSizeNum / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown',
          infoHashV1: [TorrentType.V1, TorrentType.Hybrid].includes(torrentInfo.torrentType) ? generateInfoHash() : undefined,
          infoHashV2: [TorrentType.V2, TorrentType.Hybrid].includes(torrentInfo.torrentType) ? generateInfoHash() : undefined,
          creationDate: new Date().toISOString(),
          totalPieces: fileSizeNum ? Math.ceil(fileSizeNum / (1024 * parseInt(torrentInfo.pieceSize) || 1024*512)) : 0, // Approximate
      };
  }, [torrentInfo, cloudFileInfo]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (torrentInfo.sourceType === SourceType.Local && (!torrentInfo.sourceFiles || torrentInfo.sourceFiles.length === 0)) {
        setError('Please select one or more files, or a folder.');
        return;
    }
    if (torrentInfo.sourceType === SourceType.Cloud) {
        if (!torrentInfo.sourceUrl) {
            setError('Please enter a file URL.');
            return;
        }
        if (!cloudFileInfo) {
            setError('Please fetch file information from the URL first.');
            return;
        }
    }
    setError(null);
    setIsLoading(true);
    setCreatedTorrentData(null);
    
    setTimeout(() => {
        const mockData = createMockTorrentData();
        setCreatedTorrentData(mockData);
        setIsLoading(false);
    }, 2500);
  }, [torrentInfo, cloudFileInfo, createMockTorrentData]);
  
  const handleDownload = () => {
    if (!createdTorrentData) return;
    const content = `
[TORRENTFORGE MOCK FILE]

File Name: ${createdTorrentData.fileName}
File Size: ${createdTorrentData.fileSize}
Torrent Type: ${createdTorrentData.torrentType}
${createdTorrentData.infoHashV1 ? `Info Hash v1: ${createdTorrentData.infoHashV1}` : ''}
${createdTorrentData.infoHashV2 ? `Info Hash v2: ${createdTorrentData.infoHashV2}` : ''}

Trackers:
${createdTorrentData.trackers.join('\n')}

Comment: ${createdTorrentData.comment || 'N/A'}
Private: ${createdTorrentData.isPrivate}
    `;
    const blob = new Blob([content.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdTorrentData.fileName}.torrent`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleReset = () => {
    setCreatedTorrentData(null);
    setTorrentInfo(prev => ({
        ...prev,
        sourceFiles: undefined,
        sourceUrl: '',
    }));
    setCloudFileInfo(null);
    setMetadataError(null);
  }

  const isFormValid =
    (torrentInfo.sourceType === SourceType.Local && !!torrentInfo.sourceFiles && torrentInfo.sourceFiles.length > 0) ||
    (torrentInfo.sourceType === SourceType.Cloud && !!cloudFileInfo);

  const renderSelectedFiles = () => {
    if (!torrentInfo.sourceFiles || torrentInfo.sourceFiles.length === 0) return null;

    const files = torrentInfo.sourceFiles;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    
    let displayName = '';
    if (files.length === 1) {
        displayName = files[0].name;
    } else {
        const firstPath = files[0].webkitRelativePath;
        if (firstPath) {
            displayName = `Folder: ${firstPath.split('/')[0]}`;
        } else {
            displayName = `${files.length} files selected`;
        }
    }

    return (
        <div className="text-sm text-white pt-2 text-left">
            <p className="font-semibold truncate">{displayName}</p>
            {files.length > 1 && <p className="text-xs text-slate-400">{files.length} files</p>}
            <p className="text-xs text-slate-400">Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
    )
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-10 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-white">Forging your torrent...</p>
        </div>
    )
  }

  if (createdTorrentData) {
      return <ResultDisplay data={createdTorrentData} onDownload={handleDownload} onReset={handleReset} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card title="Source File">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900 p-1 mb-4">
            {(Object.values(SourceType)).map(type => (
                <button
                    key={type}
                    type="button"
                    onClick={() => handleSourceTypeChange(type)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2 ${torrentInfo.sourceType === type ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                    {type === SourceType.Local ? <FileIcon className="h-5 w-5" /> : <CloudIcon className="h-5 w-5" />}
                    <span>{type === SourceType.Local ? 'Local File' : 'Cloud URL'}</span>
                </button>
            ))}
        </div>
        {torrentInfo.sourceType === SourceType.Local ? (
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <label className="block text-sm font-medium text-slate-400 mb-2">Select a folder or drag & drop files</label>
                <div className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-blue-500 bg-slate-800/50' : 'border-slate-600'}`}>
                    <div className="space-y-1 text-center">
                        <FileIcon className="mx-auto h-12 w-12 text-slate-500" />
                        <div className="flex text-sm text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 focus-within:ring-offset-slate-900">
                                <span>Select a folder</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} {...{webkitdirectory: ""}} />
                            </label>
                            <p className="pl-1">or drag and drop files</p>
                        </div>
                        {torrentInfo.sourceFiles && torrentInfo.sourceFiles.length > 0 ? (
                            <div className="pt-2">
                               {renderSelectedFiles()}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">Any files up to your browser's limit</p>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div>
                 <label htmlFor="source-url" className="block text-sm font-medium text-slate-400">File URL</label>
                 <div className="mt-1 flex flex-col sm:flex-row gap-2">
                    <input
                        type="url"
                        id="source-url"
                        placeholder="https://example.com/file.zip"
                        value={torrentInfo.sourceUrl}
                        onChange={handleUrlChange}
                        disabled={isFetchingMetadata}
                        className="flex-grow bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={handleFetchMetadata}
                        disabled={isFetchingMetadata || !torrentInfo.sourceUrl}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-600 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 transition-colors"
                    >
                        {isFetchingMetadata ? (
                             <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                        ) : (
                           'Fetch Info'
                        )}
                    </button>
                 </div>
                 {metadataError && <p className="text-red-500 text-sm mt-2">{metadataError}</p>}
                 {cloudFileInfo && (
                    <div className="mt-4 p-4 bg-slate-900/70 border border-slate-700 rounded-lg flex items-center gap-4 animate-fade-in">
                        <FileIcon className="h-8 w-8 text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-white truncate">{cloudFileInfo.name}</p>
                            <p className="text-sm text-slate-400">{(cloudFileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                 )}
            </div>
        )}
      </Card>

      <Card title="Trackers">
        <div className="space-y-2">
            {torrentInfo.trackers.map((tracker, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-900/70 p-2 rounded-md">
                    <p className="text-sm text-slate-300 truncate font-mono">{tracker}</p>
                    <button type="button" onClick={() => handleRemoveTracker(index)} className="p-1 text-slate-500 hover:text-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
         <div className="mt-4 flex gap-2">
            <input
                type="text"
                value={newTracker}
                onChange={(e) => setNewTracker(e.target.value)}
                placeholder="udp://tracker.example.com:1337/announce"
                className="flex-grow bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
                type="button"
                onClick={handleAddTracker}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900"
            >
               <PlusIcon className="h-5 w-5" />
            </button>
        </div>
      </Card>
      
       <Card title="Advanced Options">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="text-base font-medium text-slate-400 mb-2">Torrent Type</h4>
                <div className="flex flex-col sm:flex-row rounded-lg bg-slate-900 p-1 space-y-1 sm:space-y-0 sm:space-x-1">
                    {Object.values(TorrentType).map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setTorrentInfo(prev => ({...prev, torrentType: type}))}
                            className={`flex-1 capitalize text-sm font-semibold py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${torrentInfo.torrentType === type ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <label htmlFor="piece-size" className="block text-base font-medium text-slate-400 mb-2">Piece Size</label>
                <select 
                    id="piece-size"
                    value={torrentInfo.pieceSize}
                    onChange={e => setTorrentInfo(prev => ({...prev, pieceSize: e.target.value}))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    {pieceSizes.map(size => <option key={size} value={size}>{size}</option>)}
                </select>
            </div>
         </div>
         <div className="mt-6 flex items-start">
             <div className="flex items-center h-5">
                 <input 
                    id="is-private"
                    type="checkbox"
                    checked={torrentInfo.isPrivate}
                    onChange={e => setTorrentInfo(prev => ({...prev, isPrivate: e.target.checked}))}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-600 rounded bg-slate-700"
                 />
             </div>
             <div className="ml-3 text-sm">
                 <label htmlFor="is-private" className="font-medium text-slate-300">Private Torrent</label>
                 <p className="text-slate-500">Disables DHT and PEX, for use with private trackers only.</p>
             </div>
         </div>
       </Card>
      
      <Card title="Comment">
        <div>
            <label htmlFor="comment" className="block text-base font-medium text-slate-400 mb-2 sr-only">Comment</label>
            <textarea
                id="comment"
                rows={3}
                value={torrentInfo.comment}
                onChange={e => setTorrentInfo(prev => ({...prev, comment: e.target.value}))}
                placeholder="Add an optional comment to your torrent"
                className="w-full bg-slate-900 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
            />
        </div>
      </Card>

      <div>
        {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all duration-200 transform hover:scale-105 disabled:bg-blue-800/50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:text-slate-400"
        >
          Create Torrent
        </button>
      </div>
    </form>
  );
};
