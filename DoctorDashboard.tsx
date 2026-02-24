import { useState } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
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
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Bell,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Doctor Dashboard
 * Design Philosophy: Swiss Minimalism + Clinical Trust
 * - Patient monitoring and management
 * - Real-time alerts
 * - Recovery analytics
 * - Communication center
 */

export default function DoctorDashboard() {
  const { currentDoctor, getPatientsList, getActiveAlerts, markAlertAsRead, userType, setUserType } =
    useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [alertsFilter, setAlertsFilter] = useState<"all" | "unread">("unread");

  if (!currentDoctor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Carregando dados do médico...</p>
        </div>
      </div>
    );
  }

  const patients = getPatientsList();
  const allAlerts = getActiveAlerts();
  const filteredAlerts =
    alertsFilter === "unread" ? allAlerts.filter((a) => !a.read) : allAlerts;

  // Recovery stats
  const recoveryStats = patients.map((p) => ({
    name: p.name.split(" ")[0],
    progress: p.recoveryProgress,
  }));

  // Alert distribution
  const alertDistribution = [
    {
      name: "Críticos",
      value: allAlerts.filter((a) => a.type === "critical").length,
      color: "#ef4444",
    },
    {
      name: "Avisos",
      value: allAlerts.filter((a) => a.type === "warning").length,
      color: "#f59e0b",
    },
    {
      name: "Info",
      value: allAlerts.filter((a) => a.type === "info").length,
      color: "#3b82f6",
    },
  ];

  const handleLogout = () => {
    setUserType(null);
  };

  const handleAlertClick = (alertId: string) => {
    markAlertAsRead(alertId);
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
              <Bell className="w-5 h-5 relative">
                {filteredAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full" />
                )}
              </Bell>
              <span>{filteredAlerts.length} alertas</span>
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
            Bem-vindo, Dr. {currentDoctor.name.split(" ")[1]}!
          </h1>
          <p className="text-gray-600">
            Especialidade: {currentDoctor.specialty}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Patients */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total de Pacientes</p>
                <p className="font-display text-3xl font-bold text-blue-600">
                  {patients.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          {/* Active Alerts */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Alertas Ativos</p>
                <p className="font-display text-3xl font-bold text-red-600">
                  {allAlerts.filter((a) => !a.read).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          {/* Recovery Average */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Progresso Médio</p>
                <p className="font-display text-3xl font-bold text-green-600">
                  {Math.round(
                    patients.reduce((sum, p) => sum + p.recoveryProgress, 0) /
                      patients.length
                  )}
                  %
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          {/* Completed Check-Ins */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Check-Ins Hoje</p>
                <p className="font-display text-3xl font-bold text-blue-600">
                  {patients.filter((p) => p.lastCheckIn).length}/{patients.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Alerts Section */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-semibold text-gray-900">
                  Alertas em Tempo Real
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlertsFilter("unread")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      alertsFilter === "unread"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Não Lidos
                  </button>
                  <button
                    onClick={() => setAlertsFilter("all")}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      alertsFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleAlertClick(alert.id)}
                      className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                        alert.read
                          ? "bg-gray-50 border-gray-200"
                          : alert.type === "critical"
                            ? "bg-red-50 border-red-200"
                            : alert.type === "warning"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          alert.type === "critical"
                            ? "bg-red-100"
                            : alert.type === "warning"
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <AlertCircle
                          className={`w-5 h-5 ${
                            alert.type === "critical"
                              ? "text-red-600"
                              : alert.type === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleTimeString("pt-PT")}
                        </p>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-gray-600">Sem alertas no momento</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Alert Distribution */}
          <Card className="p-8 border-gray-200">
            <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
              Distribuição de Alertas
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={alertDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {alertDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {alertDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recovery Progress Chart */}
        <Card className="p-8 border-gray-200 mb-8">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
            Progresso de Recuperação dos Pacientes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recoveryStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar
                dataKey="progress"
                fill="#0066cc"
                name="Progresso (%)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Patients List */}
        <Card className="p-8 border-gray-200">
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-6">
            Meus Pacientes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Cirurgia
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Progresso
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Último Check-In
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {patient.surgeryType}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
                            style={{ width: `${patient.recoveryProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {patient.recoveryProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {patient.lastCheckIn
                        ? new Date(patient.lastCheckIn).toLocaleDateString(
                            "pt-PT"
                          )
                        : "Pendente"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient.id)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Enviar mensagem"
                        >
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
