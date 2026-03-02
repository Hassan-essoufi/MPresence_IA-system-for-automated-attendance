import { API_BASE_URL } from "./config";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// --- Persons API ---

export interface Person {
  id: number;
  name: string;
  created_at: string;
}

export async function fetchPersons(): Promise<Person[]> {
  return request<Person[]>("/persons/");
}

export async function addPerson(
  name: string,
  captureMethod: "webcam" | "upload",
  imageFile?: File,
  options?: { signal?: AbortSignal; requestId?: string }
): Promise<Person> {
  const params = new URLSearchParams({
    name,
    capture_method: captureMethod,
  });

  if (options?.requestId) {
    params.set("request_id", options.requestId);
  }

  const formData = new FormData();
  if (imageFile) {
    formData.append("image_file", imageFile);
  }

  const url = `${API_BASE_URL}/persons/add?${params.toString()}`;
  const res = await fetch(url, {
    method: "POST",
    body: imageFile ? formData : undefined,
    signal: options?.signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function cancelAddPerson(requestId: string): Promise<void> {
  const url = `${API_BASE_URL}/persons/cancel/${encodeURIComponent(requestId)}`;
  await fetch(url, { method: "POST" });
}

// --- Attendance API ---

export interface AttendanceRecord {
  id: number;
  person_name: string;
  date: string;
  time: string;
  status: string;
  confidence: number;
  source: string;
}

export async function fetchAllAttendance(): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>("/attendance/all");
}

export async function fetchAbsentAttendance(): Promise<AttendanceRecord[]> {
  return request<AttendanceRecord[]>("/attendance/absent");
}

export interface WeeklyAttendancePoint {
  day: string;
  present: number;
  absent: number;
}

export interface AttendanceTrendPoint {
  month: string;
  taux: number;
}

export interface AttendanceCsvStats {
  week_data: WeeklyAttendancePoint[];
  trend_data: AttendanceTrendPoint[];
}

export async function fetchAttendanceCsvStats(): Promise<AttendanceCsvStats> {
  return request<AttendanceCsvStats>("/attendance/stats_from_csv");
}

export async function downloadAttendanceCsvByDate(
  date: string
): Promise<{ blob: Blob; filename: string }> {
  const url = `${API_BASE_URL}/attendance/export_csv?date=${encodeURIComponent(date)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  const contentDisposition = res.headers.get("content-disposition") || "";
  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  const filename = fileNameMatch?.[1] ?? `presence_${date}.csv`;

  return {
    blob: await res.blob(),
    filename,
  };
}

export async function processVideoRecognition(
  videoFile: File,
  outputVideoPath = "output.mp4",
  attendanceCsv = "attendance_video.csv"
): Promise<{ status: string; output_video: string; attendance_csv: string }> {
  const formData = new FormData();
  formData.append("input_video", videoFile);
  formData.append("output_video_path", outputVideoPath);
  formData.append("attendance_csv", attendanceCsv);

  const url = `${API_BASE_URL}/attendance/video_recognition`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Starts real-time attendance on the server (uses server's webcam).
 * Note: This blocks until the server process ends (user presses 'q' on server).
 */
export async function runRealTimeAttendance(
  csvFile = "file.csv",
  threshold = 0.6
): Promise<{ status: string; file: string }> {
  const formData = new FormData();
  formData.append("csv_file", csvFile);
  formData.append("threshold", threshold.toString());

  const url = `${API_BASE_URL}/attendance/real_time`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function getRealTimeStreamUrl(threshold = 0.6): string {
  return `${API_BASE_URL}/attendance/real_time_stream?threshold=${threshold}`;
}

export interface StreamDetection {
  name: string;
  status: string;
  confidence: number;
  time: string;
}

export async function stopRealTimeStream(threshold = 0.6): Promise<{ status: string; detections: StreamDetection[] }> {
  const formData = new FormData();
  formData.append("threshold", threshold.toString());

  const url = `${API_BASE_URL}/attendance/real_time_stream/stop`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}
