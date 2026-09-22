import React, { useState, useEffect } from 'react';
import ContratoModal from './ContratoModal';
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
  const [reservaParaVer, setReservaParaVer] = useState(null);
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
    
    const q = query(collection(db, 'reservas'), orderBy('fechaCreacion', 'desc'));
    
    const unsubscribeRes = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(docs);
    }, (error) => {
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

  const calcularDias = (inicio, fin, diasGuardados) => {
    if (diasGuardados) return Number(diasGuardados);
    if (!inicio || !fin) return 1;
    try {
      const f1 = new Date(inicio);
      const f2 = new Date(fin);
      const diffTime = Math.abs(f2 - f1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays === 0 ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando panel...</p>;

  return (
    <>
      <div style={{ padding: '20px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ fontSize: '20px', margin: 0 }}>Monaco Luxury - Panel de Control</h1>
            <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '12px' }}>Gestión de Reservas en tiempo real</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => router.push('/admin/vehiculos')}
              style={{ padding: '8px 16px', backgroundColor: '#181818', color: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🚘 Gestionar Flota
            </button>
            <button 
              onClick={() => router.push('/admin/dashboard')}
              style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📊 Métricas
            </button>
                <button 
      onClick={() => router.push('/admin/calendario')}
      style={{ padding: '8px 16px', backgroundColor: '#111111', color: '#d4af37', border: '1px solid #d4af37', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
    >
      📅 Calendario
    </button>
            <button 
              onClick={() => router.push('/admin/nueva-reserva')}
              style={{ padding: '8px 16px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Nueva Reserva Manual
            </button>
            <button 
              onClick={() => signOut(getAuth(app))}
              style={{ padding: '8px 16px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cerrar Sesión
            </button>
          </div>
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
                    <th style={{ padding: '10px', minWidth: '220px' }}>Desglose Estimado</th>
                    <th style={{ padding: '10px' }}>Entrega / Residencia</th>
                    <th style={{ padding: '10px' }}>Firma / Contrato</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => {
                    const tieneSeguroFull = 
                      res.seguroFull === true || 
                      res.seguroFull === 'si' || 
                      (typeof res.opcionSeguro === 'string' && res.opcionSeguro.includes('Seguro Full'));

                    const totalDias = calcularDias(res.inicio, res.fin, res.diasTotales);

                    const rentaPorDia = Number(res.precioPorDia) || Number(res.rentaPorDia) || 0;
                    const totalAlquiler = totalDias * rentaPorDia;

                    const seguroPorDia = tieneSeguroFull ? (Number(res.precioSeguroPorDia) || Number(res.seguroPorDia) || 0) : 0;
                    const totalSeguro = totalDias * seguroPorDia;

                    const costoEntregaVal = Number(res.costoEntrega) || (
                      typeof res.lugarEntrega === 'string' && res.lugarEntrega.toLowerCase().includes('puntacana') ? 150 : 
                      typeof res.lugarEntrega === 'string' && res.lugarEntrega.toLowerCase().includes('santiago') ? 100 : 0
                    );
                    const depositoGarantiaVal = res.depositoGarantia !== undefined 
                      ? res.depositoGarantia 
                      : (tieneSeguroFull ? 0 : 400);

                    const totalCalculado = totalAlquiler + totalSeguro + costoEntregaVal;
                    const granTotal = res.costoTotal ? res.costoTotal : totalCalculado;

                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid #222', verticalAlign: 'top' }}>
                        {/* Fecha Reserva */}
                        <td style={{ padding: '10px', color: '#aaa', whiteSpace: 'nowrap' }}>
                          {formatearFecha(res.fechaCreacion)}
                          {res.registroManual && (
                            <span style={{ display: 'block', color: '#d4af37', fontSize: '10px', marginTop: '4px' }}>
                              (Registro Manual)
                            </span>
                          )}
                        </td>

                        {/* Cliente */}
                        <td style={{ padding: '10px' }}>
                          <strong>{res.clienteNombre || 'Sin nombre'}</strong><br />
                          <span style={{ color: '#888' }}>{res.clienteTelefono || '-'}</span><br />
                          <span style={{ color: '#666', fontSize: '10px' }}>{res.clienteEmail || '-'}</span>
                        </td>

                        {/* Tipo / Doc. */}
                        <td style={{ padding: '10px' }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#ccc' }}>
                            {res.tipoCliente || 'Residente'}
                          </span><br />
                          <span style={{ color: '#aaa' }}>{res.documentoCliente || '-'}</span>
                        </td>

                        {/* Vehículo */}
                        <td style={{ padding: '10px', color: '#d4af37', fontWeight: 'bold' }}>
                          {res.vehiculoNombre || '-'}
                        </td>

                        {/* Fechas Renta */}
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                          Del: {res.inicio || '-'}<br />
                          Al: {res.fin || '-'}<br />
                          <span style={{ color: '#d4af37', fontWeight: 'bold' }}>
                            ({totalDias} {totalDias === 1 ? 'Día' : 'Días'})
                          </span>
                        </td>

                        {/* Seguro Full */}
                        <td style={{ padding: '10px' }}>
                          <span style={{ 
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            display: 'inline-block',
                            backgroundColor: tieneSeguroFull ? '#1b5e20' : '#333',
                            color: tieneSeguroFull ? '#81c784' : '#aaa'
                          }}>
                            {tieneSeguroFull ? 'SÍ' : 'NO'}
                          </span>
                        </td>

                        {/* Desglose Estimado */}
                        <td style={{ padding: '10px', lineHeight: '1.6' }}>
                          <strong style={{ color: '#d4af37', display: 'block', marginBottom: '4px' }}>
                            Desglose Estimado ({totalDias} {totalDias === 1 ? 'Día' : 'Días'}):
                          </strong>
                          
                          • <strong>Alquiler:</strong> USD ${totalAlquiler} (${rentaPorDia}/día)<br />
                          
                          • <strong>Depósito Garantía:</strong> USD ${depositoGarantiaVal} {tieneSeguroFull ? '(Exonerado)' : ''}<br />
                          
                          {tieneSeguroFull && (
                            <>
                              • <strong>Seguro Full:</strong> USD ${totalSeguro} (${seguroPorDia}/día)<br />
                            </>
                          )}

                          {costoEntregaVal > 0 && (
                            <>
                              • <strong>Entrega / Movilización:</strong> USD ${costoEntregaVal}<br />
                            </>
                          )}

                          <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #333', fontSize: '13px' }}>
                            <strong style={{ color: '#4caf50' }}>Total Estimado: USD ${granTotal}</strong>
                          </div>
                        </td>

                        {/* Entrega / Residencia */}
                        <td style={{ padding: '10px' }}>
                          <strong style={{ color: '#ccc' }}>Lugar:</strong><br />
                          {res.lugarEntrega || 'A coordinar'}<br /><br />
                          <strong style={{ color: '#ccc' }}>Residencia RD:</strong><br />
                          <span style={{ color: '#aaa' }}>{res.clienteDireccionRD || 'No especificada'}</span>
                        </td>

                        {/* Firma / Contrato */}
                        <td style={{ padding: '10px' }}>
                          {res.firmaUrl ? (
                            <button 
                              onClick={() => setReservaParaVer(res)} 
                              style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                            >
                              Ver Firma Web
                            </button>
                          ) : (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>Contrato Físico</span>
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

      {reservaParaVer && (
        <ContratoModal 
          reserva={reservaParaVer} 
          onClose={() => setReservaParaVer(null)} 
        />
      )}
    </>
  );
}
