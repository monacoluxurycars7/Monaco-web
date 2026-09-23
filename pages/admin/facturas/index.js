import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getFirebaseDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export default function ListaFacturas() {
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const db = getFirebaseDb();
        const querySnapshot = await getDocs(collection(db, 'reservas'));
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReservas(lista);
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, []);

  const reservasFiltradas = reservas.filter(res => {
    const texto = busqueda.toLowerCase();
    return (
      (res.clienteNombre && res.clienteNombre.toLowerCase().includes(texto)) ||
      (res.vehiculoNombre && res.vehiculoNombre.toLowerCase().includes(texto)) ||
      (res.documentoCliente && res.documentoCliente.toLowerCase().includes(texto)) ||
      res.id.toLowerCase().includes(texto)
    );
  });

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      
      {/* Cabecera */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: '#d4af37', margin: 0, fontSize: '24px' }}>Historial de Facturas y Contratos</h1>
          <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '13px' }}>Busca, gestiona e imprime los documentos generados automáticamente por cada reserva.</p>
        </div>
        <button 
          onClick={() => router.push('/admin')}
          style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Buscador */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 20px auto' }}>
        <input 
          type="text"
          placeholder="🔍 Buscar por cliente, vehículo, cédula o ID..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
        />
        <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>La búsqueda filtra de forma instantánea a medida que escribes.</p>
      </div>

      {/* Contenido principal / Tabla */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Cargando reservas desde Firebase...</p>
        ) : reservasFiltradas.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No se encontraron facturas o reservas registradas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#222', color: '#d4af37', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '12px 15px' }}>Ref / ID</th>
                  <th style={{ padding: '12px 15px' }}>Cliente</th>
                  <th style={{ padding: '12px 15px' }}>Vehículo</th>
                  <th style={{ padding: '12px 15px' }}>Fechas</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((res) => (
                  <tr key={res.id} style={{ borderBottom: '1px solid #262626' }}>
                    <td style={{ padding: '12px 15px', color: '#d4af37', fontWeight: 'bold' }}>#{res.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{ fontWeight: 'bold' }}>{res.clienteNombre || 'Sin nombre'}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{res.documentoCliente || res.clienteTelefono || 'Sin documento'}</div>
                    </td>
                    <td style={{ padding: '12px 15px' }}>{res.vehiculoNombre || 'Vehículo no especificado'}</td>
                    <td style={{ padding: '12px 15px', fontSize: '12px', color: '#ccc' }}>
                      {res.inicio || 'N/A'} al {res.fin || 'N/A'}
                      <div style={{ color: '#888' }}>({res.diasTotales || 0} días)</div>
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: '#22c55e' }}>
                      ${res.costoTotal || 0} USD
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <button
                        onClick={() => router.push(`/admin/facturas/${res.id}`)}
                        style={{ padding: '6px 12px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Ver Factura 📄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
