import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function DetalleCliente() {
  const router = useRouter();
  const { telefono } = router.query;
  
  const [cliente, setCliente] = useState(null);
  const [reservasCliente, setReservasCliente] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (telefono) {
      cargarDetalleCliente();
    }
  }, [telefono]);

  const cargarDetalleCliente = async () => {
    try {
      const reservasSnap = await getDocs(collection(db, 'reservas'));
      const todasLasReservas = reservasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtradas = todasLasReservas.filter(res => {
        const telRes = res.clienteTelefono || res.telefono || '';
        return telRes === telefono;
      });

      setReservasCliente(filtradas);

      if (filtradas.length > 0) {
        const primera = filtradas[0];
        
        let infoExtra = {};
        try {
          const clienteDocSnap = await getDocs(collection(db, 'clientes'));
          clienteDocSnap.forEach(d => {
            if (d.id === telefono) {
              infoExtra = d.data();
            }
          });
        } catch (e) {
          console.log("No se encontró documento extra en clientes");
        }

        let gastoTotal = 0;
        filtradas.forEach(res => {
          const ganancia = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);
          gastoTotal += ganancia;
        });

        setCliente({
          nombre: primera.clienteNombre || primera.nombre || 'Cliente sin nombre',
          telefono: telefono,
          cedula: primera.documentoCliente || primera.cedula || primera.pasaporte || primera.documento || primera.clienteCedula || primera.clientePasaporte || 'No registrada',         
          licencia: primera.licencia || primera.clienteLicencia || 'No registrada',
          totalAlquileres: filtradas.length,
          gastoTotal: gastoTotal,
          enListaNegra: infoExtra.enListaNegra || false,
          motivoListaNegra: infoExtra.motivoListaNegra || ''
        });
      }
    } catch (error) {
      console.error("Error cargando detalle del cliente:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGACIÓN */}
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota</a>
        <a href="/admin/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📊 Métricas</a>
        <a href="/admin/calendario" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📅 Calendario</a>
        <a href="/admin/clientes" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>👥 Clientes / CRM</a>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto' }}>
        
        <button 
          onClick={() => router.push('/admin/clientes')}
          style={{ backgroundColor: '#181818', color: '#aaa', border: '1px solid #333', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', fontSize: '12px', fontWeight: 'bold' }}
        >
          ← Volver al listado de clientes
        </button>

        {cargando ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Cargando perfil del cliente...</p>
        ) : !cliente ? (
          <div style={{ backgroundColor: '#111', padding: '30px', textAlign: 'center', borderRadius: '8px', border: '1px solid #222' }}>
            <p style={{ color: '#888' }}>No se encontró información para este cliente.</p>
          </div>
        ) : (
          <div>
            {/* TARJETA DE PERFIL */}
            <div style={{ backgroundColor: '#111', borderRadius: '8px', border: cliente.enListaNegra ? '1px solid #ef4444' : '1px solid #333', padding: '25px', marginBottom: '25px' }}>
              
              {cliente.enListaNegra && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 15px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
                  🚨 CLIENTE EN LISTA NEGRA: {cliente.motivoListaNegra || 'Sin motivo especificado'}
                </div>
              )}

              <h1 style={{ color: '#d4af37', fontSize: '22px', margin: '0 0 15px 0', fontWeight: 'bold' }}>{cliente.nombre}</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '14px', color: '#ccc' }}>
                <div style={{ backgroundColor: '#181818', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Teléfono</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{cliente.telefono}</p>
                </div>

                <div style={{ backgroundColor: '#181818', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Cédula / Pasaporte</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{cliente.cedula}</p>
                </div>

                <div style={{ backgroundColor: '#181818', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Licencia de Conducir</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>{cliente.licencia}</p>
                </div>

                <div style={{ backgroundColor: '#181818', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Historial Financiero</p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#22c55e' }}>{cliente.totalAlquileres} alquileres | USD ${cliente.gastoTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* HISTORIAL DE ALQUILERES DETALLADO */}
            <h2 style={{ fontSize: '18px', color: '#fff', marginBottom: '15px' }}>🚗 Historial de Alquileres de este Cliente</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reservasCliente.map((res, index) => {
                const gananciaRes = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);
                
                // Fechas
                const fechaInicioVal = res.inicio || res.fechaInicio || res.desde || res.startDate || '';
                const fechaFinVal = res.fin || res.fechaFin || res.hasta || res.endDate || '';

                // Cálculo automático de días
                let dias = 0;
                if (fechaInicioVal && fechaFinVal) {
                  const d1 = new Date(fechaInicioVal);
                  const d2 = new Date(fechaFinVal);
                  const diffTime = d2 - d1;
                  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                  dias = diffDays > 0 ? diffDays : 1; // Mínimo 1 día por seguridad
                }

                // Precio por día (busca si existe en el objeto o lo calcula dividiendo el costo total / días)
                const precioPorDia = res.precioPorDia || res.precioDia || (dias > 0 ? Math.round(gananciaRes / dias) : 0);

                return (
                  <div key={index} style={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid #222', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#d4af37', fontSize: '15px' }}>{res.vehiculoNombre || res.vehiculoId || 'Vehículo reservado'}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#aaa' }}>
                        📅 <strong>Del:</strong> {fechaInicioVal || 'N/D'} <strong>al</strong> {fechaFinVal || 'N/D'} {dias > 0 && <span style={{ color: '#d4af37' }}>({dias} {dias === 1 ? 'día' : 'días'})</span>}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#888' }}>
                        💵 <strong>Precio por día:</strong> USD ${precioPorDia.toLocaleString()}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                        Estado: {res.estado || 'Registrada'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#22c55e' }}>
                        USD ${gananciaRes.toLocaleString()}
                      </p>
                      <span style={{ fontSize: '11px', backgroundColor: '#181818', padding: '4px 8px', borderRadius: '4px', color: '#aaa', border: '1px solid #333' }}>
                        ID: {res.id ? res.id.slice(0, 8) : 'N/D'}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
