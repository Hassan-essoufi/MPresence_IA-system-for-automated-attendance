import { useState, useRef, useEffect } from "react";
import { Upload, Camera, User, X, Plus, Save, Loader2 } from "lucide-react";
import { fetchPersons, addPerson, cancelAddPerson, type Person } from "../api/client";

export function PersonManagement() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [captureMode, setCaptureMode] = useState<"upload" | "camera" | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      const data = await fetchPersons();
      setPersons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chargement des personnes");
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPersonAbortRef = useRef<AbortController | null>(null);
  const pendingRequestIdRef = useRef<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      alert("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageUrl);
        setCapturedFile(dataUrlToFile(imageUrl, `capture-${Date.now()}.jpg`));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setCapturedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Ouvrir le modal d'ajout
  const openAddModal = (mode: "upload" | "camera") => {
    setShowAddModal(true);
    setCaptureMode(mode);
    if (mode === "camera") {
      setTimeout(() => {
        void startCamera();
      }, 100);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setCaptureMode(null);
    setCapturedImage(null);
    setCapturedFile(null);
    setModalError(null);
    stopCamera();
    setFormData({ name: "" });
  };

  const cancelCurrentAddPerson = async () => {
    const pendingRequestId = pendingRequestIdRef.current;

    if (pendingRequestId) {
      try {
        await cancelAddPerson(pendingRequestId);
      } catch {
      }
    }

    if (addPersonAbortRef.current) {
      addPersonAbortRef.current.abort();
      addPersonAbortRef.current = null;
    }

    pendingRequestIdRef.current = null;
  };

  const handleCancel = async () => {
    if (isLoading) {
      await cancelCurrentAddPerson();
    }
    closeModal();
  };

  const savePerson = async () => {
    if (!formData.name.trim()) {
      alert("Veuillez saisir le nom");
      return;
    }

    const captureMethod = captureMode === "camera" ? "webcam" : "upload";

    if (!capturedFile) {
      alert(captureMode === "camera" ? "Veuillez capturer une photo" : "Veuillez uploader une photo");
      return;
    }

    setIsLoading(true);
    setModalError(null);
    try {
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const abortController = new AbortController();
      addPersonAbortRef.current = abortController;
      pendingRequestIdRef.current = requestId;

      await addPerson(
        formData.name.trim(),
        captureMethod,
        capturedFile,
        {
          signal: abortController.signal,
          requestId,
        }
      );
      await loadPersons();
      closeModal();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setModalError("Opération annulée");
      } else {
        setModalError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
      }
    } finally {
      addPersonAbortRef.current = null;
      pendingRequestIdRef.current = null;
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Gestion des Personnes
            </h1>
            <p className="text-gray-400">
              Enregistrez les visages pour la reconnaissance automatique
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => openAddModal("upload")}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-blue-500/50"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => openAddModal("camera")}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-purple-500/50"
            >
              <Camera className="w-5 h-5" />
              <span>Capturer Photo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Liste des personnes */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Personnes enregistrées ({persons.length})</span>
            </h3>
          </div>

          {persons.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">Aucune personne enregistrée</p>
              <p className="text-sm">Commencez par ajouter des personnes via upload ou capture photo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {persons.map((person) => (
                <div
                  key={person.id}
                  className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-900 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-white font-semibold text-lg">{person.name}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(person.created_at).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Plus className="w-6 h-6 text-blue-400" />
                <span>Ajouter une Personne</span>
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Capture/Upload Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300 block">
                  Photo de la personne *
                </label>

                {!capturedImage ? (
                  <div className="space-y-4">
                    {captureMode === "camera" && (
                      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-white/10">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {isCapturing && (
                          <button
                            onClick={capturePhoto}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center space-x-2 shadow-lg"
                          >
                            <Camera className="w-5 h-5" />
                            <span>Capturer</span>
                          </button>
                        )}
                      </div>
                    )}

                    {captureMode === "upload" && (
                      <label
                        htmlFor="person-image-upload"
                        className="block border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-800/30"
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-300 mb-2">Cliquez pour uploader une image</p>
                        <p className="text-sm text-gray-500">JPG, PNG jusqu'à 10MB</p>
                        <input
                          id="person-image-upload"
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          aria-label="Sélectionner une image"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full aspect-video object-cover rounded-xl border border-white/10"
                    />
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setCapturedFile(null);
                        if (captureMode === "camera") {
                          void startCamera();
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 backdrop-blur-sm rounded-lg hover:bg-red-500 transition-colors"
                      aria-label="Supprimer l'image"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Form */}
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {modalError && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
                  {modalError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    void handleCancel();
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={savePerson}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105 text-white rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>
                    {isLoading ? "Envoi..." : "Enregistrer"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
