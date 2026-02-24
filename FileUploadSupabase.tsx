import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase, logAccessAction } from "@/services/supabaseClient";
import { MedicalFile } from "@/contexts/DashboardContext";

/**
 * File Upload Supabase Component
 * 
 * Design Philosophy: Upload Seguro com Supabase
 * - Upload para Supabase Storage
 * - Inserção em medical_files
 * - Logging em access_logs
 * - Validação rigorosa
 */

export interface FileUploadSupabaseProps {
  patientId: string;
  userId: string;
  userType: "patient" | "doctor";
  onSuccess?: (file: MedicalFile) => void;
  onError?: (error: Error) => void;
}

export function FileUploadSupabase({
  patientId,
  userId,
  userType,
  onSuccess,
  onError,
}: FileUploadSupabaseProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<MedicalFile["category"]>("report");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Upload para Supabase Storage
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `${patientId}/${Date.now()}.${fileExtension}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("health-documents")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        throw new Error(`Erro ao fazer upload: ${storageError.message}`);
      }

      setUploadProgress(50);

      // 2. Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from("health-documents")
        .getPublicUrl(fileName);

      const fileUrl = publicUrlData.publicUrl;

      setUploadProgress(75);

      // 3. Inserir registro em medical_files
      const { data: fileData, error: dbError } = await supabase
        .from("medical_files")
        .insert({
          patient_id: patientId,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_url: fileUrl,
          category,
          description,
          status: "pending",
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao registar ficheiro: ${dbError.message}`);
      }

      setUploadProgress(90);

      // 4. Registar ação em access_logs
      await logAccessAction(
        userId,
        "upload_file",
        "medical_files",
        fileData.id,
        "success",
        {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          category,
        }
      );

      setUploadProgress(100);
      setUploadSuccess(true);

      // Reset após sucesso
      setTimeout(() => {
        setSelectedFile(null);
        setCategory("report");
        setDescription("");
        setUploadProgress(0);
        setUploadSuccess(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        onSuccess?.(fileData as MedicalFile);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao fazer upload";
      setError(errorMessage);

      // Registar falha em access_logs
      await logAccessAction(
        userId,
        "upload_file",
        "medical_files",
        "unknown",
        "failure",
        { error: errorMessage }
      );

      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsUploading(false);
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
      {uploadSuccess && (
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
          {isUploading && (
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
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? (
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
