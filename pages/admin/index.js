import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
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

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const unsubscribeRes = onSnapshot(collection(db, 'reservas'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(docs);
    });
    return () => unsubscribeRes();
  }, [user]);

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando panel...</p>;

  return (
    <div style={{ padding: '20px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '20px' }}>Monaco Luxury - Panel de Control</h1>
        <button 
          onClick={() => signOut(getAuth(app))}
          style={{ padding: '8px 16px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <section style={{ marginTop: '25px' }}>
        <h2>Reservas Recibidas ({reservations.length})</h2>
        {reservations.length === 0 ? (
          <p style={{ color: '#888', marginTop: '15px' }}>No hay reservas registradas aún.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#111', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333', color: '#d4af37', backgroundColor: '#181818' }}>
                  <th style={{ padding: '10px' }}>Cliente / Teléfono</th>
                  <th style={{ padding: '10px' }}>Tipo Cliente</th>
                  <th style={{ padding: '10px' }}>Documento</th>
                  <th style={{ padding: '10px' }}>Vehículo</th>
                  <th style={{ padding: '10px' }}>Fechas</th>
                  <th style={{ padding: '10px' }}>Días</th>
                  <th style={{ padding: '10px' }}>Renta/Día</th>
                  <th style={{ padding: '10px' }}>Seguro Full</th>
                  <th style={{ padding: '10px' }}>Garantía</th>
                  <th style={{ padding: '10px' }}>Lugar Entrega</th>
                  <th style={{ padding: '10px' }}>Costo Entrega</th>
                  <th style={{ padding: '10px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '10px' }}>
                      <strong>{res.clienteNombre || 'Sin nombre'}</strong>
                      <br />
                      <span style={{ color: '#aaa', fontSize: '11px' }}>{res.clienteTelefono || '-'}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{res.tipoCliente || res.clienteTipo || 'Residente'}</td>
                    <td style={{ padding: '10px' }}>{res.documentoCliente || res.documento || '-'}</td>
                    <td style={{ padding: '10px', color: '#d4af37', fontWeight: 'bold' }}>{res.vehiculoNombre || '-'}</td>
                    <td style={{ padding: '10px' }}>
                      {res.inicio || '-'} <br/>
                      <span style={{ color: '#aaa' }}>al {res.fin || '-'}</span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{res.diasTotales || res.dias || '-'}</td>
                    <td style={{ padding: '10px' }}>${res.rentaPorDia || res.precioPorDia || 0} USD</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '3px 6px', borderRadius: '4px', backgroundColor: res.seguroFull ? '#2e7d32' : '#424242' }}>
                        {res.seguroFull ? 'SÍ' : 'NO'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>${res.depositoGarantia !== undefined ? res.depositoGarantia : 400} USD</td>
                    <td style={{ padding: '10px' }}>{res.lugarEntrega || res.clienteDireccionRD || 'A coordinar'}</td>
                    <td style={{ padding: '10px' }}>${res.costoEntrega || 0} USD</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#4caf50', fontSize: '14px' }}>
                      ${res.costoTotal || res.total || 0} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
