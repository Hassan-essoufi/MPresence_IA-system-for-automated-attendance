import { useState, useRef } from "react";
import { Upload, Video, Play, Pause, Download, User, CheckCircle2, Clock, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { processVideoRecognition, fetchAllAttendance, type AttendanceRecord } from "../api/client";

export function VideoRecognition() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAttendance([]);
      setError(null);
    } else {
      alert("Veuillez sélectionner un fichier vidéo valide");
    }
  };

  // Lecture/Pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const processVideo = async () => {
    if (!videoFile) {
      alert("Veuillez uploader une vidéo");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAttendance([]);

    try {
      await processVideoRecognition(videoFile);
      const data = await fetchAllAttendance();
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = data.filter((r) => r.date === today && r.source === "video");
      setAttendance(todayRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du traitement");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToCSV = () => {
    if (attendance.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const header = "Nom,Statut,Confiance,Date,Heure,Source\n";
    const rows = attendance
      .map(
        (d) =>
          `${d.person_name},${d.status},${(d.confidence * 100).toFixed(2)}%,${d.date},${d.time},${d.source}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_video_${Date.now()}.csv`;
    link.click();
  };

  const presentCount = attendance.filter((r) => r.status === "present").length;
  const stats = {
    totalDetections: attendance.length,
    uniquePersons: presentCount,
    avgConfidence:
      attendance.length > 0
        ? (attendance.reduce((sum, d) => sum + d.confidence, 0) / attendance.length) * 100
        : 0,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Reconnaissance sur Vidéo
            </h1>
            <p className="text-gray-400">
              Importez une vidéo et analysez les présences automatiquement
            </p>
          </div>
          {attendance.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-green-500/50"
            >
              <Download className="w-5 h-5" />
              <span>Exporter CSV</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vidéo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload section */}
            {!videoUrl && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-12">
                <label
                  htmlFor="video-file-upload"
                  className="block border-2 border-dashed border-white/20 rounded-xl p-16 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-800/30"
                >
                  <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Uploadez une vidéo
                  </h3>
                  <p className="text-gray-400 mb-4">
                    MP4 jusqu'à 500MB
                  </p>
                  <p className="text-sm text-gray-500">
                    Cliquez pour sélectionner un fichier
                  </p>
                  <input
                    id="video-file-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    aria-label="Sélectionner une vidéo"
                  />
                </label>
              </div>
            )}

            {/* Video player */}
            {videoUrl && (
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{videoFile?.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setVideoUrl(null);
                      setVideoFile(null);
                      setAttendance([]);
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Changer de vidéo
                  </button>
                </div>

                <div className="relative aspect-video bg-slate-950">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>

                {/* Controls */}
                <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={togglePlayPause}
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <button
                      onClick={processVideo}
                      disabled={isProcessing}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Traitement en cours...</span>
                        </>
                      ) : (
                        <span>Analyser la vidéo</span>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {attendance.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-blue-400">{stats.totalDetections}</p>
                  <p className="text-sm text-gray-400 mt-1">Détections totales</p>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-purple-400">{stats.uniquePersons}</p>
                  <p className="text-sm text-gray-400 mt-1">Personnes uniques</p>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-3xl font-bold text-green-400">{stats.avgConfidence.toFixed(1)}%</p>
                  <p className="text-sm text-gray-400 mt-1">Confiance moyenne</p>
                </div>
              </div>
            )}
          </div>

          {/* Détections */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl sticky top-8">
              <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <h3 className="text-white font-medium flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                  <span>Présences ({attendance.length})</span>
                </h3>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {attendance.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {videoUrl
                        ? "Cliquez sur 'Analyser' pour démarrer"
                        : "Uploadez une vidéo pour commencer"}
                    </p>
                  </div>
                ) : (
                  attendance.map((record) => (
                    <div
                      key={record.id}
                      className={`p-4 rounded-xl border backdrop-blur-sm ${
                        record.status === "present"
                          ? "bg-green-500/20 border-green-500/50"
                          : "bg-slate-800/50 border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{record.person_name}</p>
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{record.time}</span>
                            </div>
                          </div>
                        </div>
                        {record.status === "present" && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Statut</span>
                          <span
                            className={
                              record.status === "present"
                                ? "text-green-400 font-medium"
                                : "text-gray-400"
                            }
                          >
                            {record.status === "present" ? "Présent" : "Absent"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Confiance</span>
                          <span className="text-white">
                            {(record.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full min-w-0"
                            style={{ width: `${record.confidence * 100}%` }}
                            role="progressbar"
                            aria-label="Confiance"
                            aria-valuenow={Math.round(record.confidence * 100)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}