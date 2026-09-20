import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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
    
    // Consulta ordenada por fechaCreacion descendente
    const q = query(collection(db, 'reservas'), orderBy('fechaCreacion', 'desc'));
    
    const unsubscribeRes = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(docs);
    }, (error) => {
      // Fallback
      const unsubscribeFallback = onSnapshot(collection(db, 'reservas'), (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        docs.sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
        setReservations(docs);
      });
    });

    return () => unsubscribeRes();
  }, [user]);

  const formatearFecha = (isoString) => {
    if (!isoString) return 'Sin fecha';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-DO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return isoString;
    }
  };

  // Función para calcular la cantidad de días entre dos fechas
  const calcularDias = (inicio, fin, diasGuardados) => {
    if (diasGuardados) return diasGuardados;
    if (!inicio || !fin) return '-';
    try {
      const f1 = new Date(inicio);
      const f2 = new Date(fin);
      const diffTime = Math.abs(f2 - f1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays === 0 ? 1 : diffDays;
    } catch {
      return '-';
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando panel...</p>;

  return (
    <div style={{ padding: '20px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0 }}>Monaco Luxury - Panel de Control</h1>
          <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '12px' }}>Gestión de Reservas en tiempo real</p>
        </div>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#111', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333', color: '#d4af37', backgroundColor: '#181818' }}>
                  <th style={{ padding: '10px' }}>Fecha Reserva</th>
                  <th style={{ padding: '10px' }}>Cliente</th>
                  <th style={{ padding: '10px' }}>Tipo / Doc.</th>
                  <th style={{ padding: '10px' }}>Vehículo</th>
                  <th style={{ padding: '10px' }}>Fechas Renta</th>
                  <th style={{ padding: '10px' }}>Seguro Full</th>
                  <th style={{ padding: '10px' }}>Lugar Entrega</th>
                  <th style={{ padding: '10px' }}>Dirección Residencia</th>
                  <th style={{ padding: '10px' }}>Depósito</th>
                  <th style={{ padding: '10px' }}>Costo Total</th>
                  <th style={{ padding: '10px' }}>Firma</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => {
                  const tieneSeguroFull = 
                    res.seguroFull === true || 
                    res.seguroFull === 'si' || 
                    (typeof res.opcionSeguro === 'string' && res.opcionSeguro.includes('Seguro Full'));

                  const totalDias = calcularDias(res.inicio, res.fin, res.diasTotales);

                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '10px', color: '#aaa', whiteSpace: 'nowrap' }}>
                        {formatearFecha(res.fechaCreacion)}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <strong>{res.clienteNombre || 'Sin nombre'}</strong><br />
                        <span style={{ color: '#888' }}>{res.clienteTelefono || '-'}</span><br />
                        <span style={{ color: '#666', fontSize: '10px' }}>{res.clienteEmail || '-'}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ textTransform: 'capitalize' }}>
                          {res.tipoCliente || 'Residente'}
                        </span><br />
                        <span style={{ color: '#aaa' }}>{res.documentoCliente || '-'}</span>
                      </td>
                      <td style={{ padding: '10px', color: '#d4af37', fontWeight: 'bold' }}>
                        {res.vehiculoNombre || '-'}
                      </td>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                        Del: {res.inicio || '-'}<br />
                        Al: {res.fin || '-'}<br />
                        <span style={{ color: '#d4af37', fontWeight: 'bold' }}>
                          ({totalDias} {totalDias === 1 ? 'Día' : 'Días'})
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontWeight: 'bold',
                          backgroundColor: tieneSeguroFull ? '#1b5e20' : '#333',
                          color: tieneSeguroFull ? '#81c784' : '#aaa'
                        }}>
                          {tieneSeguroFull ? 'SÍ' : 'NO'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {res.lugarEntrega || 'A coordinar'}
                        {res.costoEntrega ? <><br/><span style={{ color: '#aaa' }}>Costo: ${res.costoEntrega} USD</span></> : ''}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {res.clienteDireccionRD || 'No especificada'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        ${res.depositoGarantia !== undefined ? res.depositoGarantia : (tieneSeguroFull ? 0 : 400)} USD
                      </td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: '#4caf50', fontSize: '13px' }}>
                        ${res.costoTotal || 0} USD
                      </td>
                      <td style={{ padding: '10px' }}>
                        {res.firmaUrl ? (
                          <a 
                            href={res.firmaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: '#d4af37', textDecoration: 'underline' }}
                          >
                            Ver Firma
                          </a>
                        ) : (
                          <span style={{ color: '#555' }}>Sin firma</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
