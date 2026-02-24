import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useUploadFile } from "@/hooks/useFileQueries";
import { MedicalFile } from "@/contexts/DashboardContext";

/**
 * File Upload Optimized Component
 * 
 * Design Philosophy: Upload Robusto com Progresso
 * - FormData para upload
 * - Progresso visual
 * - Validação no frontend
 * - Tratamento de erros
 */

export interface FileUploadOptimizedProps {
  patientId: string;
  onSuccess?: (file: any) => void;
  onError?: (error: Error) => void;
}

export function FileUploadOptimized({ patientId, onSuccess, onError }: FileUploadOptimizedProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<MedicalFile["category"]>("report");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadFile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > MAX_SIZE) {
      setError(`Ficheiro muito grande. Máximo: 10MB. Tamanho: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Tipo de ficheiro não permitido. Tipos aceitos: PDF, JPG, PNG, DOC, DOCX");
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      await uploadMutation.mutateAsync({
        patientId,
        file: selectedFile,
        category,
        description,
      });

      // Reset
      setSelectedFile(null);
      setCategory("report");
      setDescription("");
      setUploadProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess?.({
        name: selectedFile.name,
        size: selectedFile.size,
        category,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer upload";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadMutation.isSuccess && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Ficheiro enviado com sucesso!</p>
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
      />

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-600 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium mb-1">Clique ou arraste para enviar ficheiro</p>
        <p className="text-sm text-gray-500">Máximo 10MB • PDF, JPG, PNG, DOC, DOCX</p>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">
                  {selectedFile.name.split(".").pop()?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MedicalFile["category"])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="report">Relatório Médico</option>
              <option value="exam">Exame</option>
              <option value="prescription">Prescrição</option>
              <option value="wound_photo">Foto da Ferida</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição do ficheiro..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Progress Bar */}
          {uploadMutation.isPending && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Enviando...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar Ficheiro
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
}
