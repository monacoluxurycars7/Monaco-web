import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useRouter } from 'next/router';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para formulario de Agregar
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCedula, setNuevaCedula] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoMotivo, setNuevoMotivo] = useState('');

  // Estados para formulario de Editar
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editMotivo, setEditMotivo] = useState('');

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

      // 1. Procesar reservas
      reservas.forEach((res, index) => {
        const telefonoKey = res.clienteTelefono || res.telefono || `reserva-${index}`;
        const nombre = res.clienteNombre || res.nombre || 'Cliente sin nombre';
        const cedula = res.documentoCliente || res.cedula || res.pasaporte || res.documento || res.clienteCedula || res.clientePasaporte || 'No registrada';        
        const licencia = res.licencia || res.clienteLicencia || 'No registrada';
        const gananciaReserva = res.gananciaNetaMonaco !== undefined ? Number(res.gananciaNetaMonaco) : Number(res.costoTotal || res.costoTotalFinal || 0);

        const infoDirecta = clientesDirectos[telefonoKey] || clientesDirectos[cedula] || {};

        if (!mapaClientes[telefonoKey]) {
          mapaClientes[telefonoKey] = {
            id: telefonoKey,
            nombre: infoDirecta.nombreOverride || nombre,
            telefono: telefonoKey.startsWith('reserva-') ? 'No registrado' : telefonoKey,
            cedula: infoDirecta.cedulaOverride || cedula,
            licencia: licencia,
            totalAlquileres: 0,
            gastoTotal: 0,
            autosFrecuentes: {},
            enListaNegra: infoDirecta.enListaNegra || false,
            motivoListaNegra: infoDirecta.motivoListaNegra || '',
            eliminado: infoDirecta.eliminado || false
          };
        }

        mapaClientes[telefonoKey].totalAlquileres += 1;
        mapaClientes[telefonoKey].gastoTotal += gananciaReserva;

        const auto = res.vehiculoNombre || res.vehiculoId || 'Vehículo';
        mapaClientes[telefonoKey].autosFrecuentes[auto] = (mapaClientes[telefonoKey].autosFrecuentes[auto] || 0) + 1;
      });

      // 2. Procesar registros directos de la colección 'clientes'
      Object.values(clientesDirectos).forEach(cliDir => {
        const key = cliDir.telefono && cliDir.telefono !== 'No registrado' ? cliDir.telefono : cliDir.id;
        
        if (!mapaClientes[key]) {
          mapaClientes[key] = {
            id: key,
            nombre: cliDir.nombreOverride || cliDir.nombre || 'Reportado / Estafador',
            telefono: cliDir.telefono || 'No registrado',
            cedula: cliDir.cedulaOverride || cliDir.cedula || 'No registrada',
            licencia: 'No registrada',
            totalAlquileres: 0,
            gastoTotal: 0,
            autosFrecuentes: {},
            enListaNegra: cliDir.enListaNegra || false,
            motivoListaNegra: cliDir.motivoListaNegra || '',
            eliminado: cliDir.eliminado || false
          };
        } else {
          mapaClientes[key].enListaNegra = cliDir.enListaNegra;
          mapaClientes[key].motivoListaNegra = cliDir.motivoListaNegra;
          mapaClientes[key].eliminado = cliDir.eliminado;
          if (cliDir.nombreOverride) mapaClientes[key].nombre = cliDir.nombreOverride;
          if (cliDir.cedulaOverride) mapaClientes[key].cedula = cliDir.cedulaOverride;
        }
      });

      const listaFinal = Object.values(mapaClientes).filter(c => !c.eliminado);
      setClientes(listaFinal);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoListaNegra = async (cli, estadoActual, motivoActual) => {
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
      const docId = cli.telefono && cli.telefono !== 'No registrado' ? cli.telefono : cli.id;
      const clienteRef = doc(db, 'clientes', docId);
      
      await setDoc(clienteRef, {
        enListaNegra: nuevoEstado,
        motivoListaNegra: motivo,
        actualizadoEn: new Date().toISOString()
      }, { merge: true });

      cargarClientesYHistorial();
      alert("Estado de lista negra actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar lista negra:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  const abrirEditor = (cli) => {
    setClienteAEditar(cli);
    setEditNombre(cli.nombre);
    setEditCedula(cli.cedula === 'No registrada' ? '' : cli.cedula);
    setEditTelefono(cli.telefono === 'No registrado' ? '' : cli.telefono);
    setEditMotivo(cli.motivoListaNegra || '');
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!clienteAEditar) return;

    try {
      const docId = clienteAEditar.telefono && clienteAEditar.telefono !== 'No registrado' ? clienteAEditar.telefono : clienteAEditar.id;
      const clienteRef = doc(db, 'clientes', docId);

      await setDoc(clienteRef, {
        nombreOverride: editNombre.trim(),
        cedulaOverride: editCedula.trim() || 'No registrada',
        telefono: editTelefono.trim() || clienteAEditar.telefono,
        motivoListaNegra: editMotivo.trim(),
        actualizadoEn: new Date().toISOString()
      }, { merge: true });

      alert("¡Información del cliente actualizada correctamente!");
      setClienteAEditar(null);
      cargarClientesYHistorial();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  const eliminarCliente = async (cli) => {
    if (!confirm(`¿Estás seguro de ocultar/eliminar el registro de "${cli.nombre}"?`)) return;

    try {
      const docId = cli.telefono && cli.telefono !== 'No registrado' ? cli.telefono : cli.id;
      const clienteRef = doc(db, 'clientes', docId);

      await setDoc(clienteRef, {
        eliminado: true,
        actualizadoEn: new Date().toISOString()
      }, { merge: true });

      alert("Registro eliminado exitosamente.");
      cargarClientesYHistorial();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Hubo un error al intentar eliminar el registro.");
    }
  };

  const guardarNuevoListaNegra = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alert("El nombre o alias es obligatorio.");
      return;
    }

    const idUnico = nuevoTelefono.trim() || (nuevaCedula.trim() ? `cedula-${nuevaCedula.trim()}` : `reporte-${Date.now()}`);

    try {
      const clienteRef = doc(db, 'clientes', idUnico);
      await setDoc(clienteRef, {
        nombreOverride: nuevoNombre.trim(),
        cedulaOverride: nuevaCedula.trim() || 'No registrada',
        telefono: nuevoTelefono.trim() || 'No registrado',
        enListaNegra: true,
        motivoListaNegra: nuevoMotivo.trim() || 'Reporte externo',
        eliminado: false,
        fechaRegistro: new Date().toISOString()
      }, { merge: true });

      alert("¡Agregado a la Lista Negra exitosamente!");
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
      
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📋 Reservas</a>
        <a href="/admin/vehiculos" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>🚗 Flota</a>
        <a href="/admin/dashboard" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📊 Métricas</a>
        <a href="/admin/calendario" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>📅 Calendario</a>
        <a href="/admin/clientes" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>👥 Clientes / CRM</a>
        {/* NUEVO BOTÓN PARA ACCEDER A LA CAMPAÑA VIP */}
        <a href="/admin/clientes/promo" style={{ backgroundColor: '#d4af37', color: '#000', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', marginLeft: 'auto' }}>🎁 Campaña Promo VIP</a>
      </nav>

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

        {mostrarFormulario && (
          <form onSubmit={guardarNuevoListaNegra} style={{ backgroundColor: '#161616', border: '1px solid #ef4444', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
            <h3 style={{ color: '#ef4444', marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>🚨 Registrar Nuevo Reporte / Estafador en Lista Negra</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Nombre o Alias *</label>
                <input type="text" placeholder="Ej: Juan Pérez" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Cédula o Pasaporte</label>
                <input type="text" placeholder="Ej: 001-0000000-0" value={nuevaCedula} onChange={(e) => setNuevaCedula(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Teléfono</label>
                <input type="text" placeholder="Ej: 8290000000" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Descripción / Motivo</label>
              <textarea placeholder="Motivo del reporte..." value={nuevoMotivo} onChange={(e) => setNuevoMotivo(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Guardar en Lista Negra</button>
          </form>
        )}

        {clienteAEditar && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <form onSubmit={guardarEdicion} style={{ backgroundColor: '#161616', border: '1px solid #3b82f6', borderRadius: '8px', padding: '25px', width: '100%', maxWidth: '500px', boxSizing: 'border-box' }}>
              <h3 style={{ color: '#3b82f6', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>✏️ Editar Información del Cliente</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Nombre</label>
                <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} required />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Cédula / Pasaporte</label>
                <input type="text" value={editCedula} onChange={(e) => setEditCedula(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Teléfono</label>
                <input type="text" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Motivo / Descripción de Lista Negra</label>
                <textarea value={editMotivo} onChange={(e) => setEditMotivo(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setClienteAEditar(null)} style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Guardar Cambios</button>
              </div>
            </form>
          </div>
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
              <div key={index} style={{ backgroundColor: '#111', borderRadius: '8px', border: cli.enListaNegra ? '1px solid #ef4444' : '1px solid #222', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {cli.enListaNegra && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px' }}>
                    <span>🚨 LISTA NEGRA: {cli.motivoListaNegra || 'Sin motivo'}</span>
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

                <div style={{ borderTop: '1px solid #222', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                    <button onClick={() => router.push(`/admin/clientes/${encodeURIComponent(cli.telefono)}`)} style={{ backgroundColor: '#181818', color: '#fff', border: '1px solid #444', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>📂 Historial</button>
                    <button onClick={() => abrirEditor(cli)} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>✏️ Editar</button>
                    <button onClick={() => eliminarCliente(cli)} style={{ backgroundColor: '#6b7280', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>🗑️ Borrar</button>
                  </div>

                  <button onClick={() => cambiarEstadoListaNegra(cli, cli.enListaNegra, cli.motivoListaNegra)} style={{ backgroundColor: cli.enListaNegra ? '#22c55e' : '#ef4444', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
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
