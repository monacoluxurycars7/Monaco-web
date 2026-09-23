import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import emailjs from '@emailjs/browser';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

function getFirebaseDb() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export default function DetalleFactura() {
  const router = useRouter();
  const { id } = router.query;

  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchReserva = async () => {
      try {
        const db = getFirebaseDb();
        const docRef = doc(db, 'reservas', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReserva({ id: docSnap.id, ...docSnap.data() });
        } else {
          setMensajeEstado('No se encontró la factura en la base de datos.');
        }
      } catch (error) {
        console.error('Error al obtener la factura:', error);
        setMensajeEstado('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarEmail = async () => {
    if (!reserva || !reserva.clienteEmail) {
      alert('El cliente no tiene un correo electrónico registrado.');
      return;
    }

    setEnviandoEmail(true);
    setMensajeEstado('');

    try {
      const templateParams = {
        to_email: reserva.clienteEmail,
        to_name: reserva.clienteNombre || 'Estimado cliente',
        vehiculo: reserva.vehiculoNombre || 'Vehículo de lujo',
        inicio: reserva.inicio || '',
        fin: reserva.fin || '',
        total: reserva.costoTotal || '0',
        referencia: reserva.id
      };

      // Configura tus credenciales de EmailJS aquí o mediante variables de entorno
      await emailjs.send(
        'service_xxx', // Reemplaza con tu Service ID de EmailJS
        'template_xxx', // Reemplaza con tu Template ID de EmailJS
        templateParams,
        'public_key_xxx' // Reemplaza con tu Public Key de EmailJS
      );

      setMensajeEstado('¡Factura enviada por correo exitosamente al cliente!');
    } catch (error) {
      console.error('Error al enviar correo:', error);
      setMensajeEstado('Hubo un error al enviar el correo. Verifica tus credenciales de EmailJS.');
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleCopiarWhatsApp = () => {
    if (!reserva) return;
    const texto = `Estimado/a *${reserva.clienteNombre}*, gracias por elegir *Mónaco Luxury Car*. Su reserva del vehículo *${reserva.vehiculoNombre}* del ${reserva.inicio} al ${reserva.fin} ha sido confirmada. Total: $${reserva.costoTotal} USD. Ref: #${reserva.id}`;
    navigator.clipboard.writeText(texto);
    alert('¡Mensaje copiado al portapapeles para enviar por WhatsApp!');
  };

  if (loading) {
    return <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando factura...</div>;
  }

  if (!reserva) {
    return (
      <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
        <h2>{mensajeEstado || 'Factura no encontrada'}</h2>
        <button onClick={() => router.push('/admin/facturas')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Volver al Historial
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      {/* Botones de acción superior (No se imprimen) */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          onClick={() => router.push('/admin/facturas')}
          style={{ padding: '8px 14px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Volver al Historial
        </button>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleCopiarWhatsApp}
            style={{ padding: '8px 14px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            💬 Copiar para WhatsApp
          </button>
          <button 
            onClick={handleEnviarEmail}
            disabled={enviandoEmail}
            style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {enviandoEmail ? 'Enviando...' : '📧 Enviar por Correo'}
          </button>
          <button 
            onClick={handlePrint}
            style={{ padding: '8px 14px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {mensajeEstado && (
        <div style={{ maxWidth: '800px', margin: '0 auto 15px auto', padding: '10px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '5px', color: '#38bdf8', textAlign: 'center', fontSize: '13px' }}>
          {mensajeEstado}
        </div>
      )}

      {/* Recibo / Factura oficial */}
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', color: '#000000', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        
        {/* Cabecera de la factura */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #d4af37', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#111', margin: 0, fontSize: '26px', letterSpacing: '1px' }}>MÓNACO LUXURY</h1>
            <p style={{ color: '#555', margin: '4px 0 0 0', fontSize: '12px' }}>Alquiler de Vehículos Exclusivos</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0, color: '#d4af37', fontSize: '18px' }}>FACTURA / CONTRATO</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 'bold' }}>Ref: #{reserva.id.slice(-6).toUpperCase()}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>Fecha: {reserva.fechaCreacion || 'N/A'}</p>
          </div>
        </div>

        {/* Datos del Cliente y Alquiler */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', fontSize: '14px' }}>
          <div>
            <h4 style={{ color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '10px' }}>Datos del Cliente</h4>
            <p style={{ margin: '4px 0' }}><strong>Nombre:</strong> {reserva.clienteNombre || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Documento:</strong> {reserva.documentoCliente || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Teléfono:</strong> {reserva.clienteTelefono || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Correo:</strong> {reserva.clienteEmail || 'N/A'}</p>
          </div>
          <div>
            <h4 style={{ color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '10px' }}>Detalles del Servicio</h4>
            <p style={{ margin: '4px 0' }}><strong>Vehículo:</strong> {reserva.vehiculoNombre || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Retiro:</strong> {reserva.inicio || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Devolución:</strong> {reserva.fin || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Duración:</strong> {reserva.diasTotales || 0} días</p>
          </div>
        </div>

        {/* Tabla de costos */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Cant / Días</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px 10px' }}>Alquiler de {reserva.vehiculoNombre || 'Vehículo'}</td>
              <td style={{ padding: '12px 10px', textAlign: 'center' }}>{reserva.diasTotales || 1} días</td>
              <td style={{ padding: '12px 10px', textAlign: 'right' }}>${reserva.costoTotal || 0} USD</td>
            </tr>
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '250px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}>
              <span>Subtotal:</span>
              <span>${reserva.costoTotal || 0} USD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 'bold', fontSize: '16px', color: '#111' }}>
              <span>Total a Pagar:</span>
              <span style={{ color: '#16a34a' }}>${reserva.costoTotal || 0} USD</span>
            </div>
          </div>
        </div>

        {/* Firmas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '60px', textAlign: 'center', fontSize: '13px' }}>
          <div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '8px' }}>Firma de la Empresa</div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '8px' }}>Firma del Cliente</div>
          </div>
        </div>

      </div>

      {/* Estilos CSS para ocultar botones al imprimir */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
          }
        }
      `}</style>

    </div>
  );
}
