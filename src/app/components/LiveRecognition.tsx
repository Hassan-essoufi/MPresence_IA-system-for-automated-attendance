import { useState, useEffect, useRef } from "react";
import { Camera, User, Clock, AlertCircle, CheckCircle2, Scan, Loader2, AlertTriangle, Server, Download } from "lucide-react";
import { getRealTimeStreamUrl, stopRealTimeStream } from "../api/client";
import { loadFaceApiModels, areModelsLoaded } from "../utils/faceApiLoader";

interface DetectedPerson {
  id: string;
  name: string;
  timestamp: string;
  status: string;
  confidence: number;
}

export function LiveRecognition() {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([]);
  const [currentDetection, setCurrentDetection] = useState<string | null>(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Charger les modèles face-api.js
  useEffect(() => {
    const loadModels = async () => {
      if (areModelsLoaded()) {
        setModelsLoaded(true);
        return;
      }

      setIsLoading(true);
      try {
        await loadFaceApiModels();
        setModelsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des modèles:", err);
        setError("Impossible de charger les modèles de reconnaissance faciale");
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setCurrentDetection(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startServerWebcam = async () => {
    if (isScanning) {
      try {
        const result = await stopRealTimeStream(0.6);
        if (result.detections?.length) {
          const mapped = result.detections.map((detection, index) => ({
            id: `${Date.now()}-${index}`,
            name: detection.name,
            timestamp: detection.time,
            status: detection.status,
            confidence: detection.confidence,
          }));
          setDetectedPersons((prev) => [...mapped, ...prev].slice(0, 20));
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Erreur lors de l'arrêt du flux");
      }
      setIsScanning(false);
      setIsServerRunning(false);
      setStreamUrl(null);
      return;
    }

    setServerError(null);
    setIsServerRunning(true);
    setIsScanning(true);
    setStreamUrl(getRealTimeStreamUrl(0.6));
  };

  const exportToCSV = () => {
    if (detectedPersons.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    const header = "Nom,Statut,Confiance,Temps,Source\n";
    const rows = detectedPersons
      .map(
        (detection) =>
          `${detection.name},${detection.status},${(detection.confidence * 100).toFixed(2)}%,${detection.timestamp},webcam`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_webcam_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Reconnaissance Faciale Live
            </h1>
            <p className="text-gray-400">
              Détection automatique en temps réel avec IA
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {detectedPersons.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-green-500/50"
              >
                <Download className="w-5 h-5" />
                <span>Exporter CSV</span>
              </button>
            )}
            <button
              onClick={startServerWebcam}
              className="flex items-center space-x-2 px-5 py-3 bg-slate-800/50 border border-white/10 text-gray-300 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
              title={isServerRunning ? "Arrêter la webcam serveur" : "Démarrer la webcam serveur"}
            >
              <Server className="w-5 h-5" />
              <span>{isServerRunning ? "Arrêter webcam serveur" : "Webcam serveur"}</span>
            </button>
          </div>
        </div>

        {serverError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{serverError}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/50 rounded-xl p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <p className="text-blue-400">Chargement des modèles de reconnaissance faciale...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Camera header */}
              <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Flux vidéo principal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isScanning ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                  <span className="text-sm text-gray-400">
                    {isScanning ? "En direct" : "Hors ligne"}
                  </span>
                </div>
              </div>

              {/* Camera view */}
              <div className="relative aspect-video bg-slate-950">
                {streamUrl && isScanning && (
                  <img
                    src={streamUrl}
                    alt="Flux webcam serveur"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setServerError("Impossible de charger le flux webcam serveur.");
                      setIsScanning(false);
                      setIsServerRunning(false);
                      setStreamUrl(null);
                    }}
                  />
                )}

                {!modelsLoaded && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-center space-y-4 flex-col">
                    <Camera className="w-20 h-20 text-gray-600" />
                    <p className="text-gray-500">Initialisation...</p>
                  </div>
                )}

                {modelsLoaded && !isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center text-center space-y-4 flex-col">
                    <Camera className="w-20 h-20 text-gray-600" />
                    <p className="text-gray-500">Utilisez le bouton "Webcam serveur" pour lancer la reconnaissance</p>
                  </div>
                )}

                {!streamUrl && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                    />
                  </>
                )}

                {/* Scanning indicator */}
                {currentDetection && (
                  <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-sm border border-blue-400 rounded-lg px-4 py-2 flex items-center space-x-2">
                    <Scan className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-sm text-white">{currentDetection} détecté</span>
                  </div>
                )}

                {/* Info badge */}
                {isScanning && (
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300">Détection active</span>
                  </div>
                )}
              </div>

              {/* Stats bar */}
              <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{detectedPersons.length}</p>
                  <p className="text-sm text-gray-400">Détections</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-2xl font-bold text-green-400">
                    {detectedPersons.filter(p => p.confidence >= 0.8).length}
                  </p>
                  <p className="text-sm text-gray-400">Haute confiance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">
                    {modelsLoaded ? "✓" : "⏳"}
                  </p>
                  <p className="text-sm text-gray-400">Modèles IA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detection List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <h3 className="text-white font-medium flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <span>Détections récentes</span>
                </h3>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {detectedPersons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune détection pour le moment</p>
                  </div>
                ) : (
                  detectedPersons.map((person) => (
                    <div
                      key={person.id}
                      className={`p-4 rounded-xl border backdrop-blur-sm ${
                        person.status.toLowerCase() === "present"
                          ? "bg-green-500/20 border-green-500/50"
                          : "bg-slate-800/50 border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{person.name}</p>
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{person.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        {person.status.toLowerCase() === "present" && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Statut</span>
                          <span className={`font-medium ${
                            person.status.toLowerCase() === "present" ? "text-green-400" : "text-gray-400"
                          }`}>
                            {person.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Confiance</span>
                          <span className="text-white">
                            {(person.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full min-w-0"
                            style={{ width: `${person.confidence * 100}%` }}
                            role="progressbar"
                            aria-label="Confiance"
                            aria-valuenow={Math.round(person.confidence * 100)}
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