import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { FileUploadOptimized } from "@/components/FileUploadOptimized";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  Trash2,
  FileText,
  Image,
  File,
  Lock,
  Menu,
  X,
  LogOut,
  Plus,
  Clock,
  Shield,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Patient Files Management Page
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Secure file management
 * - Upload and download functionality
 * - Access control and encryption
 * - Activity logging
 */

export default function PatientFiles() {
  const { currentPatient, files, logout } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  const patientFiles = files.filter((f) => f.patient_id === currentPatient.id);

  const getFileIcon = (category: string) => {
    switch (category) {
      case "report":
        return <FileText className="w-5 h-5" />;
      case "exam":
        return <Image className="w-5 h-5" />;
      case "prescription":
        return <FileText className="w-5 h-5" />;
      case "wound_photo":
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">HealthCare</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard/patient" className="text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/files/patient" className="text-blue-600 font-medium">
              Ficheiros
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </nav>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="flex flex-col p-4 gap-3">
              <Link href="/dashboard/patient" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/files/patient" className="text-blue-600 font-medium">
                Ficheiros
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-center flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Ficheiros Médicos</h1>
          <p className="text-gray-600">
            Gerencie e partilhe seus documentos médicos de forma segura
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Enviar Novo Ficheiro
          </Button>

          {showUploadForm && (
            <Card className="mt-4 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Ficheiro</h2>
              <FileUploadOptimized
                patientId={currentPatient.id}
                onSuccess={() => {
                  setShowUploadForm(false);
                }}
              />
            </Card>
          )}
        </div>

        {/* Files List */}
        <div className="grid gap-4">
          {patientFiles.length === 0 ? (
            <Card className="p-8 text-center">
              <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum ficheiro enviado ainda</p>
              <p className="text-sm text-gray-500 mt-1">
                Comece a enviar seus documentos médicos
              </p>
            </Card>
          ) : (
            patientFiles.map((file) => (
              <Card
                key={file.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedFile(selectedFile === file.id ? null : file.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                      {getFileIcon(file.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{file.file_name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(file.created_at).toLocaleDateString("pt-PT")}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {file.category}
                        </span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          {file.status}
                        </span>
                        {file.status === "approved" && (
                          <Lock className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedFile === file.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tamanho</p>
                        <p className="font-medium text-gray-900">
                          {(file.file_size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tipo</p>
                        <p className="font-medium text-gray-900">{file.file_type}</p>
                      </div>
                      {file.description && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Descrição</p>
                          <p className="font-medium text-gray-900">{file.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
