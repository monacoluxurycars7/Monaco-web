import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando panel...</p>;

  return (
    <div style={{ padding: '30px', color: '#fff', minHeight: '100vh', backgroundColor: '#050505' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', pb: '15px' }}>
        <h1>Monaco Luxury - Panel de Control</h1>
        <button 
          onClick={() => signOut(getAuth())}
          style={{ padding: '8px 16px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        <h2>Bienvenido, {user?.email}</h2>
        <p style={{ color: '#aaa' }}>Desde aquí podrás gestionar tus reservas y vehículos registrados en Firestore.</p>
      </main>
    </div>
  );
}
