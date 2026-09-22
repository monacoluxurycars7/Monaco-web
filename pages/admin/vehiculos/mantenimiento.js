import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore';

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
    try {
      const q = query(collection(db, 'mantenimientos'), where('vehiculoId', '==', vehiculo.id));
      const snap = await getDocs(q);
      const gastos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistorialGastos(gastos);
    } catch (error) {
      console.error("Error cargando gastos:", error);
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

      // Si el usuario actualizó el kilometraje en el mantenimiento, actualizar el vehículo
      if (kilometrajeMomento) {
        await updateDoc(doc(db, 'vehiculos', vehiculoSeleccionado.id), {
          kilometrajeActual: Number(kilometrajeMomento)
        });
      }

      alert('¡Gasto/Mantenimiento registrado con éxito!');
      setDescripcion('');
      setCosto('');
      setKilometrajeMomento('');
      seleccionarVehiculo(vehiculoSeleccionado);
    } catch (error) {
      console.error("Error al registrar gasto:", error);
      alert('Hubo un error al guardar el registro.');
    }
  };

  if (cargando) return <div style={{ padding: '40px', color: '#fff', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>Cargando módulo de mantenimiento...</div>;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>🛠️ Control de Mantenimiento y Gastos por Vehículo</h1>
      
      {/* Selector de Vehículos */}
      <div style={{ display: 'flex', gap: '15px', margin: '20px 0', overflowX: 'auto' }}>
        {vehiculos.map(v => (
          <button
            key={v.id}
            onClick={() => seleccionarVehiculo(v)}
            style={{
              padding: '12px 20px',
              backgroundColor: vehiculoSeleccionado?.id === v.id ? '#D4AF37' : '#1a1a1a',
              color: vehiculoSeleccionado?.id === v.id ? '#000' : '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {v.nombre || v.modelo || 'Vehículo sin nombre'}
          </button>
        ))}
      </div>

      {vehiculoSeleccionado && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
          
          {/* Formulario de Registro */}
          <div style={{ backgroundColor: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #222' }}>
            <h3>Registrar Nuevo Gasto o Mantenimiento</h3>
            <form onSubmit={registrarGasto} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>Tipo de Registro</label>
                <select 
                  value={tipo} 
                  onChange={e => setTipo(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                >
                  <option value="Mantenimiento (Aceite/Frenos)">Cambio de Aceite / Frenos / Neumáticos</option>
                  <option value="Seguro">Pago de Seguro</option>
                  <option value="Marbete/Placa">Marbete / Impuesto Vehicular</option>
                  <option value="Reparación Mecánica">Reparación Mecánica / Taller</option>
                  <option value="Estética/Detallado">Estética / Lavado Premium</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>Descripción / Detalle</label>
                <input 
                  type="text" 
                  placeholder="Ej. Cambio de pastillas de freno delanteras"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>Costo (USD)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={costo}
                    onChange={e => setCosto(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>Kilometraje Actual (opcional)</label>
                  <input 
                    type="number" 
                    placeholder="Ej. 45000"
                    value={kilometrajeMomento}
                    onChange={e => setKilometrajeMomento(e.target.value)}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '5px' }}>Fecha</label>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', backgroundColor: '#222', color: '#fff', border: '1px solid #441', borderRadius: '6px' }}
                />
              </div>

              <button 
                type="submit"
                style={{ backgroundColor: '#D4AF37', color: '#000', padding: '12px', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
              >
                Guardar Gasto
              </button>
            </form>
          </div>

          {/* Historial de Gastos del Vehículo */}
          <div style={{ backgroundColor: '#141414', padding: '25px', borderRadius: '12px', border: '1px solid #222' }}>
            <h3>Historial de Costos - {vehiculoSeleccionado.nombre || vehiculoSeleccionado.modelo}</h3>
            <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto' }}>
              {historialGastos.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No hay registros de gastos para este vehículo.</p>
              ) : (
                historialGastos.map(g => (
                  <div key={g.id} style={{ padding: '12px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#D4AF37' }}>{g.tipo}</strong>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#ccc' }}>{g.descripcion}</p>
                      <small style={{ color: '#666' }}>Fecha: {g.fecha} {g.kilometrajeMomento ? `• ${g.kilometrajeMomento} km` : ''}</small>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff6b6b' }}>
                      -${g.costo} USD
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
