import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useRouter } from 'next/router';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para el formulario modal/desplegable de agregar a lista negra
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCedula, setNuevaCedula] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoMotivo, setNuevoMotivo] = useState('');

  const router = useRouter();

  useEffect(() => {
    cargarClientesYHistorial();
  }, []);

  const cargarClientesYHistorial = async () => {
    try {
      const reservasSnap = await getDocs(collection(db, 'reservas'));
      const reservas = reservasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const clientesSnap = await getDocs(collection(db, 'clientes'));
      const clientesDirectos = {};
      clientesSnap.docs.forEach(doc => {
        clientesDirectos[doc.id] = { id: doc.id, ...doc.data() };
      });

      let mapaClientes = {};

      reservas.forEach(res => {
        const telefonoKey = res.clienteTelefono || res.telefono || 'sin-telefono';
        const nombre = res.clienteNombre || res.nombre || 'Cliente sin nombre';
        const cedula = res.documentoCliente || res.cedula || res.pasaporte || res.documento || res.clienteCedula || res.clientePasaporte || 'No registrada';       
        const licencia = res.licencia || res.clienteLicencia || 'No registrada';
        const gananciaReserva = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);

        if (!mapaClientes[telefonoKey]) {
          const infoDirecta = clientesDirectos[telefonoKey] || {};
          
          mapaClientes[telefonoKey] = {
            id: telefonoKey,
            nombre: nombre,
            telefono: telefonoKey,
            cedula: cedula,
            licencia: licencia,
            totalAlquileres: 0,
            gastoTotal: 0,
            autosFrecuentes: {},
            enListaNegra: infoDirecta.enListaNegra || false,
            motivoListaNegra: infoDirecta.motivoListaNegra || '',
            documentos: infoDirecta.documentos || {}
          };
        }

        mapaClientes[telefonoKey].totalAlquileres += 1;
        mapaClientes[telefonoKey].gastoTotal += gananciaReserva;

        const auto = res.vehiculoNombre || res.vehiculoId || 'Vehículo';
        mapaClientes[telefonoKey].autosFrecuentes[auto] = (mapaClientes[telefonoKey].autosFrecuentes[auto] || 0) + 1;
      });

      Object.values(clientesDirectos).forEach(cliDir => {
        const telKey = cliDir.telefono || cliDir.id;
        if (!mapaClientes[telKey]) {
          mapaClientes[telKey] = {
            id: telKey,
            nombre: cliDir.nombre || 'Estafador / Reportado (Sin Renta)',
            telefono: cliDir.telefono || telKey !== 'sin-telefono' ? telKey : 'No registrado',
            cedula: cliDir.cedula || 'No registrada',
            licencia: 'No registrada',
            totalAlquileres: 0,
            gastoTotal: 0,
            autosFrecuentes: {},
            enListaNegra: cliDir.enListaNegra || false,
            motivoListaNegra: cliDir.motivoListaNegra || 'Reporte externo (WhatsApp/Telegram)',
            documentos: cliDir.documentos || {}
          };
        } else {
          if (cliDir.enListaNegra) {
            mapaClientes[telKey].enListaNegra = true;
            mapaClientes[telKey].motivoListaNegra = cliDir.motivoListaNegra;
          }
          if (cliDir.cedula && cliDir.cedula !== 'No registrada') {
            mapaClientes[telKey].cedula = cliDir.cedula;
          }
        }
      });

      const listaFinal = Object.values(mapaClientes);
      setClientes(listaFinal);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoListaNegra = async (telefono, estadoActual, motivoActual) => {
    const nuevoEstado = !estadoActual;
    let motivo = motivoActual;

    if (nuevoEstado) {
      motivo = prompt("Ingrese el motivo por el cual este cliente pasa a Lista Negra:", "Mal historial / Daños");
      if (motivo === null) return;
    } else {
      if (!confirm("¿Está seguro de retirar a este cliente de la Lista Negra?")) return;
      motivo = '';
    }

    try {
      const clienteRef = doc(db, 'clientes', telefono);
      await setDoc(clienteRef, {
        enListaNegra: nuevoEstado,
        motivoListaNegra: motivo,
        actualizadoEn: new Date().toISOString()
      }, { merge: true });

      setClientes(clientes.map(c => c.telefono === telefono ? { ...c, enListaNegra: nuevoEstado, motivoListaNegra: motivo } : c));
      alert("Estado de lista negra actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar lista negra:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  // NUEVA FUNCIÓN: Guarda desde la lista larga sin requerir teléfono obligatorio
  const guardarNuevoListaNegra = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alert("El nombre o alias es obligatorio.");
      return;
    }

    // Si no hay teléfono, generamos un identificador único basado en la fecha o la cédula
    const idUnico = nuevoTelefono.trim() || (nuevaCedula.trim() ? `cedula-${nuevaCedula.trim()}` : `reporte-${Date.now()}`);

    try {
      const clienteRef = doc(db, 'clientes', idUnico);
      await setDoc(clienteRef, {
        nombre: nuevoNombre.trim(),
        cedula: nuevaCedula.trim() || 'No registrada',
        telefono: nuevoTelefono.trim() || 'No registrado',
        enListaNegra: true,
        motivoListaNegra: nuevoMotivo.trim() || 'Reporte externo',
        fechaRegistro: new Date().toISOString()
      }, { merge: true });

      alert("¡Estafador agregado a la Lista Negra exitosamente!");
      // Limpiar y cerrar formulario
      setNuevoNombre('');
      setNuevaCedula('');
      setNuevoTelefono('');
      setNuevoMotivo('');
      setMostrarFormulario(false);
      cargarClientesYHistorial();
    } catch (error) {
      console.error("Error al agregar a lista negra:", error);
      alert("Hubo un error al registrar el cliente.");
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.telefono.includes(busqueda) || 
    c.cedula.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGACIÓN ADMINISTRATIVA */}
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota</a>
        <a href="/admin/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📊 Métricas</a>
        <a href="/admin/calendario" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📅 Calendario</a>
        <a href="/admin/clientes" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>👥 Clientes / CRM</a>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ padding: '25px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ color: '#d4af37', fontSize: '20px', margin: 0, fontWeight: 'bold' }}>👥 Base de Datos de Clientes y CRM</h1>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {mostrarFormulario ? '✖ Cancelar' : '🚨 + Agregar a Lista Negra'}
            </button>

            <input 
              type="text" 
              placeholder="🔍 Buscar por nombre, teléfono o cédula..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ padding: '10px 15px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', width: '280px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* LISTA LARGA / FORMULARIO INTEGRADO PARA AGREGAR A LISTA NEGRA */}
        {mostrarFormulario && (
          <form onSubmit={guardarNuevoListaNegra} style={{ backgroundColor: '#161616', border: '1px solid #ef4444', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
            <h3 style={{ color: '#ef4444', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>🚨 Registrar Nuevo Reporte / Estafador en Lista Negra</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Nombre o Alias *</label>
                <input 
                  type="text" 
                  placeholder="Ej: Juan Pérez" 
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Cédula o Pasaporte (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 001-0000000-0" 
                  value={nuevaCedula}
                  onChange={(e) => setNuevaCedula(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Teléfono (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 8290000000" 
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Descripción / Motivo del Reporte</label>
              <textarea 
                placeholder="Ej: Estafa reportada en grupo de WhatsApp, no devolvió el vehículo alquilado..." 
                value={nuevoMotivo}
                onChange={(e) => setNuevoMotivo(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit"
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              💾 Guardar en Lista Negra
            </button>
          </form>
        )}

        {cargando ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Cargando historial de clientes...</p>
        ) : clientesFiltrados.length === 0 ? (
          <div style={{ backgroundColor: '#111', padding: '30px', textAlign: 'center', borderRadius: '8px', border: '1px solid #222' }}>
            <p style={{ color: '#888', margin: 0 }}>No se encontraron clientes registrados.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {clientesFiltrados.map((cli, index) => (
              <div key={index} style={{ backgroundColor: '#111', borderRadius: '8px', border: cli.enListaNegra ? '1px solid #ef4444' : '1px solid #222', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                
                {cli.enListaNegra && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🚨 LISTA NEGRA: {cli.motivoListaNegra || 'Sin motivo especificado'}</span>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 'bold' }}>{cli.nombre}</h3>
                    <span style={{ fontSize: '12px', backgroundColor: '#181818', padding: '4px 8px', borderRadius: '4px', color: '#d4af37', border: '1px solid #333' }}>
                      {cli.totalAlquileres} {cli.totalAlquileres === 1 ? 'alquiler' : 'alquileres'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
                    <p style={{ margin: 0 }}>📞 <strong>Teléfono:</strong> {cli.telefono}</p>
                    <p style={{ margin: 0 }}>🪪 <strong>Cédula/Pasaporte:</strong> {cli.cedula}</p>
                    <p style={{ margin: 0 }}>🚗 <strong>Licencia:</strong> {cli.licencia}</p>
                    <p style={{ margin: 0, color: '#22c55e' }}>💰 <strong>Total Generado:</strong> USD ${cli.gastoTotal.toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #222', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => router.push(`/admin/clientes/${encodeURIComponent(cli.telefono)}`)}
                    style={{ backgroundColor: '#181818', color: '#fff', border: '1px solid #444', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    📂 Ver Historial
                  </button>

                  <button
                    onClick={() => cambiarEstadoListaNegra(cli.telefono, cli.enListaNegra, cli.motivoListaNegra)}
                    style={{ backgroundColor: cli.enListaNegra ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {cli.enListaNegra ? '✅ Quitar Lista Negra' : '🚨 Marcar Lista Negra'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
