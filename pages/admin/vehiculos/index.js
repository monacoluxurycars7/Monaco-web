import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function GestionVehiculos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehiculos, setVehiculos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
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

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'vehiculos'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehiculos(docs);
    });
    return () => unsubscribe();
  }, [user]);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'vehiculos', id), { estado: nuevoEstado });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Ocurrió un error al actualizar el estado.');
    }
  };

  const eliminarVehiculo = async (id, nombre) => {
    if (confirm(`¿Estás segura de eliminar el vehículo "${nombre}"?`)) {
      try {
        await deleteDoc(doc(db, 'vehiculos', id));
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando flota...</p>;

  return (
    <div style={{ padding: '20px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#d4af37' }}>Gestión de Flota de Vehículos</h1>
          <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '12px' }}>Control de disponibilidad, precios y detalles</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => router.push('/admin/vehiculos/nuevo')}
            style={{ padding: '8px 16px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Agregar Vehículo
          </button>
          <button 
            onClick={() => router.push('/admin')}
            style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Volver a Reservas
          </button>
        </div>
      </header>

      <section style={{ marginTop: '25px' }}>
        {vehiculos.length === 0 ? (
          <p style={{ color: '#888', marginTop: '15px' }}>No hay vehículos registrados en la flota aún.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {vehiculos.map((auto) => {
              const estadoColor = {
                disponible: '#4caf50',
                alquilado: '#e53935',
                taller: '#ff9800',
                inactivo: '#757575'
              }[auto.estado || 'disponible'];

              return (
                <div key={auto.id} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <img 
                    src={auto.imagenUrl || 'https://via.placeholder.com/300x180?text=Sin+Foto'} 
                    alt={auto.nombre} 
                    style={{ width: '100%', height: '170px', objectFit: 'cover' }} 
                  />
                  <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{auto.nombre}</h3>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', backgroundColor: estadoColor, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {auto.estado || 'disponible'}
                        </span>
                      </div>

                      {/* Detalles Técnicos */}
                      <p style={{ color: '#aaa', fontSize: '11px', margin: '4px 0', lineHeight: '1.5' }}>
                        • <strong>Año:</strong> {auto.anio || '-'}<br />
                        • <strong>Placa:</strong> {auto.placa || '-'}<br />
                        • <strong>Combustible:</strong> {auto.combustible || '-'}<br />
                        • <strong>Pasajeros:</strong> {auto.pasajeros || '-'}<br />
                        • <strong>Transmisión:</strong> {auto.transmision || '-'}
                      </p>

                      {/* Desglose de Tarifas */}
                      <div style={{ backgroundColor: '#181818', padding: '10px', borderRadius: '6px', border: '1px solid #333', marginTop: '10px', fontSize: '12px' }}>
                        <strong style={{ color: '#d4af37', display: 'block', marginBottom: '4px' }}>Tarifas por Días:</strong>
                        • 3-5 Días: <strong>USD ${auto.precio3a5Dias || auto.precioPorDia || 0}</strong>/día<br />
                        • 6-10 Días: <strong>USD ${auto.precio6a10Dias || auto.precioPorDia || 0}</strong>/día<br />
                        • 11+ Días: <strong>USD ${auto.precio11MasDias || auto.precioPorDia || 0}</strong>/día
                      </div>
                    </div>

                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #222' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>Cambiar Estado:</label>
                      <select 
                        value={auto.estado || 'disponible'} 
                        onChange={(e) => cambiarEstado(auto.id, e.target.value)}
                        style={{ width: '100%', padding: '6px', backgroundColor: '#181818', color: '#fff', border: '1px solid #333', borderRadius: '4px', fontSize: '12px', marginBottom: '10px' }}
                      >
                        <option value="disponible">🟢 Disponible</option>
                        <option value="alquilado">🔴 Alquilado / En uso</option>
                        <option value="taller">🟡 En Mantenimiento</option>
                        <option value="inactivo">⚪ Inactivo (Ocultar)</option>
                      </select>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => eliminarVehiculo(auto.id, auto.nombre)}
                          style={{ flex: 1, padding: '6px', backgroundColor: '#300', color: '#f55', border: '1px solid #500', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
