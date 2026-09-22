import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/router';

export default function AdminCalendario() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarDatosCalendario();
  }, []);

  const cargarDatosCalendario = async () => {
    try {
      // 1. Obtener Reservas
      const reservasSnap = await getDocs(collection(db, 'reservas'));
      const reservas = reservasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Obtener Vehículos (para mostrar mantenimientos si aplica)
      const vehiculosSnap = await getDocs(collection(db, 'vehiculos'));
      const vehiculos = vehiculosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let eventosTemp = [];

      // Mapear reservas a eventos de FullCalendar
      reservas.forEach(res => {
        if (res.inicio && res.fin) {
          // Asegurar que la fecha de fin abarque todo el día visualmente sumando un día o usando formato correcto
          eventosTemp.push({
            id: res.id,
            title: `${res.vehiculoNombre || 'Auto'} - ${res.clienteNombre || 'Cliente'}`,
            start: res.inicio,
            end: sumarUnDia(res.fin), // FullCalendar requiere que el 'end' sea exclusivo para abarcar el último día completo
            backgroundColor: '#d4af37',
            borderColor: '#b3922f',
            textColor: '#000000',
            extendedProps: {
              tipo: 'reserva',
              cliente: res.clienteNombre,
              telefono: res.clienteTelefono,
              vehiculo: res.vehiculoNombre
            }
          });
        }
      });

      // Mapear vehículos en mantenimiento/taller si tienen fechas registradas
      vehiculos.forEach(veh => {
        if (veh.estado && veh.estado.toLowerCase().includes('taller') && veh.mantenimientoInicio && veh.mantenimientoFin) {
          eventosTemp.push({
            id: `maint-${veh.id}`,
            title: `[TALLER] ${veh.nombre || 'Vehículo'}`,
            start: veh.mantenimientoInicio,
            end: sumarUnDia(veh.mantenimientoFin),
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            textColor: '#ffffff',
            extendedProps: {
              tipo: 'taller',
              vehiculo: veh.nombre
            }
          });
        }
      });

      setEventos(eventosTemp);
    } catch (error) {
      console.error("Error cargando eventos para el calendario:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función auxiliar para ajustar la fecha final en FullCalendar (exclusiva)
  const sumarUnDia = (fechaStr) => {
    try {
      const d = new Date(fechaStr);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return fechaStr;
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGACIÓN ADMINISTRATIVA */}
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota de Vehículos</a>
        <a href="/admin/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📊 Métricas</a>
        <a href="/admin/calendario" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>📅 Calendario</a>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#d4af37', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>📅 Calendario Global de Alquileres y Disponibilidad</h1>
        </div>

        {/* LEYENDA DE COLORES */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '12px', background: '#111', padding: '10px 15px', borderRadius: '6px', border: '1px solid #222', width: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#d4af37', display: 'inline-block', borderRadius: '3px' }}></span>
            <span>Reserva Activa / Programada</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', display: 'inline-block', borderRadius: '3px' }}></span>
            <span>En Taller / Mantenimiento</span>
          </div>
        </div>

        {/* CONTENEDOR DEL CALENDARIO */}
        <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
          {cargando ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Cargando calendario global...</p>
          ) : (
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={esLocale}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={eventos}
                height="auto"
                eventClick={(info) => {
                  alert(`Vehículo: ${info.event.title}\nDel: ${info.event.start.toLocaleDateString()} al: ${info.event.end ? new Date(info.event.end.getTime() - 86400000).toLocaleDateString() : 'N/A'}`);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ESTILOS CSS INCRUSTADOS PARA ADAPTAR FULLCALENDAR AL TEMA OSCURO DE MONACO */}
      <style jsx global>{`
        .fc {
          --fc-border-color: #333;
          --fc-page-bg-color: #111;
          --fc-neutral-bg-color: #181818;
          --fc-list-event-hover-bg-color: #222;
          color: #fff;
        }
        .fc-toolbar-title {
          color: #d4af37;
          font-size: 16px !important;
        }
        .fc-button {
          background-color: #222 !important;
          border: 1px solid #444 !important;
          color: #fff !important;
          font-size: 12px !important;
        }
        .fc-button-active {
          background-color: #d4af37 !important;
          color: #000 !important;
          border-color: #d4af37 !important;
        }
        .fc-daygrid-day-number, .fc-col-header-cell-cushion {
          color: #ccc;
          text-decoration: none;
        }
        .fc-day-today {
          background-color: rgba(212, 175, 55, 0.08) !important;
        }
      `}</style>

    </div>
  );
}
