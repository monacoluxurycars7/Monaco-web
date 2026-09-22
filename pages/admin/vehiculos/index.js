import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function GestionVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehiculoEditar, setVehiculoEditar] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Cargar vehículos desde Firestore
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

  // Manejar subida de archivo de imagen local y convertir a Base64 / URL
  const handleSeleccionarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    setSubiendoImagen(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVehiculoEditar(prev => ({
        ...prev,
        imagenUrl: reader.result // Convierte la imagen a Base64 para guardarla directamente
      }));
      setSubiendoImagen(false);
    };
    reader.readAsDataURL(file);
  };

  // Cambiar estado rápido
  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'vehiculos', id), { estado: nuevoEstado });
      setVehiculos(prev => prev.map(v => v.id === id ? { ...v, estado: nuevoEstado } : v));
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  // Eliminar vehículo
  const handleEliminar = async (id) => {
    if (confirm("¿Estás seguro de eliminar este vehículo?")) {
      try {
        await deleteDoc(doc(db, 'vehiculos', id));
        setVehiculos(prev => prev.filter(v => v.id !== id));
      } catch (error) {
        alert("Error al eliminar el vehículo");
      }
    }
  };

  // Guardar cambios del vehículo editado
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
        precio_3_5: Number(vehiculoEditar.precio_3_5) || 0,
        precio_6_10: Number(vehiculoEditar.precio_6_10) || 0,
        precio_11_mas: Number(vehiculoEditar.precio_11_mas) || 0,
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

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>Cargando flota...</div>;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* ENCABEZADO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#d4af37', fontWeight: 'bold' }}>Gestión de Flota de Vehículos</h1>
          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Control de disponibilidad, precios por escala y seguros</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
