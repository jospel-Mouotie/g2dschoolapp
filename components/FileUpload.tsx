// components/FileUpload.tsx
"use client";
import { useState, useRef } from "react";
import { Upload, X, FileText, Image, File } from "lucide-react";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // en Mo
}

export default function FileUpload({ onUpload, multiple = true, accept = ".pdf,.jpg,.png,.doc,.docx", maxSize = 10 }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(f => f.size <= maxSize * 1024 * 1024);
    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText size={20} className="text-red-500" />;
    if (type.includes('image')) return <Image size={20} className="text-blue-500" />;
    return <File size={20} className="text-slate-500" />;
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload size={32} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium">Cliquez ou glissez vos fichiers</p>
          <p className="text-xs text-slate-400 mt-1">
            {accept.split(',').join(', ')} · Max {maxSize} Mo par fichier
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{files.length} fichier(s) sélectionné(s)</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} Mo
                  </span>
                </div>
                <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => onUpload(files)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Uploader les fichiers
          </button>
        </div>
      )}
    </div>
  );
}