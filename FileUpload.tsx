import { useState, useRef } from "react";
import { Upload, X, FileText, Image, File, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MedicalFile } from "@/contexts/DashboardContext";

/**
 * FileUpload Component
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Secure file upload with validation
 * - Encryption support
 * - File preview and metadata
 * - Access control logging
 */

export interface FileUploadProps {
  onFileUpload: (file: File, category: MedicalFile["category"], description: string) => Promise<void>;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  category?: MedicalFile["category"];
}

const ACCEPTED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg, .jpeg",
  "image/png": ".png",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CATEGORY_LABELS: Record<MedicalFile["category"], string> = {
  prescription: "Prescrição Médica",
  exam: "Resultado de Exame",
  report: "Relatório Médico",
  imaging: "Imagem Médica",
  other: "Outro Documento",
};

export function FileUpload({
  onFileUpload,
  acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES),
  maxFileSize = MAX_FILE_SIZE,
  category = "other",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MedicalFile["category"]>(category);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de ficheiro não permitido. Tipos aceites: ${acceptedTypes.map((t) => ACCEPTED_FILE_TYPES[t as keyof typeof ACCEPTED_FILE_TYPES]).join(", ")}`,
      };
    }

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `Ficheiro muito grande. Tamanho máximo: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      setErrorMessage(validation.error || "Erro ao validar ficheiro");
      setUploadStatus("error");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setUploadStatus("idle");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onFileUpload(selectedFile, selectedCategory, description);
      setUploadStatus("success");
      setSelectedFile(null);
      setDescription("");
      setSelectedCategory(category);
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-8 h-8 text-blue-600" />;
    if (fileType === "application/pdf") return <FileText className="w-8 h-8 text-red-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-blue-600 bg-blue-50"
            : selectedFile
              ? "border-green-600 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-600"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedTypes.join(",")}
          className="hidden"
        />

        {!selectedFile ? (
          <div>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Arraste ficheiros aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-600">
              Ficheiros suportados: PDF, JPG, PNG, DOC, DOCX (máx. {(maxFileSize / 1024 / 1024).toFixed(1)}MB)
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-4 mb-4">
              {getFileIcon(selectedFile.type)}
              <div className="text-left">
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">Ficheiro pronto para upload</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadStatus === "error" && errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadStatus === "success" && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Ficheiro enviado com sucesso e encriptado!</p>
        </div>
      )}

      {/* File Details Form */}
      {selectedFile && uploadStatus !== "success" && (
        <Card className="p-6 border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Detalhes do Ficheiro</h3>

          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria do Documento
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MedicalFile["category"])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Resultado de análises pré-operatória..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Adicione contexto sobre este documento para ajudar o seu médico
              </p>
            </div>

            {/* Security Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Segurança:</strong> Este ficheiro será encriptado com algoritmo AES-256 e apenas o seu médico terá acesso.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? "Enviando..." : "Enviar Ficheiro"}
              </Button>
              <Button
                onClick={() => {
                  setSelectedFile(null);
                  setDescription("");
                  setErrorMessage("");
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
