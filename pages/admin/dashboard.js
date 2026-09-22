import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState({
    ingresosMes: 0,
    alquileresActivos: 0,
    totalVehiculos: 0,
    porcentajeOcupacion: 0,
    proximasDevoluciones: []
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      // 1. Obtener Vehículos
      const vehiculosSnap = await getDocs(collection(db, 'vehiculos'));
      const totalVehiculos = vehiculosSnap.size;

      // 2. Obtener Reservas
      const reservasSnap = await getDocs(collection(db, 'reservas'));
      const reservas = reservasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const hoy = new Date();
      let ingresosMes = 0;
      let activos = 0;
      let devoluciones = [];

      reservas.forEach((res) => {
        const fechaInicio = new Date(res.inicio);
        const fechaFin = new Date(res.fin);

        // Calcular Ingresos del Mes Actual
        if (fechaInicio.getMonth() === hoy.getMonth() && fechaInicio.getFullYear() === hoy.getFullYear()) {
          const gananciaReserva = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);
          ingresosMes += gananciaReserva;
        }

        // Alquileres Activos
        if (hoy >= fechaInicio && hoy <= fechaFin) {
          activos++;
        }

        // Próximas Devoluciones (Hoy o Mañana)
        const diffDias = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
        if (diffDias >= 0 && diffDias <= 1) {
          devoluciones.push(res);
        }
      });

      const ocupacion = totalVehiculos > 0 ? Math.round((activos / totalVehiculos) * 100) : 0;

      setMetricas({
        ingresosMes,
        alquileresActivos: activos,
        totalVehiculos,
        porcentajeOcupacion: ocupacion,
        proximasDevoluciones: devoluciones
      });
    } catch (error) {
      console.error("Error cargando métricas:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGACIÓN AMINISTRATIVA */}
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin/dashboard" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>📊 Métricas</a>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota de Vehículos</a>
        <a href="/admin/vehiculos/nuevo" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>➕ Nuevo Vehículo</a>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '25px' }}>
        <h1 style={{ color: '#d4af37', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>📊 Dashboard de Métricas</h1>

        {cargando ? (
          <p style={{ color: '#888' }}>Cargando datos financieros y de flota...</p>
        ) : (
          <>
            {/* TARJETAS DE KPIS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              
              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #22c55e', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Ingresos del Mes</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#22c55e' }}>
                  USD ${metricas.ingresosMes.toLocaleString()}
                </p>
              </div>

              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #3b82f6', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Alquileres Activos</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#3b82f6' }}>
                  {metricas.alquileresActivos} / {metricas.totalVehiculos} autos
                </p>
              </div>

              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #d4af37', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Tasa de Ocupación</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#d4af37' }}>
                  {metricas.porcentajeOcupacion}%
                </p>
              </div>

            </div>

            {/* SECCIÓN DE ALERTAS Y DEVOLUCIONES */}
            <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '6px', border: '1px solid #222' }}>
              <h2 style={{ fontSize: '15px', color: '#d4af37', marginTop: 0, marginBottom: '15px' }}>🔔 Devoluciones Pendientes (Hoy / Mañana)</h2>
              {metricas.proximasDevoluciones.length === 0 ? (
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>No hay devoluciones programadas para hoy o mañana.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {metricas.proximasDevoluciones.map((dev) => (
                    <div key={dev.id} style={{ backgroundColor: '#181818', padding: '12px', borderRadius: '4px', border: '1px solid #333', fontSize: '12px' }}>
                      <strong style={{ color: '#fff' }}>{dev.vehiculoNombre || dev.vehiculoId}</strong>
                      <span style={{ color: '#888', marginLeft: '10px' }}>Cliente: {dev.clienteNombre || 'Sin nombre'} ({dev.clienteTelefono || 'Sin teléfono'})</span>
                      <span style={{ color: '#ef4444', float: 'right', fontWeight: 'bold' }}>Devolución: {dev.fin}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
