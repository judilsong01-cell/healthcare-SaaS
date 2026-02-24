import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Pill,
  Calendar,
  Heart,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  Clock,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Patient Dashboard
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Real-time medication tracking
 * - Health progress visualization
 * - Daily check-in system
 * - Alert notifications
 */

export default function PatientDashboard() {
  const { currentPatient, updateMedicationStatus, userType, setUserType } =
    useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInData, setCheckInData] = useState({
    temperature: 36.8,
    painLevel: 2,
    symptoms: [] as string[],
    notes: "",
  });

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const temperatureData = currentPatient.healthCheckIns
    .slice()
    .reverse()
    .map((check) => ({
      date: new Date(check.date).toLocaleDateString("pt-PT", {
        month: "short",
        day: "numeric",
      }),
      temperature: check.temperature,
      painLevel: check.painLevel,
    }));

  const medicationTakenToday = currentPatient.medications.filter(
    (m) => m.taken
  ).length;
  const totalMedications = currentPatient.medications.length;

  const handleMedicationToggle = (medicationId: string) => {
    const medication = currentPatient.medications.find((m) => m.id === medicationId);
    if (medication) {
      updateMedicationStatus(medicationId, !medication.taken);
    }
  };

  const handleCheckInSubmit = () => {
    // In a real app, this would send data to backend
    setShowCheckInModal(false);
    setCheckInData({
      temperature: 36.8,
      painLevel: 2,
      symptoms: [],
      notes: "",
    });
  };

  const handleLogout = () => {
    setUserType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="container flex items-center justify-between h-16">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-display text-xl font-bold text-gray-900">
                HealthCare
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bell className="w-5 h-5" />
              <span>2 alertas</span>
            </div>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container py-4 flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo, {currentPatient.name}!
          </h1>
          <p className="text-gray-600">
            Cirurgia de {currentPatient.surgeryType} realizada em{" "}
            {new Date(currentPatient.surgeryDate).toLocaleDateString("pt-PT")}
          </p>
        </div>

        {/* Recovery Progress */}
        <Card className="p-8 mb-8 border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4">
                Progresso de Recuperação
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-green-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${currentPatient.recoveryProgress}%` }}
                    />
                  </div>
                </div>
                <span className="font-display text-2xl font-bold text-blue-600">
                  {currentPatient.recoveryProgress}%
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Você está no caminho certo! Continue seguindo o plano de
                recuperação.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Medications Today */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Medicações Hoje</p>
                <p className="font-display text-3xl font-bold text-blue-600">
                  {medicationTakenToday}/{totalMedications}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {totalMedications - medicationTakenToday} pendentes
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          {/* Last Check-In */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Último Check-In</p>
                <p className="font-display text-lg font-bold text-gray-900">
                  Hoje
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(currentPatient.lastCheckIn || "").toLocaleTimeString(
                    "pt-PT"
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Temperature */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Temperatura</p>
                <p className="font-display text-3xl font-bold text-gray-900">
                  {currentPatient.healthCheckIns[0]?.temperature || 36.8}°C
                </p>
                <p className="text-xs text-gray-500 mt-2">Normal</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-red-600" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        </div>

        {/* Medications Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Medications List */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-gray-200">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
                Medicações de Hoje
              </h2>
              <div className="space-y-4">
                {currentPatient.medications.map((medication) => (
                  <div
                    key={medication.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={medication.taken}
                        onChange={() => handleMedicationToggle(medication.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            medication.taken
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {medication.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        {medication.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {medication.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {medication.time}
                      </span>
                    </div>
                    {medication.taken && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-6">
            <Card className="p-6 border-gray-200">
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowCheckInModal(true)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Fazer Check-In
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Reportar Problema
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Consulta
                </Button>
              </div>
            </Card>

            {/* Alerts */}
            <Card className="p-6 border-gray-200 border-yellow-200 bg-yellow-50">
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Alertas
              </h3>
              <div className="space-y-2">
                {currentPatient.alerts
                  .filter((a) => a.type !== "info")
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="text-sm p-2 bg-white rounded border border-yellow-200"
                    >
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600">{alert.message}</p>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Health Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Temperature Chart */}
          <Card className="p-8 border-gray-200">
            <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
              Evolução da Temperatura
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[36, 39]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#0066cc"
                  strokeWidth={2}
                  dot={{ fill: "#0066cc", r: 4 }}
                  name="Temperatura (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Pain Level Chart */}
          <Card className="p-8 border-gray-200">
            <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
              Nível de Dor
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="painLevel"
                  fill="#10b981"
                  name="Nível de Dor (1-5)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Health Check-Ins History */}
        <Card className="p-8 border-gray-200">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
            Histórico de Check-Ins
          </h2>
          <div className="space-y-4">
            {currentPatient.healthCheckIns.slice(0, 5).map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    checkIn.status === "critical"
                      ? "bg-red-50"
                      : checkIn.status === "warning"
                        ? "bg-yellow-50"
                        : "bg-green-50"
                  }`}
                >
                  {checkIn.status === "critical" ? (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  ) : checkIn.status === "warning" ? (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">
                      {new Date(checkIn.date).toLocaleDateString("pt-PT", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        checkIn.status === "critical"
                          ? "bg-red-100 text-red-700"
                          : checkIn.status === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {checkIn.status === "critical"
                        ? "Crítico"
                        : checkIn.status === "warning"
                          ? "Aviso"
                          : "Normal"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Temperatura: {checkIn.temperature}°C • Dor: {checkIn.painLevel}/5
                  </p>
                  {checkIn.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {checkIn.symptoms.map((symptom, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{checkIn.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-gray-200">
            <div className="p-6">
              <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
                Check-In de Saúde
              </h2>

              <div className="space-y-4 mb-6">
                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="40"
                    value={checkInData.temperature}
                    onChange={(e) =>
                      setCheckInData({
                        ...checkInData,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Pain Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Dor (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={checkInData.painLevel}
                    onChange={(e) =>
                      setCheckInData({
                        ...checkInData,
                        painLevel: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5,
                      })
                    }
                    className="w-full"
                  />
                  <div className="text-center mt-2">
                    <span className="font-display text-2xl font-bold text-blue-600">
                      {checkInData.painLevel}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={checkInData.notes}
                    onChange={(e) =>
                      setCheckInData({ ...checkInData, notes: e.target.value })
                    }
                    placeholder="Descreva como se sente..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700"
                  onClick={() => setShowCheckInModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleCheckInSubmit}
                >
                  Enviar Check-In
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
