import { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function MantenimientoVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [historialGastos, setHistorialGastos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Formulario de nuevo gasto/mantenimiento
  const [tipo, setTipo] = useState('Mantenimiento (Aceite/Frenos)');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [kilometrajeMomento, setKilometrajeMomento] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Fechas del vehículo seleccionado (Seguro y Marbete)
  const [vencimientoSeguro, setVencimientoSeguro] = useState('');
  const [vencimientoMarbete, setVencimientoMarbete] = useState('');
  const [kilometrajeActual, setKilometrajeActual] = useState('');

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const snap = await getDocs(collection(db, 'vehiculos'));
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVehiculos(lista);
      if (lista.length > 0) seleccionarVehiculo(lista[0]);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarVehiculo = async (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setVencimientoSeguro(vehiculo.vencimientoSeguro || '');
    setVencimientoMarbete(vehiculo.vencimientoMarbete || '');
    setKilometrajeActual(vehiculo.kilometrajeActual || '');

    try {
      const q = query(collection(db, 'mantenimientos'), where('vehiculoId', '==', vehiculo.id));
      const snap = await getDocs(q);
      const gastos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistorialGastos(gastos);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    }
  };

  const actualizarFechasVehiculo = async (e) => {
    e.preventDefault();
    if (!vehiculoSeleccionado) return;

    try {
      await updateDoc(doc(db, 'vehiculos', vehiculoSeleccionado.id), {
        vencimientoSeguro,
        vencimientoMarbete,
        kilometrajeActual: Number(kilometrajeActual)
      });
      alert('¡Fechas y kilometraje actualizados correctamente!');
      cargarVehiculos();
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      alert('Hubo un error al actualizar los datos del vehículo.');
    }
  };

  const registrarGasto = async (e) => {
    e.preventDefault();
    if (!vehiculoSeleccionado || !costo || !descripcion) return;

    try {
      const nuevoGasto = {
        vehiculoId: vehiculoSeleccionado.id,
        vehiculoNombre: vehiculoSeleccionado.nombre || vehiculoSeleccionado.modelo,
        tipo,
        descripcion,
        costo: Number(costo),
        kilometrajeMomento: Number(kilometrajeMomento || 0),
        fecha,
        creadoEn: new Date().toISOString()
      };

      await addDoc(collection(db, 'mantenimientos'), nuevoGasto);

      if (kilometrajeMomento) {
        await updateDoc(doc(db, 'vehiculos', vehiculoSeleccionado.id), {
          kilometrajeActual: Number(kilometrajeMomento)
        });
        setKilometrajeActual(kilometrajeMomento);
      }

      alert('¡Gasto o mantenimiento registrado con éxito!');
      setDescripcion('');
      setCosto('');
      setKilometrajeMomento('');
      seleccionarVehiculo(vehiculoSeleccionado);
    } catch (error) {
      console.error("Error al registrar gasto:", error);
      alert('Hubo un error al guardar el registro.');
    }
  };

  const eliminarGasto = async (idGasto) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro de gasto?')) return;
    try {
      await deleteDoc(doc(db, 'mantenimientos', idGasto));
      seleccionarVehiculo(vehiculoSeleccionado);
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      alert('Hubo un error al eliminar el registro.');
    }
  };

  const verificarAlertaFecha = (fechaStr) => {
    if (!fechaStr) return { estado: 'ok', texto: 'No configurado' };
    const hoy = new Date();
    const vencimiento = new Date(fechaStr);
    const diferenciaDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) return { estado: 'vencido', texto: '¡VENCIDO!' };
    if (diferenciaDias <= 15) return { estado: 'proximo', texto: `Vence en ${diferenciaDias} días` };
    return { estado: 'ok', texto: `Vence en ${diferenciaDias} días` };
  };

  // Calcular el total de gastos del vehículo seleccionado
  const totalGastos = historialGastos.reduce((acc, curr) => acc + Number(curr.costo || 0), 0);

  if (cargando) return <div style={{ padding: '40px', color: '#fff', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>Cargando módulo...</div>;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '30px', fontFamily: 'sans-serif' }}>
      
      {/* ENCABEZADO CON BOTÓN DE REGRESO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '22px', margin: '0' }}>🛠️ Mantenimiento y Control de Gastos por Vehículo</h1>
        <a 
          href="/admin/vehiculos" 
          style={{ padding: '8px 14px', backgroundColor: '#222', color: '#ccc', textDecoration: 'none', borderRadius: '4px', border: '1px solid #444', fontSize: '13px', fontWeight: 'bold' }}
        >
          ← Volver a Flota
        </a>
      </div>

      {/* Selector de Vehículos */}
      <div style={{ display: 'flex', gap: '15px', margin: '20px 0', overflowX: 'auto' }}>
        {vehiculos.map(v => {
          const alertaSeguro = verificarAlertaFecha(v.vencimientoSeguro);
          const alertaMarbete = verificarAlertaFecha(v.vencimientoMarbete);
          const tieneAlerta = alertaSeguro.estado === 'vencido' || alertaSeguro.estado === 'proximo' || alertaMarbete.estado === 'vencido' || alertaMarbete.estado === 'proximo';

          return (
            <button
              key={v.id}
              onClick={() => seleccionarVehiculo(v)}
              style={{
                padding: '12px 20px',
                backgroundColor: vehiculoSeleccionado?.id === v.id ? '#D4AF37' : '#1a1a1a',
                color: vehiculoSeleccionado?.id === v.id ? '#000' : '#fff',
                border: tieneAlerta ? '2px solid #ff4d4d' : '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                position: 'relative'
              }}
            >
              {v.nombre || v.modelo || 'Vehículo'} {tieneAlerta && '⚠️'}
            </button>
          );
        })}
      </div>

      {vehiculoSeleccionado && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
          
          {/* Columna Izquierda: Configuración de Documentos y Formulario de Gastos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Panel de Vencimientos y Alertas */}
            <div style={{ backgroundColor: '#141414', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
              <h3>🚨 Estado y Vencimientos</h3>
              <form onSubmit={actualizarFechasVehiculo} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Vencimiento Seguro</label>
                    <input 
                      type="date" 
                      value={vencimientoSeguro}
                      onChange={e => setVencimientoSeguro(e.target.value)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                    />
                    <small style={{ color: verificarAlertaFecha(vencimientoSeguro).estado === 'vencido' ? '#ff4d4d' : '#aaa' }}>
                      {verificarAlertaFecha(vencimientoSeguro).texto}
                    </small>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Vencimiento Marbete</label>
                    <input 
                      type="date" 
                      value={vencimientoMarbete}
                      onChange={e => setVencimientoMarbete(e.target.value)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                    />
                    <small style={{ color: verificarAlertaFecha(vencimientoMarbete).estado === 'vencido' ? '#ff4d4d' : '#aaa' }}>
                      {verificarAlertaFecha(vencimientoMarbete).texto}
                    </small>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Kilometraje Actual</label>
                  <input 
                    type="number" 
                    value={kilometrajeActual}
                    onChange={e => setKilometrajeActual(e.target.value)}
                    placeholder="Ej. 45000"
                    style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                  />
                </div>

                <button 
                  type="submit"
                  style={{ backgroundColor: '#333', color: '#fff', padding: '8px', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Actualizar Datos del Vehículo
                </button>
              </form>
            </div>

            {/* Formulario de Registro de Gastos */}
            <div style={{ backgroundColor: '#141414', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
              <h3>Registrar Gasto o Mantenimiento</h3>
              <form onSubmit={registrarGasto} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Tipo</label>
                  <select 
                    value={tipo} 
                    onChange={e => setTipo(e.target.value)}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                  >
                    <option value="Mantenimiento (Aceite/Frenos)">Cambio de Aceite / Frenos / Neumáticos</option>
                    <option value="Seguro">Pago de Seguro</option>
                    <option value="Marbete/Placa">Marbete / Impuesto Vehicular</option>
                    <option value="Reparación Mecánica">Reparación Mecánica / Taller</option>
                    <option value="Estética/Detallado">Estética / Lavado Premium</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Descripción</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Cambio de pastillas de freno"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Costo (USD)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={costo}
                      onChange={e => setCosto(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Km al momento</label>
                    <input 
                      type="number" 
                      placeholder="Ej. 45000"
                      value={kilometrajeMomento}
                      onChange={e => setKilometrajeMomento(e.target.value)}
                      style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Fecha</label>
                  <input 
                    type="date" 
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                  />
                </div>

                <button 
                  type="submit"
                  style={{ backgroundColor: '#D4AF37', color: '#000', padding: '10px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Guardar Gasto
                </button>
              </form>
            </div>

          </div>

          {/* Columna Derecha: Historial de Gastos y Total */}
          <div style={{ backgroundColor: '#141414', padding: '20px', borderRadius: '12px', border: '1px solid #222', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Historial de Costos</h3>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#aaa', display: 'block' }}>Total Invertido</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#D4AF37' }}>${totalGastos.toLocaleString()} USD</span>
              </div>
            </div>

            <div style={{ marginTop: '15px', maxHeight: '500px', overflowY: 'auto' }}>
              {historialGastos.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '30px 0' }}>No hay registros de gastos para este vehículo.</p>
              ) : (
                historialGastos.map(g => (
                  <div key={g.id} style={{ padding: '12px 0', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#D4AF37' }}>{g.tipo}</strong>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#ccc' }}>{g.descripcion}</p>
                      <small style={{ color: '#777' }}>Fecha: {g.fecha} {g.kilometrajeMomento ? `• ${g.kilometrajeMomento} km` : ''}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ff6b6b' }}>
                        -${g.costo} USD
                      </div>
                      <button 
                        onClick={() => eliminarGasto(g.id)}
                        title="Eliminar registro"
                        style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
