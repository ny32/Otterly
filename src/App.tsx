import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Layout from "./components/layout";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import GradeViewerPage from "./pages/GradeViewerPage";
import { useGradeStore } from "./store/gradeStore";

function App() {
  const classes = useGradeStore((state) => state.classes);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="gradeviewer-theme">
      <Router>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                classes.length === 0 ? (
                  <UploadPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                classes.length > 0 ? (
                  <DashboardPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/gradeviewer" element={<Navigate to="/" replace />} />
            <Route path="/gradeviewer/" element={<Navigate to="/" replace />} />
            <Route
              path="/gradeviewer/:classId"
              element={
                classes.length > 0 ? (
                  <GradeViewerPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
