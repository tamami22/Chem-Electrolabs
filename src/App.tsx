import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.tsx';
import StudentRouteGuard from './components/auth/StudentRouteGuard.tsx';
import StudentEntryPage from './pages/StudentEntryPage.tsx';
import HomePage from './pages/HomePage.tsx';
import LearningMapPage from './pages/LearningMapPage.tsx';
import ModulePage from './pages/ModulePage.tsx';
import PracticePage from './pages/PracticePage.tsx';
import AssessmentPage from './pages/AssessmentPage.tsx';
import TeacherModePage from './pages/TeacherModePage.tsx';
import GlossaryPage from './pages/GlossaryPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Halaman Masuk Data Diri & Mode Guru tidak terkunci oleh gerbang siswa */}
        <Route path="masuk" element={<StudentEntryPage />} />
        <Route path="guru" element={<TeacherModePage />} />

        {/* Semua halaman pembelajaran dilindungi gerbang data diri siswa */}
        <Route
          index
          element={
            <StudentRouteGuard>
              <HomePage />
            </StudentRouteGuard>
          }
        />
        <Route
          path="peta"
          element={
            <StudentRouteGuard>
              <LearningMapPage />
            </StudentRouteGuard>
          }
        />
        <Route
          path="modul/:slug"
          element={
            <StudentRouteGuard>
              <ModulePage />
            </StudentRouteGuard>
          }
        />
        <Route
          path="latihan"
          element={
            <StudentRouteGuard>
              <PracticePage />
            </StudentRouteGuard>
          }
        />
        <Route
          path="asesmen"
          element={
            <StudentRouteGuard>
              <AssessmentPage />
            </StudentRouteGuard>
          }
        />
        <Route
          path="glosarium"
          element={
            <StudentRouteGuard>
              <GlossaryPage />
            </StudentRouteGuard>
          }
        />
        <Route
          path="tentang"
          element={
            <StudentRouteGuard>
              <AboutPage />
            </StudentRouteGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
