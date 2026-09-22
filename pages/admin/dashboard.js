import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState({
    ingresosMes: 0,
    alquileresActivos: 0,
    totalVehiculos: 0,
    porcentajeOcupacion: 0,
    proximasDevoluciones: [],
    rankingAutos: []
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
      let rentabilidadAutos = {};

      reservas.forEach((res) => {
        const fechaInicio = new Date(res.inicio);
        const fechaFin = new Date(res.fin);

        // Ganancia neta para Mónaco (comisión si es tercero, costo total si es propio)
        const gananciaReserva = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);

        // Calcular Ingresos del Mes Actual
        if (fechaInicio.getMonth() === hoy.getMonth() && fechaInicio.getFullYear() === hoy.getFullYear()) {
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

        // Acumular rentabilidad por vehículo
        const nombreAuto = res.vehiculoNombre || res.vehiculoId || 'Vehículo sin nombre';
        if (!rentabilidadAutos[nombreAuto]) {
          rentabilidadAutos[nombreAuto] = { totalIngresos: 0, vecesRentado: 0 };
        }
        rentabilidadAutos[nombreAuto].totalIngresos += gananciaReserva;
        rentabilidadAutos[nombreAuto].vecesRentado += 1;
      });

      // Convertir el objeto a un array ordenado de mayor a menor ganancia
      const rankingArray = Object.keys(rentabilidadAutos).map((auto) => ({
        nombre: auto,
        ingresos: rentabilidadAutos[auto].totalIngresos,
        veces: rentabilidadAutos[auto].vecesRentado
      })).sort((a, b) => b.ingresos - a.ingresos);

      const ocupacion = totalVehiculos > 0 ? Math.round((activos / totalVehiculos) * 100) : 0;

      setMetricas({
        ingresosMes,
        alquileresActivos: activos,
        totalVehiculos,
        porcentajeOcupacion: ocupacion,
        proximasDevoluciones: devoluciones,
        rankingAutos: rankingArray
      });
    } catch (error) {
      console.error("Error cargando métricas:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGACIÓN ADMINISTRATIVA */}
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota de Vehículos</a>
        <a href="/admin/dashboard" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>📊 Métricas</a>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '25px' }}>
        <h1 style={{ color: '#d4af37', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>📊 Dashboard de Métricas y Rendimiento</h1>

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

            {/* SECCIÓN DE RANKING DE AUTOS MÁS RENTABLES */}
            <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '6px', border: '1px solid #222', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '15px', color: '#d4af37', marginTop: 0, marginBottom: '15px' }}>🏆 Ranking de Autos Más Rentables</h2>
              {metricas.rankingAutos.length === 0 ? (
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>No hay datos suficientes para calcular la rentabilidad.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {metricas.rankingAutos.map((auto, index) => (
                    <div key={index} style={{ backgroundColor: '#181818', padding: '12px 15px', borderRadius: '4px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>#{index + 1}</span>
                        <strong style={{ color: '#fff' }}>{auto.nombre}</strong>
                        <span style={{ color: '#888', marginLeft: '10px' }}>({auto.veces} {auto.veces === 1 ? 'reserva' : 'reservas'})</span>
                      </div>
                      <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        USD ${auto.ingresos.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