<a href="/admin/vehiculos/nuevo" style={{ padding: '8px 14px', backgroundColor: '#d4af37', color: '#000', textDecoration: 'none'            + Agregar Vehículo
          </a>
          <a href="/admin" style={{ padding: '8px 14px', backgroundColor: '#222', color: '#ccc', textDecoration: 'none', borderRadius: '4px', fontSize: '12px', border: '1px solid #333' }}>
            ← Volver a Reservas
          </a>
        </div>
      </div>

      {/* TARJETAS DE VEHÍCULOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '15px' }}>
        {vehiculos.map(v => (
          <div key={v.id} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '6px', overflow: 'hidden' }}>
            
            {/* IMAGEN Y ESTADO */}
            <div style={{ position: 'relative', height: '170px', backgroundColor: '#000' }}>
              <img src={v.imagenUrl || '/placeholder.png'} alt={v.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '3px 8px',
                borderRadius: '3px',
                fontSize: '9px',
                fontWeight: 'bold',
                backgroundColor: v.estado === 'DISPONIBLE' ? '#15803d' : v.estado === 'TALLER' ? '#b45309' : '#dc2626',
                color: '#fff'
              }}>
                {v.estado || 'DISPONIBLE'}
              </span>
            </div>

            {/* CONTENIDO TARJETA */}
            <div style={{ padding: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' }}>{v.nombre}</h3>
                <button 
                  onClick={() => setVehiculoEditar(v)}
                  style={{ backgroundColor: '#d4af37', border: 'none', color: '#000', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                >
                  ✏️ Editar
                </button>
              </div>

              {/* ESPECIFICACIONES */}
              <div style={{ fontSize: '11px', color: '#999', lineHeight: '1.5', marginBottom: '10px' }}>
                <p style={{ margin: 0 }}>• <strong>Año:</strong> {v.ano || '-'}</p>
                <p style={{ margin: 0 }}>• <strong>Placa:</strong> {v.placa || '-'}</p>
                <p style={{ margin: 0 }}>• <strong>Combustible:</strong> {v.combustible || 'Gasolina'}</p>
                <p style={{ margin: 0 }}>• <strong>Pasajeros:</strong> {v.pasajeros || '5'}</p>
                <p style={{ margin: 0 }}>• <strong>Transmisión:</strong> {v.transmision || 'Automático'}</p>
              </div>

              {/* TARIFAS ALQUILER POR DÍAS */}
              <div style={{ backgroundColor: '#181818', padding: '8px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #282828' }}>
                <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#d4af37', fontWeight: 'bold' }}>Tarifas Alquiler por Días:</p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#ccc' }}>• 3-5 Días: <strong>USD ${v.precio_3_5 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#ccc' }}>• 6-10 Días: <strong>USD ${v.precio_6_10 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#ccc' }}>• 11+ Días: <strong>USD ${v.precio_11_mas || 0}/día</strong></p>
              </div>

              {/* SEGURO FULL POR DÍAS */}
              <div style={{ backgroundColor: '#181818', padding: '8px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #282828' }}>
                <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>Seguro Full por Días:</p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#ccc' }}>• 3-5 Días: <strong>USD ${v.seguro_3_5 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#ccc' }}>• 6-10 Días: <strong>USD ${v.seguro_6_10 || 0}/día</strong></p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#ccc' }}>• 11+ Días: <strong>USD ${v.seguro_11_mas || 0}/día</strong></p>
              </div>

              {/* CAMBIAR ESTADO */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '10px', color: '#777', display: 'block', marginBottom: '3px' }}>Cambiar Estado:</label>
                <select 
                  value={v.estado || 'DISPONIBLE'} 
                  onChange={(e) => handleCambiarEstado(v.id, e.target.value)}
                  style={{ width: '100%', backgroundColor: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '4px', fontSize: '11px' }}
                >
                  <option value="DISPONIBLE">🟢 Disponible</option>
                  <option value="TALLER">🟠 En Mantenimiento / Taller</option>
                  <option value="RENTADO">🔴 Rentado</option>
                </select>
              </div>

              {/* BOTÓN ELIMINAR */}
              <button 
                onClick={() => handleEliminar(v.id)}
                style={{ width: '100%', backgroundColor: '#330808', color: '#ef4444', border: '1px solid #7f1d1d', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
              >
                🗑️ Eliminar
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* MODAL PARA EDITAR FOTO Y PRECIOS */}
      {vehiculoEditar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
          <div style={{ backgroundColor: '#141414', border: '1px solid #333', color: '#fff', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '6px', padding: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#d4af37' }}>Editar Vehículo: {vehiculoEditar.nombre}</h2>
              <button onClick={() => setVehiculoEditar(null)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleGuardarEdicion}>
              
              {/* SUBIR ARCHIVO DE IMAGEN */}
              <div style={{ marginBottom: '15px', backgroundColor: '#000', padding: '12px', borderRadius: '4px', border: '1px solid #222' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#d4af37', fontWeight: 'bold', marginBottom: '6px' }}>
                  📸 Subir Foto del Vehículo (Desde tu equipo):
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSeleccionarArchivo} 
                  style={{ width: '100%', padding: '6px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }} 
                />
                
                {subiendoImagen && (
                  <p style={{ fontSize: '10px', color: '#d4af37', margin: '5px 0 0' }}>Cargando vista previa de la imagen...</p>
                )}

                {vehiculoEditar.imagenUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '4px' }}>Vista Previa de la Foto Actual:</span>
                    <img src={vehiculoEditar.imagenUrl} alt="Vista previa" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #333' }} />
                  </div>
                )}
              </div>

              {/* DATOS BÁSICOS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#aaa' }}>Nombre / Modelo:</label>
                  <input type="text" value={vehiculoEditar.nombre || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, nombre: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#aaa' }}>Año:</label>
                  <input type="text" value={vehiculoEditar.ano || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, ano: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#aaa' }}>Placa:</label>
                  <input type="text" value={vehiculoEditar.placa || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, placa: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#aaa' }}>Combustible:</label>
                  <input type="text" value={vehiculoEditar.combustible || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, combustible: e.target.value })} style={{ width: '100%', padding: '6px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                </div>
              </div>

              {/* PRECIOS DE RENTA POR ESCALA */}
              <div style={{ backgroundColor: '#000', padding: '10px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #222' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '11px', color: '#d4af37' }}>Precios Renta Diarios (USD):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#888' }}>3-5 Días:</label>
                    <input type="number" value={vehiculoEditar.precio_3_5 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, precio_3_5: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#888' }}>6-10 Días:</label>
                    <input type="number" value={vehiculoEditar.precio_6_10 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, precio_6_10: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#888' }}>11+ Días:</label>
                    <input type="number" value={vehiculoEditar.precio_11_mas || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, precio_11_mas: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                </div>
              </div>

              {/* PRECIOS SEGURO FULL POR ESCALA */}
              <div style={{ backgroundColor: '#000', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #222' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '11px', color: '#22c55e' }}>Precios Seguro Full Diarios (USD):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: '#888' }}>3-5 Días:</label>
                    <input type="number" value={vehiculoEditar.seguro_3_5 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, seguro_3_5: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#888' }}>6-10 Días:</label>
                    <input type="number" value={vehiculoEditar.seguro_6_10 || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, seguro_6_10: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#888' }}>11+ Días:</label>
                    <input type="number" value={vehiculoEditar.seguro_11_mas || ''} onChange={(e) => setVehiculoEditar({ ...vehiculoEditar, seguro_11_mas: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '11px' }} />
                  </div>
                </div>
              </div>

              {/* BOTONES DE GUARDAR O CANCELAR */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setVehiculoEditar(null)} style={{ padding: '7px 14px', backgroundColor: '#222', color: '#ccc', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '7px 18px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
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
