import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function GestionVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehiculoEditar, setVehiculoEditar] = useState(null);

  // Cargar lista de vehículos desde Firestore
  const cargarVehiculos = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'vehiculos'));
      const lista = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setVehiculos(lista);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  // Cambiar estado rápido del vehículo
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'vehiculos', id), { estado: nuevoEstado });
      setVehiculos(prev => prev.map(v => v.id === id ? { ...v, estado: nuevoEstado } : v));
    } catch (error) {
      alert("Error al actualizar estado");
    }
  };

  // Eliminar vehículo
  const handleEliminar = async (id) => {
    if (confirm("¿Estás seguro de eliminar este vehículo de la flota?")) {
      try {
        await deleteDoc(doc(db, 'vehiculos', id));
        setVehiculos(prev => prev.filter(v => v.id !== id));
      } catch (error) {
        alert("Error al eliminar el vehículo");
      }
    }
  };

  // Guardar edición de vehículo
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(db, 'vehiculos', vehiculoEditar.id);
      await updateDoc(ref, {
        nombre: vehiculoEditar.nombre || '',
        ano: vehiculoEditar.ano || '',
        placa: vehiculoEditar.placa || '',
        combustible: vehiculoEditar.combustible || '',
        pasajeros: vehiculoEditar.pasajeros || '',
        transmision: vehiculoEditar.transmision || '',
        imagenUrl: vehiculoEditar.imagenUrl || '',
        // Tarifas Alquiler
        precio_3_5: Number(vehiculoEditar.precio_3_5) || 0,
        precio_6_10: Number(vehiculoEditar.precio_6_10) || 0,
        precio_11_mas: Number(vehiculoEditar.precio_11_mas) || 0,
        // Seguro Full
        seguro_3_5: Number(vehiculoEditar.seguro_3_5) || 0,
        seguro_6_10: Number(vehiculoEditar.seguro_6_10) || 0,
        seguro_11_mas: Number(vehiculoEditar.seguro_11_mas) || 0,
      });

      alert("¡Vehículo actualizado correctamente!");
      setVehiculoEditar(null);
      cargarVehiculos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar los cambios");
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando flota...</p>;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0, color: '#d4af37' }}>Gestión de Flota de Vehículos</h1>
          <p style={{ fontSize: '12px', color: '#aaa', margin: '5px 0 0' }}>Control de disponibilidad, precios por escala, fotos y seguros</p>
        </div>
        <div>
          <a href="/admin" style={{ padding: '8px 16px', backgroundColor: '#333', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            ← Volver a Reservas
          </a>
        </div>
      </div>

      {/* GRID DE VEHÍCULOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {vehiculos.map(vehiculo => (
          <div key={vehiculo.id} style={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* IMAGEN Y BADGE DE ESTADO */}
            <div style={{ position: 'relative', height: '180px', backgroundColor: '#000' }}>
              <img 
                src={vehiculo.imagenUrl || '/placeholder-car.png'} 
                alt={vehiculo.nombre} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                backgroundColor: vehiculo.estado === 'DISPONIBLE' ? '#16a34a' : '#d97706',
                color: '#fff'
              }}>
                {vehiculo.estado || 'DISPONIBLE'}
              </span>
            </div>

            {/* DETALLES Y PRECIOS */}
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{vehiculo.nombre}</h3>
                <button 
                  onClick={() => setVehiculoEditar(vehiculo)}
                  style={{ backgroundColor: '#d4af37', border: 'none', color: '#000', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  ✏️ Editar
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.6', marginBottom: '15px' }}>
                <p style={{ margin: 0 }}>• <strong>Año:</strong> {vehiculo.ano || 'N/A'}</p>
                <p style={{ margin: 0 }}>• <strong>Placa:</strong> {vehiculo.placa || 'N/A'}</p>
                <p style={{ margin: 0 }}>• <strong>Combustible:</strong> {vehiculo.combustible || 'Gasolina'}</p>
                <p style={{ margin: 0 }}>• <strong>Pasajeros:</strong> {vehiculo.pasajeros || '5'}</p>
                <p style={{ margin: 0 }}>• <strong>Transmisión:</strong> {vehiculo.transmision || 'Automático'}</p>
              </div>

              {/* TARIFAS ALQUILER */}
              <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #2a2a2a' }}>
                <p style={{ margin: '0 0 5px', fontSize: '11px', color: '#d4af37', fontWeight: 'bold' }}>Tarifas Alquiler por Días:</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>• 3-5 Días: <strong>USD ${vehiculo.precio_3_5 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>• 6-10 Días: <strong>USD ${vehiculo.precio_6_10 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>• 11+ Días: <strong>USD ${vehiculo.precio_11_mas || 0}/día</strong></p>
              </div>

              {/* SEGURO FULL */}
              <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #2a2a2a' }}>
                <p style={{ margin: '0 0 5px', fontSize: '11px', color: '#22c55e', fontWeight: 'bold' }}>Seguro Full por Días:</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>• 3-5 Días: <strong>USD ${vehiculo.seguro_3_5 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>• 6-10 Días: <strong>USD ${vehiculo.seguro_6_10 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>• 11+ Días: <strong>USD ${vehiculo.seguro_11_mas || 0}/día</strong></p>
              </div>

              {/* CAMBIAR ESTADO RÁPIDO */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Cambiar Estado:</label>
                <select 
                  value={vehiculo.estado || 'DISPONIBLE'}
                  onChange={(e) => handleCambiarEstado(vehiculo.id, e.target.value)}
                  style={{ width: '100%', backgroundColor: '#000', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '4px', fontSize: '12px' }}
                >
                  <option value="DISPONIBLE">🟢 Disponible</option>
                  <option value="TALLER">🟠 En Mantenimiento / Taller</option>
                  <option value="RENTADO">🔴 Rentado</option>
                </select>
              </div>

              {/* BOTÓN ELIMINAR */}
              <button 
                onClick={() => handleEliminar(vehiculo.id)}
                style={{ width: '100%', backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginTop: '5px' }}
              >
                🗑️ Eliminar Vehículo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN DE VEHÍCULO */}
      {vehiculoEditar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', padding: '20px', fontFamily: 'sans-serif' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3f3f46', paddingBottom: '10px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#d4af37' }}>Editar Vehículo: {vehiculoEditar.nombre}</h2>
              <button onClick={() => setVehiculoEditar(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleGuardarEdicion}>
              
              {/* URL DE LA FOTO */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>URL de la Foto / Imagen:</label>
                <input 
                  type="text" 
                  value={vehiculoEditar.imagenUrl || ''} 
                  onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, imagenUrl: e.target.value })} 
                  style={{ width: '100%', padding: '8px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '4px' }} 
                  placeholder="https://..." 
                />
                {vehiculoEditar.imagenUrl && (
                  <img src={vehiculoEditar.imagenUrl} alt="Vista previa" style={{ width: '100%', height: '120px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px' }} />
                )}
              </div>

              {/* DATOS BÁSICOS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#aaa' }}>Nombre / Modelo:</label>
                  <input type="text" value={vehiculoEditar.nombre || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, nombre: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#aaa' }}>Año:</label>
                  <input type="text" value={vehiculoEditar.ano || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, ano: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#aaa' }}>Placa:</label>
                  <input type="text" value={vehiculoEditar.placa || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, placa: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#aaa' }}>Combustible:</label>
                  <input type="text" value={vehiculoEditar.combustible || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, combustible: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '4px' }} />
                </div>
              </div>

              {/* TARIFAS DE ALQUILER */}
              <div style={{ backgroundColor: '#09090b', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #27272a' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#d4af37' }}>Precios Renta Diarios (USD):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>3-5 Días:</label>
                    <input type="number" value={vehiculoEditar.precio_3_5 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, precio_3_5: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>6-10 Días:</label>
                    <input type="number" value={vehiculoEditar.precio_6_10 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, precio_6_10: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>11+ Días:</label>
                    <input type="number" value={vehiculoEditar.precio_11_mas || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, precio_11_mas: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* PRECIOS SEGURO FULL */}
              <div style={{ backgroundColor: '#09090b', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #27272a' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#22c55e' }}>Precios Seguro Full Diarios (USD):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>3-5 Días:</label>
                    <input type="number" value={vehiculoEditar.seguro_3_5 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, seguro_3_5: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>6-10 Días:</label>
                    <input type="number" value={vehiculoEditar.seguro_6_10 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, seguro_6_10: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#aaa' }}>11+ Días:</label>
                    <input type="number" value={vehiculoEditar.seguro_11_mas || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, seguro_11_mas: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setVehiculoEditar(null)} style={{ padding: '8px 16px', backgroundColor: '#3f3f46', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  💾 Guardar Cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
