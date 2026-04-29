import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  if (selectedFile) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-slate-800">{selectedFile.name}</p>
              <p className="text-sm text-slate-600">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="text-slate-600 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-slate-300 bg-slate-50 hover:border-slate-400"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? "text-blue-500" : "text-slate-400"}`} />
      <p className="text-lg font-medium text-slate-700 mb-2">
        {isDragActive ? "Drop the file here" : "Drag & drop your file here"}
      </p>
      <p className="text-sm text-slate-500 mb-4">
        or click to browse
      </p>
      <p className="text-xs text-slate-400">
        Supported formats: CSV, XLS, XLSX (Max 10MB)
      </p>
    </div>
  );
}
