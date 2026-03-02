import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const loadFaceApiModels = async (): Promise<void> => {
  // Si déjà chargé, retourner immédiatement
  if (modelsLoaded) {
    return Promise.resolve();
  }

  // Si en cours de chargement, retourner la promesse existante
  if (loadingPromise) {
    return loadingPromise;
  }

  // Commencer le chargement
  loadingPromise = (async () => {
    try {
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);
      
      modelsLoaded = true;
    } catch (err) {
      console.error("Erreur lors du chargement des modèles face-api:", err);
      loadingPromise = null;
      throw err;
    }
  })();

  return loadingPromise;
};

export const areModelsLoaded = (): boolean => {
  return modelsLoaded;
};
