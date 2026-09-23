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

export default function DetalleFacturaContrato() {
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
          setMensajeEstado('No se encontró el registro en la base de datos.');
        }
      } catch (error) {
        console.error('Error al obtener la factura/contrato:', error);
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

      await emailjs.send(
        'service_av3mxdg', // Tu Service ID de EmailJS
        'template_d2myfzs', // Tu Template ID de EmailJS
        templateParams,
        'bn6WeQnxOIluVFxfB' // Tu Public Key de EmailJS
      );

      setMensajeEstado('¡Factura y contrato enviados por correo exitosamente al cliente!');
    } catch (error) {
      console.error('Error al enviar correo:', error);
      setMensajeEstado('Hubo un error al enviar el correo. Verifica tus credenciales de EmailJS.');
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleCopiarWhatsApp = () => {
    if (!reserva) return;
    const deposito = reserva.depositoGarantia || 300;
    const texto = `Estimado/a *${reserva.clienteNombre}*, le compartimos el resumen de su reserva en *Mónaco Luxury Rent Car*:\n\n🚗 *Vehículo:* ${reserva.vehiculoNombre}\n📅 *Del:* ${reserva.inicio} *al* ${reserva.fin}\n💰 *Alquiler Total:* $${reserva.costoTotal} USD\n🔒 *Depósito de Garantía:* $${deposito} USD (Reembolsable)\n\nRef: #${reserva.id}. ¡Todo listo para recibirle en el país!`;
    navigator.clipboard.writeText(texto);
    alert('¡Mensaje detallado copiado al portapapeles para WhatsApp!');
  };

  if (loading) {
    return <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando factura y contrato...</div>;
  }

  if (!reserva) {
    return (
      <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
        <h2>{mensajeEstado || 'Documento no encontrado'}</h2>
        <button onClick={() => router.push('/admin/facturas')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Volver al Historial
        </button>
      </div>
    );
  }

  const depositoGarantia = reserva.depositoGarantia || 300;

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      {/* Botones de acción superior (No se imprimen) */}
      <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          onClick={() => router.push('/admin/facturas')}
          style={{ padding: '8px 14px', backgroundColor: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Volver al Historial
        </button>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleCopiarWhatsApp}
            style={{ padding: '8px 14px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            💬 Copiar WhatsApp
          </button>
          <button 
            onClick={handleEnviarEmail}
            disabled={enviandoEmail}
            style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {enviandoEmail ? 'Enviando...' : '📧 Enviar Correo'}
          </button>
          <button 
            onClick={handlePrint}
            style={{ padding: '8px 14px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      {mensajeEstado && (
        <div style={{ maxWidth: '850px', margin: '0 auto 15px auto', padding: '10px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '5px', color: '#38bdf8', textAlign: 'center', fontSize: '13px' }}>
          {mensajeEstado}
        </div>
      )}

      {/* DOCUMENTO OFICIAL: Estilo Limpio, Blanco y Rojo con Líneas Negras */}
      <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff', color: '#111111', padding: '45px', borderRadius: '8px', boxShadow: '0 4px 25px rgba(0,0,0,0.4)', lineHeight: '1.5', borderTop: '6px solid #dc2626' }}>
        
        {/* Encabezado con el Logo real sin fondo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #111', paddingBottom: '20px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src="/logo sin fondo.png" 
              alt="Mónaco Luxury Logo" 
              style={{ height: '55px', objectFit: 'contain' }} 
            />
            <div>
              <h1 style={{ color: '#111', margin: 0, fontSize: '22px', letterSpacing: '0.5px', fontWeight: '900' }}>MÓNACO LUXURY</h1>
              <p style={{ color: '#dc2626', margin: '2px 0 0 0', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Rent Car & Services</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ backgroundColor: '#dc2626', color: '#fff', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', textTransform: 'uppercase' }}>Factura & Contrato</span>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Ref: #{reserva.id.slice(-6).toUpperCase()}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#555' }}>Emisión: {reserva.fechaCreacion || 'N/A'}</p>
          </div>
        </div>

        {/* Datos del Cliente y del Vehículo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', fontSize: '13px', backgroundColor: '#fcfcfc', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div>
            <h4 style={{ color: '#111', borderBottom: '2px solid #dc2626', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}>👤 Datos del Cliente</h4>
            <p style={{ margin: '3px 0' }}><strong>Nombre:</strong> {reserva.clienteNombre || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}><strong>Documento:</strong> {reserva.documentoCliente || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}><strong>Teléfono:</strong> {reserva.clienteTelefono || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}><strong>Correo:</strong> {reserva.clienteEmail || 'N/A'}</p>
          </div>
          <div>
            <h4 style={{ color: '#111', borderBottom: '2px solid #dc2626', paddingBottom: '4px', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}>🚗 Detalle del Alquiler</h4>
            <p style={{ margin: '3px 0' }}><strong>Vehículo:</strong> {reserva.vehiculoNombre || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}><strong>Retiro:</strong> {reserva.inicio || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}><strong>Devolución:</strong> {reserva.fin || 'N/A'}</p>
            <p style={{ margin: '3px 0' }}><strong>Duración:</strong> {reserva.diasTotales || 0} días</p>
          </div>
        </div>

        {/* Tabla de Cobro y Depósito */}
        <h4 style={{ color: '#111', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}>💳 Desglose Económico & Garantía</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#111', color: '#ffffff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Concepto</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Plazo</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Monto (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px 12px' }}>Alquiler de Vehículo ({reserva.vehiculoNombre || 'Lujo'})</td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>{reserva.diasTotales || 1} días</td>
              <td style={{ padding: '10px 12px', textAlign: 'right' }}>${reserva.costoTotal || 0} USD</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef2f2' }}>
              <td style={{ padding: '10px 12px' }}>
                <strong style={{ color: '#991b1b' }}>Depósito de Garantía / Fianza (Reembolsable)</strong>
                <div style={{ fontSize: '10px', color: '#666' }}>Retenido temporalmente para cubrir infracciones o daños, devuelto íntegramente al finalizar.</div>
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>1 Operación</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', color: '#991b1b' }}>${depositoGarantia} USD</td>
            </tr>
          </tbody>
        </table>

        {/* Total General */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
          <div style={{ width: '300px', fontSize: '13px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#111', padding: '12px 15px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span>Alquiler:</span>
              <span>${reserva.costoTotal || 0} USD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <span>Depósito:</span>
              <span>${depositoGarantia} USD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 2px 0', fontWeight: 'bold', fontSize: '15px' }}>
              <span>Total Inicial:</span>
              <span style={{ color: '#dc2626' }}>${(Number(reserva.costoTotal || 0) + Number(depositoGarantia))} USD</span>
            </div>
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div style={{ borderTop: '2px solid #111', paddingTop: '15px', fontSize: '10.5px', color: '#4b5563' }}>
          <h4 style={{ color: '#111', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>📜 Cláusulas y Políticas del Servicio</h4>
          <p style={{ margin: '3px 0' }}><strong>1. Recepción en el País:</strong> El vehículo se entrega en óptimas condiciones en el punto acordado. El cliente y nuestro representante validarán el estado físico al recibirlo.</p>
          <p style={{ margin: '3px 0' }}><strong>2. Combustible:</strong> Se entrega con el tanque especificado y debe ser retornado en idénticas condiciones para evitar cargos adicionales de reabastecimiento.</p>
          <p style={{ margin: '3px 0' }}><strong>3. Depósito de Garantía:</strong> La fianza de ${depositoGarantia} USD es totalmente reembolsable tras la inspección de devolución sin novedad.</p>
          <p style={{ margin: '3px 0' }}><strong>4. Restricciones:</strong> Prohibido su uso para actividades ilegales o competencias. Únicamente conducido por el titular registrado.</p>
        </div>

        {/* Firmas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px', textAlign: 'center', fontSize: '12px' }}>
          <div>
            <div style={{ borderTop: '2px solid #111', paddingTop: '6px', fontWeight: 'bold' }}>MÓNACO LUXURY RENT CAR</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Firma Autorizada</div>
          </div>
          <div>
            <div style={{ borderTop: '2px solid #111', paddingTop: '6px', fontWeight: 'bold' }}>{reserva.clienteNombre || 'Firma del Cliente'}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Acepto Términos y Condiciones</div>
          </div>
        </div>

      </div>

      {/* Estilos CSS de Impresión */}
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
