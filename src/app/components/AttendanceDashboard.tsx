import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, UserCheck, UserX, TrendingUp, Search, Download, Loader2, AlertCircle } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  fetchAllAttendance,
  downloadAttendanceCsvByDate,
  fetchAttendanceCsvStats,
  type AttendanceRecord,
  type WeeklyAttendancePoint,
  type AttendanceTrendPoint,
} from "../api/client";

interface DisplayRecord {
  id: string;
  name: string;
  email: string;
  status: "present" | "absent";
  confidence: number;
  timestamp: string;
  date: string;
}

function toDisplayRecord(r: AttendanceRecord): DisplayRecord {
  return {
    id: String(r.id),
    name: r.person_name,
    email: "-",
    status: r.status === "present" ? "present" : "absent",
    confidence: r.confidence,
    timestamp: r.status === "absent" ? "-" : r.time,
    date: r.date,
  };
}

export function AttendanceDashboard() {
  const [records, setRecords] = useState<DisplayRecord[]>([]);
  const [weekData, setWeekData] = useState<WeeklyAttendancePoint[]>([]);
  const [trendData, setTrendData] = useState<AttendanceTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [attendanceData, csvStats] = await Promise.all([
          fetchAllAttendance(),
          fetchAttendanceCsvStats(),
        ]);
        setRecords(attendanceData.map(toDisplayRecord));
        setWeekData(csvStats.week_data);
        setTrendData(csvStats.trend_data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur chargement");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const dateFiltered = records.filter((r) => r.date === selectedDate);
  const presentCount = dateFiltered.filter((r) => r.status === "present").length;
  const absentCount = dateFiltered.filter((r) => r.status === "absent").length;
  const totalCount = dateFiltered.length;
  const attendanceRate =
    totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : "0";

  const pieData = [
    { name: "Présent", value: presentCount, color: "#10b981" },
    { name: "Absent", value: absentCount, color: "#ef4444" },
  ];

  const filteredRecords = dateFiltered.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportSelectedDateToCSV = async () => {
    try {
      const { blob, filename } = await downloadAttendanceCsvByDate(selectedDate);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Non existence de la présence pour ce jour");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">
            Présent
          </span>
        );
      case "absent":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/50">
            Absent
          </span>
        );
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/50 rounded-xl p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <p className="text-blue-400">Chargement des présences...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Tableau de bord des présences
            </h1>
            <p className="text-gray-400">
              Vue d'ensemble et analyse des données de présence
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <label htmlFor="attendance-date" className="sr-only">
              Date
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Sélectionner la date"
              className="px-4 py-2 bg-slate-800/50 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={exportSelectedDateToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Exporter</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{totalCount}</p>
              <p className="text-sm text-gray-400">Étudiants</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs text-gray-500">Présents</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{presentCount}</p>
              <p className="text-sm text-green-400">Présences validées</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-xs text-gray-500">Absents</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{absentCount}</p>
              <p className="text-sm text-gray-400">
                {totalCount > 0 ? ((absentCount / totalCount) * 100).toFixed(1) : 0}% du total
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-xs text-gray-500">Taux</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{attendanceRate}%</p>
              <p className="text-sm text-cyan-400">Taux de présence</p>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              Répartition des présences
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              Présences hebdomadaires
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-6">
            Évolution du taux de présence
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="taux"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 6 }}
                name="Taux de présence (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold text-white">
                Liste de présence détaillée
              </h3>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <label htmlFor="search-attendance" className="sr-only">
                    Rechercher
                  </label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="search-attendance"
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Rechercher un étudiant"
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label htmlFor="filter-status" className="sr-only">
                  Filtrer par statut
                </label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filtrer par statut"
                  className="px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous</option>
                  <option value="present">Présent</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Confiance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {record.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{record.name}</p>
                          <p className="text-gray-400 text-sm">{record.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.status === "absent" ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500 min-w-0"
                              style={{ width: `${record.confidence * 100}%` }}
                              role="progressbar"
                              aria-label="Niveau de confiance"
                              aria-valuenow={Math.round(record.confidence * 100)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                          <span className="text-gray-300 text-sm">
                            {(record.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {record.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {new Date(record.date).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
