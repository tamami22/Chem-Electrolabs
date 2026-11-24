import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStudentStore } from '../../stores/useStudentStore.ts';

interface StudentRouteGuardProps {
  children: ReactNode;
}

/**
 * Gerbang Siswa (Student Gate):
 * Mengamankan seluruh rute pembelajaran (Beranda, Peta, Modul, Latihan, Asesmen, Glosarium, Tentang).
 * Jika siswa belum mengisi formulir identitas / belum masuk sesi,
 * pengguna dialihkan ke halaman formulir (/masuk) dengan menyimpan lokasi asal (from).
 */
export default function StudentRouteGuard({ children }: StudentRouteGuardProps) {
  const isEntered = useStudentStore((state) => state.isEntered);
  const location = useLocation();

  if (!isEntered) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

