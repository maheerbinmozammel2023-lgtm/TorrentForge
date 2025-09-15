import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { FileIcon } from './icons/FileIcon';

interface FilePreview {
  name: string;
  size: number;
  content: string;
  isText: boolean;
  isLoading: boolean;
}

interface FilePreviewModalProps {
  files: File[];
  onClose: () => void;
}

const PREVIEW_SIZE_BYTES = 1024; // 1 KB

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ files, onClose }) => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  useEffect(() => {
    const loadPreviews = async () => {
      const initialPreviews: FilePreview[] = files.map(file => ({
        name: file.name,
        size: file.size,
        content: '',
        isText: false,
        isLoading: true,
      }));
      setPreviews(initialPreviews);

      const processFile = async (file: File): Promise<Omit<FilePreview, 'isLoading'>> => {
        const slice = file.slice(0, PREVIEW_SIZE_BYTES);
        const buffer = await slice.arrayBuffer();

        // Try to decode as text
        const textDecoder = new TextDecoder('utf-8', { fatal: true });
        let content = '';
        let isText = false;
        try {
          const decodedText = textDecoder.decode(buffer);
          // Simple heuristic for binary: check for null bytes
          if (!decodedText.includes('\0')) {
            content = decodedText;
            isText = true;
          }
        } catch (e) {
          // Decoding failed, it's binary
        }

        if (!isText) {
          // Generate hex dump
          const view = new Uint8Array(buffer);
          content = [...view].map(b => b.toString(16).padStart(2, '0')).join(' ');
        }
        
        if (file.size > PREVIEW_SIZE_BYTES) {
            content += '\n\n... (preview truncated at 1KB)';
        }

        return { name: file.name, size: file.size, content, isText };
      };

      const resolvedPreviews = await Promise.all(
          files.map(async file => {
              const result = await processFile(file);
              return { ...result, isLoading: false };
          })
      );
      
      setPreviews(resolvedPreviews);
    };

    if (files.length > 0) {
        loadPreviews();
    }
  }, [files]);

  return (
    <div 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-preview-title"
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="file-preview-title" className="text-xl font-semibold text-white">File Preview</h2>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="Close file preview"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto space-y-6">
          {previews.map((preview, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex items-center gap-3 p-3 border-b border-slate-700">
                <FileIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div className="flex-grow min-w-0">
                    <p className="font-medium text-white truncate">{preview.name}</p>
                    <p className="text-xs text-slate-500">{(preview.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <div className="p-4">
                {preview.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
                        <span>Loading preview...</span>
                    </div>
                ) : (
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all bg-slate-900 p-3 rounded-md max-h-60 overflow-y-auto font-mono">
                        <code>{preview.content}</code>
                    </pre>
                )}
              </div>
            </div>
          ))}
        </main>
        
        <footer className="p-4 border-t border-slate-700 flex-shrink-0 flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 transition-colors"
            >
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};
