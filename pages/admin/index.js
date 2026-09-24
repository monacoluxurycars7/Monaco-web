import React, { useState, useEffect } from 'react';
import ContratoModal from './ContratoModal';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  const [reservaParaEditar, setReservaParaEditar] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [vehiculosMap, setVehiculosMap] = useState({});
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
    const unsubscribeVehiculos = onSnapshot(collection(db, 'vehiculos'), (snapshot) => {
      const map = {};
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.nombre) {
          map[data.nombre.trim().toLowerCase()] = data.tipoPropietario || data.propietario || data.tipo || 'Propio';
        }
        map[docSnap.id] = data.tipoPropietario || data.propietario || data.tipo || 'Propio';
      });
      setVehiculosMap(map);
    });
    return () => unsubscribeVehiculos();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, 'reservas'), orderBy('fechaCreacion', 'desc'));
    
    const unsubscribeRes = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setReservations(docs);
    }, (error) => {
      const unsubscribeFallback = onSnapshot(collection(db, 'reservas'), (snapshot) => {
        const docs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
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

  const obtenerTipoVehiculo = (res) => {
    if (res.tipoVehiculo) return res.tipoVehiculo;
    if (res.esSubrentado !== undefined) return res.esSubrentado ? 'Subrentado' : 'Propio';
    
    const nombreVehiculo = (res.vehiculoNombre || '').trim().toLowerCase();
    if (vehiculosMap[nombreVehiculo]) {
      return vehiculosMap[nombreVehiculo];
    }
    if (res.vehiculoId && vehiculosMap[res.vehiculoId]) {
      return vehiculosMap[res.vehiculoId];
    }

    return 'Propio';
  };

  const handleEliminarReserva = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'reservas', id));
      } catch (error) {
        console.error('Error al eliminar reserva:', error);
        alert('Hubo un error al intentar eliminar la reserva.');
      }
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando panel...</p>;

  const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Definimos el mes y año actual
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    let volumenTotalRentas = 0;
    const pendientesEntrega = [];
    const proximasDevoluciones = [];

    reservations.forEach(res => {
      const totalDias = calcularDias(res.inicio, res.fin, res.diasTotales);
      const rentaPorDia = Number(res.precioPorDia) || Number(res.rentaPorDia) || 0;
      const totalAlquiler = totalDias * rentaPorDia;
      const tieneSeguroFull = res.seguroFull === true || res.seguroFull === 'si' || (typeof res.opcionSeguro === 'string' && res.opcionSeguro.toLowerCase().includes('full'));
      const seguroPorDia = tieneSeguroFull ? (Number(res.precioSeguroFull) || Number(res.seguroPorDia) || 0) : 0;
      const totalSeguro = totalDias * seguroPorDia;
      const costoEntregaVal = Number(res.costoEntrega) || (typeof res.costoEntrega === 'string' && res.costoEntrega.toLowerCase().includes('lugar') ? 0 : 0);
      const totalCalculado = totalAlquiler + totalSeguro + costoEntregaVal;
      const granTotal = res.costoTotal ? Number(res.costoTotal) : totalCalculado;

     // === FILTRO EXACTO POR MES Y AÑO (EVITA DESFASES) ===
      if (res.inicio) {
        const anioMesReserva = res.inicio.toString().substring(0, 7); 
        
        const anioActualStr = hoy.getFullYear();
        const mesActualStr = String(hoy.getMonth() + 1).padStart(2, '0');
        const mesAnioActual = `${anioActualStr}-${mesActualStr}`;

        if (anioMesReserva === mesAnioActual) {
          volumenTotalRentas += granTotal;
        }
      }

    if (res.inicio && res.fin) {
      const fechaInicioRenta = new Date(res.inicio);
      fechaInicioRenta.setHours(0, 0, 0, 0);

      const fechaFinRenta = new Date(res.fin);
      fechaFinRenta.setHours(0, 0, 0, 0);

      const diffDiasInicio = Math.ceil((fechaInicioRenta - hoy) / (1000 * 60 * 60 * 24));
      const diffDiasFin = Math.ceil((fechaFinRenta - hoy) / (1000 * 60 * 60 * 24));

      if (diffDiasInicio > 0) {
        pendientesEntrega.push({ ...res, diasFaltantes: diffDiasInicio });
      }

      if (diffDiasFin >= 0 && diffDiasFin <= 2) {
        proximasDevoluciones.push({ ...res, diasRestantesDevolucion: diffDiasFin });
      }
    }
  });

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
              onClick={() => router.push('/admin/facturas')}
              style={{ padding: '8px 16px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📄 Facturas
            </button>
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
              onClick={() => router.push('/admin/clientes')}
              style={{ padding: '8px 16px', backgroundColor: '#181818', color: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              👥 Clientes
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

        {/* TARJETAS DE FLUJO Y RESUMEN RÁPIDO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #d4af37', border: '1px solid #222' }}>
            <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Volumen Total de Rentas (Fluidez)</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#d4af37' }}>
              USD ${volumenTotalRentas.toLocaleString()}
            </p>
          </div>

          <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #3b82f6', border: '1px solid #222' }}>
            <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>🚗 Pendientes de Entrega (Salidas)</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#3b82f6' }}>
              {pendientesEntrega.length} vehículos por entregar
            </p>
          </div>

          <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #ef4444', border: '1px solid #222' }}>
            <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>🔔 Próximas Devoluciones (Recepción)</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#ef4444' }}>
              {proximasDevoluciones.length} devoluciones próximas
            </p>
          </div>
        </div>

        {/* SECCIÓN VISUAL DE ALERTAS OPERATIVAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
            <h3 style={{ fontSize: '14px', color: '#3b82f6', marginTop: 0, marginBottom: '10px' }}>📦 Próximas Entregas a Clientes</h3>
            {pendientesEntrega.length === 0 ? (
              <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>No hay entregas futuras programadas.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {pendientesEntrega.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#181818', padding: '10px', borderRadius: '4px', border: '1px solid #333', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{item.vehiculoNombre}</strong><br />
                      <span style={{ color: '#aaa' }}>Cliente: {item.clienteNombre} ({item.clienteTelefono || 'Sin tel'})</span><br />
                      <span style={{ color: '#3b82f6' }}>Entrega el: {item.inicio}</span>
                    </div>
                    <div style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      En {item.diasFaltantes} {item.diasFaltantes === 1 ? 'día' : 'días'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#111', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
            <h3 style={{ fontSize: '14px', color: '#ef4444', marginTop: 0, marginBottom: '10px' }}>⏰ Alertas de Devolución (Recordatorio Cliente)</h3>
            {proximasDevoluciones.length === 0 ? (
              <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>No hay devoluciones cercanas para hoy o mañana.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {proximasDevoluciones.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#181818', padding: '10px', borderRadius: '4px', border: '1px solid #333', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{item.vehiculoNombre}</strong><br />
                      <span style={{ color: '#aaa' }}>Cliente: {item.clienteNombre} ({item.clienteTelefono || 'Sin tel'})</span><br />
                      <span style={{ color: '#ef4444' }}>Devuelve el: {item.fin}</span>
                    </div>
                    <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {item.diasRestantesDevolucion === 0 ? '¡Devolución Hoy!' : `Vence en ${item.diasRestantesDevolucion} días`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <section style={{ marginTop: '30px' }}>
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
                    <th style={{ padding: '10px' }}>Vehículo / Condición</th>
                    <th style={{ padding: '10px' }}>Fechas Renta</th>
                    <th style={{ padding: '10px' }}>Seguro Full</th>
                    <th style={{ padding: '10px', minWidth: '220px' }}>Desglose Estimado</th>
                    <th style={{ padding: '10px' }}>Entrega / Residencia</th>
                    <th style={{ padding: '10px' }}>Contrato / Firma</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
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
                    const depositoGarantiaVal = res.depositoGarantia !== undefined && res.depositoGarantia !== ''
                      ? Number(res.depositoGarantia)
                      : (tieneSeguroFull ? 0 : 400);

                    const totalCalculado = totalAlquiler + totalSeguro + costoEntregaVal;
                    const granTotal = res.costoTotal ? res.costoTotal : totalCalculado;

                    const tipoVehiculo = obtenerTipoVehiculo(res);
                    const esSubrentado = tipoVehiculo.toLowerCase().includes('subrent');

                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid #222', verticalAlign: 'top' }}>
                        <td style={{ padding: '10px', color: '#aaa', whiteSpace: 'nowrap' }}>
                          {formatearFecha(res.fechaCreacion)}
                          {res.registroManual && (
                            <span style={{ display: 'block', color: '#d4af37', fontSize: '10px', marginTop: '4px' }}>
                              (Registro Manual)
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '10px' }}>
                          <strong>{res.clienteNombre || 'Sin nombre'}</strong><br />
                          <span style={{ color: '#888' }}>{res.clienteTelefono || '-'}</span><br />
                          <span style={{ color: '#666', fontSize: '10px' }}>{res.clienteEmail || '-'}</span>
                        </td>

                        <td style={{ padding: '10px' }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#ccc' }}>
                            {res.tipoCliente || 'Residente'}
                          </span><br />
                          <span style={{ color: '#aaa' }}>{res.documentoCliente || '-'}</span>
                        </td>

                        <td style={{ padding: '10px' }}>
                          <span style={{ color: '#d4af37', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            {res.vehiculoNombre || '-'}
                          </span>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '10px', 
                            fontWeight: 'bold',
                            display: 'inline-block',
                            backgroundColor: esSubrentado ? '#451a03' : '#064e3b',
                            color: esSubrentado ? '#fdba74' : '#6ee7b7',
                            border: `1px solid ${esSubrentado ? '#9a3412' : '#047857'}`
                          }}>
                            {esSubrentado ? '🔄 Subrentado' : '🚗 Propio'}
                          </span>
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
                            display: 'inline-block',
                            backgroundColor: tieneSeguroFull ? '#1b5e20' : '#333',
                            color: tieneSeguroFull ? '#81c784' : '#aaa'
                          }}>
                            {tieneSeguroFull ? 'SÍ' : 'NO'}
                          </span>
                        </td>

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

                        <td style={{ padding: '10px' }}>
                          <strong style={{ color: '#ccc' }}>Lugar:</strong><br />
                          {res.lugarEntrega || 'A coordinar'}<br /><br />
                          <strong style={{ color: '#ccc' }}>Residencia RD:</strong><br />
                          <span style={{ color: '#aaa' }}>{res.clienteDireccionRD || 'No especificada'}</span>
                        </td>

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

                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button 
                            onClick={() => setReservaParaEditar(res)}
                            style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold', fontSize: '11px' }}
                            title="Editar reserva"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={() => handleEliminarReserva(res.id)}
                            style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                            title="Eliminar reserva"
                          >
                            🗑️ Eliminar
                          </button>
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

      {reservaParaEditar && (
        <EditarReservaModal 
          reservaItem={reservaParaEditar} 
          onClose={() => setReservaParaEditar(null)} 
          db={db}
        />
      )}
    </>
  );
}

function EditarReservaModal({ reservaItem, onClose, db }) {
  const [formData, setFormData] = useState({
    clienteNombre: reservaItem.clienteNombre || '',
    clienteTelefono: reservaItem.clienteTelefono || '',
    clienteEmail: reservaItem.clienteEmail || '',
    documentoCliente: reservaItem.documentoCliente || '',
    tipoCliente: reservaItem.tipoCliente || 'Residente',
    vehiculoNombre: reservaItem.vehiculoNombre || '',
    tipoVehiculo: reservaItem.tipoVehiculo || (reservaItem.esSubrentado ? 'Subrentado' : 'Propio'),
    inicio: reservaItem.inicio || '',
    fin: reservaItem.fin || '',
    precioPorDia: reservaItem.precioPorDia || reservaItem.rentaPorDia || 0,
    diasTotales: reservaItem.diasTotales || 1,
    costoTotal: reservaItem.costoTotal || 0,
    depositoGarantia: reservaItem.depositoGarantia !== undefined ? reservaItem.depositoGarantia : 400,
    lugarEntrega: reservaItem.lugarEntrega || '',
    clienteDireccionRD: reservaItem.clienteDireccionRD || '',
    seguroFull: reservaItem.seguroFull === true || reservaItem.seguroFull === 'si' ? 'si' : 'no'
  });

  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const docRef = doc(db, 'reservas', reservaItem.id);
      await updateDoc(docRef, {
        clienteNombre: formData.clienteNombre,
        clienteTelefono: formData.clienteTelefono,
        clienteEmail: formData.clienteEmail,
        documentoCliente: formData.documentoCliente,
        tipoCliente: formData.tipoCliente,
        vehiculoNombre: formData.vehiculoNombre,
        tipoVehiculo: formData.tipoVehiculo,
        esSubrentado: formData.tipoVehiculo === 'Subrentado',
        inicio: formData.inicio,
        fin: formData.fin,
        precioPorDia: Number(formData.precioPorDia),
        diasTotales: Number(formData.diasTotales),
        costoTotal: Number(formData.costoTotal),
        depositoGarantia: Number(formData.depositoGarantia),
        lugarEntrega: formData.lugarEntrega,
        clienteDireccionRD: formData.clienteDireccionRD,
        seguroFull: formData.seguroFull === 'si'
      });
      alert('¡Reserva actualizada correctamente!');
      onClose();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      alert('Hubo un error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: '8px', padding: '25px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', color: '#fff' }}>
        <h2 style={{ color: '#d4af37', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Editar Reserva - {reservaItem.vehiculoNombre}</h2>
        
        <form onSubmit={handleGuardar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Nombre del Cliente</label>
            <input type="text" name="clienteNombre" value={formData.clienteNombre} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} required />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Teléfono</label>
            <input type="text" name="clienteTelefono" value={formData.clienteTelefono} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Correo Electrónico</label>
            <input type="email" name="clienteEmail" value={formData.clienteEmail} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Documento / Cédula / Pasaporte</label>
            <input type="text" name="documentoCliente" value={formData.documentoCliente} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Vehículo (Nombre)</label>
            <input type="text" name="vehiculoNombre" value={formData.vehiculoNombre} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} required />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Condición del Vehículo</label>
            <select name="tipoVehiculo" value={formData.tipoVehiculo} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
              <option value="Propio">🚗 Propio</option>
              <option value="Subrentado">🔄 Subrentado</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Fecha Inicio</label>
            <input type="text" name="inicio" value={formData.inicio} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Fecha Fin</label>
            <input type="text" name="fin" value={formData.fin} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Precio por Día (USD)</label>
            <input type="number" name="precioPorDia" value={formData.precioPorDia} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Días Totales</label>
            <input type="number" name="diasTotales" value={formData.diasTotales} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Costo Total (USD)</label>
            <input type="number" name="costoTotal" value={formData.costoTotal} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Depósito de Garantía (USD)</label>
            <input type="number" name="depositoGarantia" value={formData.depositoGarantia} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Seguro Full</label>
            <select name="seguroFull" value={formData.seguroFull} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}>
              <option value="si">SÍ</option>
              <option value="no">NO</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px' }}>Lugar de Entrega</label>
            <input type="text" name="lugarEntrega" value={formData.lugarEntrega} onChange={handleChange} style={{ width: '100%', padding: '8px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando} style={{ padding: '10px 20px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
