import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [reservas, setReservas] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado para el mes y año seleccionado (Formato 'YYYY-MM')
  const obtenerMesActualStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [mesSeleccionado, setMesSeleccionado] = useState(obtenerMesActualStr());

  useEffect(() => {
    cargarDatosGlobales();
  }, []);

  const cargarDatosGlobales = async () => {
    try {
      const [vehiculosSnap, reservasSnap, mantenimientosSnap] = await Promise.all([
        getDocs(collection(db, 'vehiculos')),
        getDocs(collection(db, 'reservas')),
        getDocs(collection(db, 'mantenimientos'))
      ]);

      setVehiculos(vehiculosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setReservas(reservasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setMantenimientos(mantenimientosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función auxiliar para obtener el mes anterior en formato 'YYYY-MM'
  const obtenerMesAnteriorStr = (mesStr) => {
    const [anio, mes] = mesStr.split('-').map(Number);
    const fecha = new Date(anio, mes - 2, 1);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  };

  // Lógica de cálculo filtrada por un mes específico ('YYYY-MM')
  const calcularMetricasPorMes = (mesStr) => {
    const [anioFiltro, mesFiltro] = mesStr.split('-').map(Number);
    
    let ingresosMes = 0;
    let gastosMes = 0;
    let rentabilidadAutos = {};
    let comisionesAutosTerceros = {};

    reservas.forEach((res) => {
      if (!res.inicio) return;
      const fechaInicio = new Date(res.inicio);
      
      if (fechaInicio.getFullYear() === anioFiltro && (fechaInicio.getMonth() + 1) === mesFiltro) {
        const gananciaReserva = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);
        ingresosMes += gananciaReserva;

        // Comisiones de terceros
        if (res.esTercero === true) {
          const nombreAutoTercero = res.vehiculoNombre || res.vehiculoId || 'Vehículo de Tercero';
          if (!comisionesAutosTerceros[nombreAutoTercero]) {
            comisionesAutosTerceros[nombreAutoTercero] = { totalComision: 0, vecesRentado: 0 };
          }
          comisionesAutosTerceros[nombreAutoTercero].totalComision += gananciaReserva;
          comisionesAutosTerceros[nombreAutoTercero].vecesRentado += 1;
        }

        // Ranking de autos
        const nombreAuto = res.vehiculoNombre || res.vehiculoId || 'Vehículo sin nombre';
        if (!rentabilidadAutos[nombreAuto]) {
          rentabilidadAutos[nombreAuto] = { totalIngresos: 0, vecesRentado: 0 };
        }
        rentabilidadAutos[nombreAuto].totalIngresos += gananciaReserva;
        rentabilidadAutos[nombreAuto].vecesRentado += 1;
      }
    });

    mantenimientos.forEach((gasto) => {
      if (!gasto.fecha) return;
      const fechaGasto = new Date(gasto.fecha);
      if (fechaGasto.getFullYear() === anioFiltro && (fechaGasto.getMonth() + 1) === mesFiltro) {
        gastosMes += Number(gasto.costo || 0);
      }
    });

    const gananciaNetaMes = ingresosMes - gastosMes;

    const rankingArray = Object.keys(rentabilidadAutos).map((auto) => ({
      nombre: auto,
      ingresos: rentabilidadAutos[auto].totalIngresos,
      veces: rentabilidadAutos[auto].vecesRentado
    })).sort((a, b) => b.ingresos - a.ingresos);

    const comisionesTercerosArray = Object.keys(comisionesAutosTerceros).map((auto) => ({
      nombre: auto,
      comisionTotal: comisionesAutosTerceros[auto].totalComision,
      veces: comisionesAutosTerceros[auto].vecesRentado
    })).sort((a, b) => b.comisionTotal - a.comisionTotal);

    return { ingresosMes, gastosMes, gananciaNetaMes, rankingArray, comisionesTercerosArray };
  };

  // Métricas del mes seleccionado
  const metricasActuales = calcularMetricasPorMes(mesSeleccionado);

  // Métricas del mes anterior para comparar la tendencia (subimos / bajamos)
  const mesAnteriorStr = obtenerMesAnteriorStr(mesSeleccionado);
  const metricasAnteriores = calcularMetricasPorMes(mesAnteriorStr);

  const diferenciaGanancia = metricasActuales.gananciaNetaMes - metricasAnteriores.gananciaNetaMes;
  const porcentajeCambio = metricasAnteriores.gananciaNetaMes !== 0 
    ? Math.round((diferenciaGanancia / Math.abs(metricasAnteriores.gananciaNetaMes)) * 100) 
    : (metricasActuales.gananciaNetaMes > 0 ? 100 : 0);

  // Datos globales que no cambian por mes (Flota y Ocupación actual)
  const totalVehiculos = vehiculos.length;
  let autosEnTaller = 0;
  vehiculos.forEach((v) => {
    const estado = (v.estado || '').toLowerCase();
    if (estado.includes('taller') || estado.includes('mantenimiento')) {
      autosEnTaller++;
    }
  });

  const hoy = new Date();
  let activos = 0;
  let devoluciones = [];
  reservas.forEach((res) => {
    const fechaInicio = new Date(res.inicio);
    const fechaFin = new Date(res.fin);
    if (hoy >= fechaInicio && hoy <= fechaFin) {
      activos++;
    }
    const diffDias = Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24));
    if (diffDias >= 0 && diffDias <= 1) {
      devoluciones.push(res);
    }
  });
  const porcentajeOcupacion = totalVehiculos > 0 ? Math.round((activos / totalVehiculos) * 100) : 0;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGACIÓN ADMINISTRATIVA */}
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACA ADMIN</span>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota de Vehículos</a>
        <a href="/admin/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📊 Métricas</a>
        <a href="/admin/calendario" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>📅 Calendario</a>
        <a href="/admin/clientes" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>👥 Clientes</a>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '25px' }}>
        
        {/* CABECERA Y FILTRO DE MES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ color: '#d4af37', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>📊 Dashboard Financiero y Contabilidad</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#111', padding: '8px 15px', borderRadius: '6px', border: '1px solid #333' }}>
            <label style={{ fontSize: '13px', color: '#aaa', fontWeight: 'bold' }}>📅 Seleccionar Mes:</label>
            <input 
              type="month" 
              value={mesSeleccionado} 
              onChange={(e) => setMesSeleccionado(e.target.value)}
              style={{ backgroundColor: '#181818', color: '#d4af37', border: '1px solid #444', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            />
          </div>
        </div>

        {cargando ? (
          <p style={{ color: '#888' }}>Cargando registros contables...</p>
        ) : (
          <>
            {/* GRÁFICO / TARJETA DE TENDENCIA (SUBIMOS O BAJAMOS) */}
            <div style={{ backgroundColor: '#111', padding: '18px 20px', borderRadius: '6px', border: '1px solid #333', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '13px', color: '#aaa', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Tendencia vs Mes Anterior ({mesAnteriorStr})</h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#ccc' }}>
                  Ganancia Neta Mes Anterior: <strong style={{ color: '#fff' }}>USD ${metricasAnteriores.gananciaNetaMes.toLocaleString()}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#181818', padding: '8px 15px', borderRadius: '4px', border: '1px solid #222' }}>
                <span style={{ fontSize: '18px' }}>{diferenciaGanancia >= 1 ? '📈' : diferenciaGanancia < 0 ? '📉' : '⚖️'}</span>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: diferenciaGanancia >= 0 ? '#22c55e' : '#ef4444' }}>
                  {diferenciaGanancia >= 0 ? `+${porcentajeCambio}% (${diferenciaGanancia >= 0 ? '+' : ''}$${diferenciaGanancia.toLocaleString()})` : `${porcentajeCambio}% (-$${Math.abs(diferenciaGanancia).toLocaleString()})`}
                </span>
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '5px' }}>{diferenciaGanancia >= 0 ? '¡Subimos!' : 'Bajamos'}</span>
              </div>
            </div>

            {/* TARJETAS DE KPIS PRINCIPALES DEL MES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              
              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #22c55e', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Ingresos Brutos (Mes)</h3>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#22c55e' }}>
                  USD ${metricasActuales.ingresosMes.toLocaleString()}
                </p>
              </div>

              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #ef4444', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Gastos / Mantenimiento</h3>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#ef4444' }}>
                  USD ${metricasActuales.gastosMes.toLocaleString()}
                </p>
              </div>

              {/* TARJETA DESTACADA: GANANCIA NETA REAL */}
              <div style={{ backgroundColor: '#181818', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #d4af37', border: '2px solid #d4af37' }}>
                <h3 style={{ fontSize: '12px', color: '#d4af37', margin: 0, textTransform: 'uppercase', fontWeight: 'bold' }}>Ganancia Neta Real (Mes)</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#d4af37' }}>
                  USD ${metricasActuales.gananciaNetaMes.toLocaleString()}
                </p>
              </div>

              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #3b82f6', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Alquileres Activos (Global)</h3>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#3b82f6' }}>
                  {activos} / {totalVehiculos} autos
                </p>
              </div>

              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #f59e0b', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>En Taller</h3>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#f59e0b' }}>
                  {autosEnTaller} autos
                </p>
              </div>

              <div style={{ backgroundColor: '#111', padding: '18px', borderRadius: '6px', borderLeft: '4px solid #a855f7', border: '1px solid #222' }}>
                <h3 style={{ fontSize: '12px', color: '#aaa', margin: 0, textTransform: 'uppercase' }}>Tasa de Ocupación</h3>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#a855f7' }}>
                  {porcentajeOcupacion}%
                </p>
              </div>

            </div>

            {/* SECCIÓN DE RANKING DE AUTOS MÁS RENTABLES DEL MES */}
            <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '6px', border: '1px solid #222', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '15px', color: '#d4af37', marginTop: 0, marginBottom: '15px' }}>🏆 Ranking de Autos Más Rentables ({mesSeleccionado})</h2>
              {metricasActuales.rankingAutos.length === 0 ? (
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>No hay rentabilidad registrada en este mes.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {metricasActuales.rankingAutos.map((auto, index) => (
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

            {/* SECCIÓN: CUADRO DE COMISIONES Y DETALLES DE VEHÍCULOS DE TERCEROS DEL MES */}
            <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '6px', border: '1px solid #222', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '15px', color: '#d4af37', marginTop: 0, marginBottom: '15px' }}>💼 Comisiones y Detalles de Vehículos de Terceros ({mesSeleccionado})</h2>
              {metricasActuales.comisionesTercerosArray.length === 0 ? (
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>No se han generado comisiones por vehículos de terceros en este mes.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {metricasActuales.comisionesTercerosArray.map((item, index) => (
                    <div key={index} style={{ backgroundColor: '#181818', padding: '12px 15px', borderRadius: '4px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>🚗</span>
                        <strong style={{ color: '#fff' }}>{item.nombre}</strong>
                        <span style={{ color: '#888', marginLeft: '10px' }}>({item.veces} {item.veces === 1 ? 'renta de tercero' : 'rentas de tercero'})</span>
                      </div>
                      <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        Comisión Generada: USD ${item.comisionTotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN DE ALERTAS Y DEVOLUCIONES */}
            <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '6px', border: '1px solid #222' }}>
              <h2 style={{ fontSize: '15px', color: '#d4af37', marginTop: 0, marginBottom: '15px' }}>🔔 Devoluciones Pendientes (Hoy / Mañana)</h2>
              {devoluciones.length === 0 ? (
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>No hay devoluciones programadas para hoy o mañana.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {devoluciones.map((dev) => (
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
