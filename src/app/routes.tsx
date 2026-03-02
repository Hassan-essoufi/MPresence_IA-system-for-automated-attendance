import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { LiveRecognition } from "./components/LiveRecognition";
import { AttendanceDashboard } from "./components/AttendanceDashboard";
import { PersonManagement } from "./components/PersonManagement";
import { VideoRecognition } from "./components/VideoRecognition";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "live", Component: LiveRecognition },
      { path: "video", Component: VideoRecognition },
      { path: "persons", Component: PersonManagement },
      { path: "attendance", Component: AttendanceDashboard },
      { path: "gestion", Component: AttendanceDashboard },
    ],
  },
]);