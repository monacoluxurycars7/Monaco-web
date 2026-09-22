import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Ajusta la ruta a tu archivo de firebase

export default function DashboardMetrics() {
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
          ingresosMes += Number(res.costoTotal || 0);
        }

        // Alquileres Activos (Fecha actual entre inicio y fin)
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

  if (cargando) {
    return <div style={{ padding: '20px', color: '#fff' }}>Cargando métricas del panel...</div>;
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#0f0f0f', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#d4af37', marginBottom: '25px' }}>📊 Dashboard de Métricas</h1>

      {/* TARJETAS DE KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #d4af37' }}>
          <h3 style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Ingresos del Mes</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#2ed573' }}>
            ${metricas.ingresosMes.toLocaleString()} USD
          </p>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #3700b3' }}>
          <h3 style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Alquileres Activos</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
            {metricas.alquileresActivos} / {metricas.totalVehiculos}
          </p>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ff9f43' }}>
          <h3 style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>Tasa de Ocupación</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
            {metricas.porcentajeOcupacion}%
          </p>
        </div>
      </div>

      {/* SECCIÓN DE ALERTAS Y DEVOLUCIONES */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px' }}>
        <h2 style={{ fontSize: '18px', color: '#d4af37', marginTop: 0 }}>🔔 Devoluciones Pendientes (Hoy / Mañana)</h2>
        {metricas.proximasDevoluciones.length === 0 ? (
          <p style={{ color: '#888' }}>No hay devoluciones programadas para hoy o mañana.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {metricas.proximasDevoluciones.map((dev) => (
              <li key={dev.id} style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
                <strong>{dev.vehiculoNombre}</strong> - Cliente: {dev.clienteNombre} ({dev.clienteTelefono}) | Devolución: {dev.fin}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
