import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useRouter } from 'next/router';

export default function CampañaPromo() {
  const [clientesPendientes, setClientesPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarClientesPendientes();
  }, []);

  const cargarClientesPendientes = async () => {
    try {
      const reservasSnap = await getDocs(collection(db, 'reservas'));
      const reservas = reservasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const clientesSnap = await getDocs(collection(db, 'clientes'));
      const clientesDirectos = {};
      clientesSnap.docs.forEach(doc => {
        clientesDirectos[doc.id] = { id: doc.id, ...doc.data() };
      });

      let mapaClientes = {};
      const mesActualKey = new Date().toISOString().slice(0, 7); // Ejemplo: "2026-09"

      reservas.forEach((res, index) => {
        const telefonoKey = res.clienteTelefono || res.telefono || `reserva-${index}`;
        const nombre = res.clienteNombre || res.nombre || 'Cliente sin nombre';
        const infoDirecta = clientesDirectos[telefonoKey] || {};

        let mesUltimoEnvio = infoDirecta.mesUltimoEnvioVIP || '';
        let estadoMensaje = infoDirecta.estadoMensajeVIP || 'pendiente';
        if (mesUltimoEnvio !== mesActualKey) {
          estadoMensaje = 'pendiente'; // Se reinicia al cambiar de mes
        }

        if (!mapaClientes[telefonoKey]) {
          mapaClientes[telefonoKey] = {
            id: telefonoKey,
            nombre: infoDirecta.nombreOverride || nombre,
            telefono: telefonoKey.startsWith('reserva-') ? 'No registrado' : telefonoKey,
            estadoMensajeVIP: estadoMensaje,
            eliminado: infoDirecta.eliminado || false
          };
        }
      });

      // Filtrar solo los que están pendientes y no eliminados
      const pendientes = Object.values(mapaClientes).filter(c => !c.eliminado && c.estadoMensajeVIP === 'pendiente');
      setClientesPendientes(pendientes);
    } catch (error) {
      console.error("Error cargando pendientes:", error);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoEnviado = async (cli) => {
    try {
      const docId = cli.telefono && cli.telefono !== 'No registrado' ? cli.telefono : cli.id;
      const clienteRef = doc(db, 'clientes', docId);
      const mesActualKey = new Date().toISOString().slice(0, 7);

      await setDoc(clienteRef, {
        estadoMensajeVIP: 'enviado',
        mesUltimoEnvioVIP: mesActualKey,
        actualizadoEn: new Date().toISOString()
      }, { merge: true });

      // Lo quitamos de la lista local de inmediato para que desaparezca
      setClientesPendientes(clientesPendientes.filter(c => c.id !== cli.id));
      alert(`¡Promoción marcada como enviada a ${cli.nombre}!`);
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <nav style={{ backgroundColor: '#111', padding: '15px 20px', borderBottom: '1px solid #222', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>MONACO ADMIN</span>
        <a href="/admin/clientes" style={{ color: '#ccc', textDecoration: 'none', fontSize: '13px' }}>⬅️ Volver a Clientes / CRM</a>
      </nav>

      <div style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#d4af37', fontSize: '22px', marginBottom: '5px' }}>🎁 Campaña de Fidelización VIP</h1>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '25px' }}>Clientes a los que aún no se les ha enviado la promoción este mes.</p>

        {/* VISTA PREVIA DEL FLYER LOCAL */}
        <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', padding: '20px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <img src="/flyer-fidelizacion.png" alt="Flyer Promo" style={{ width: '180px', borderRadius: '6px', border: '1px solid #444', objectFit: 'cover' }} />
          <div>
            <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '16px' }}>Flyer Oficial de la Campaña</h3>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 15px 0' }}>Esta es la imagen que se comparte con tus clientes. Puedes descargarla o adjuntarla directamente en WhatsApp junto al mensaje.</p>
            <a href="/flyer-fidelizacion.png" download="flyer-monaco.png" style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>📥 Descargar Flyer</a>
          </div>
        </div>

        {cargando ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Cargando pendientes de campaña...</p>
        ) : clientesPendientes.length === 0 ? (
          <div style={{ backgroundColor: '#111', padding: '40px', textAlign: 'center', borderRadius: '8px', border: '1px solid #222' }}>
            <p style={{ color: '#22c55e', fontSize: '16px', fontWeight: 'bold', margin: 0 }}>🎉 ¡Excelente trabajo! No hay clientes pendientes de promoción por enviar este mes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {clientesPendientes.map((cli, index) => {
              const telefonoValido = cli.telefono && cli.telefono !== 'No registrado';
              const mensajeWhatsApp = `¡Hola ${cli.nombre}! 🚗✨ En Monaco Luxury Rent A Car nos alegra mucho contar contigo. Queremos regalarte un descuento especial en tu próximo alquiler. ¡Esperamos verte pronto!`;
              const urlWhatsApp = telefonoValido ? `https://wa.me/${cli.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensajeWhatsApp)}` : '#';

              return (
                <div key={index} style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#fff' }}>{cli.nombre}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>📞 Teléfono: {cli.telefono}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a
                      href={telefonoValido ? urlWhatsApp : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!telefonoValido) {
                          e.preventDefault();
                          alert("Este cliente no tiene un teléfono válido registrado.");
                        }
                      }}
                      style={{ backgroundColor: '#25d366', color: '#fff', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      💬 Enviar WhatsApp
                    </a>

                    <button
                      onClick={() => marcarComoEnviado(cli)}
                      style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ✔ Marcar como Enviado
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
