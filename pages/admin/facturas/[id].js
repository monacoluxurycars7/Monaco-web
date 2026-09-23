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
        'service_xxx', // Tu Service ID de EmailJS
        'template_xxx', // Tu Template ID de EmailJS
        templateParams,
        'public_key_xxx' // Tu Public Key de EmailJS
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
    const texto = `Estimado/a *${reserva.clienteNombre}*, le compartimos el resumen de su reserva en *Mónaco Luxury Car*:\n\n🚗 *Vehículo:* ${reserva.vehiculoNombre}\n📅 *Del:* ${reserva.inicio} *al* ${reserva.fin}\n💰 *Alquiler Total:* $${reserva.costoTotal} USD\n🔒 *Depósito de Garantía:* $${deposito} USD (Reembolsable)\n\nRef: #${reserva.id}. ¡Todo listo para entregarle!`;
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
        <button onClick={() => router.push('/admin/facturas')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          ← Volver al Historial
        </button>
      </div>
    );
  }

  const depositoGarantia = reserva.depositoGarantia || 300; // Depósito estándar por defecto si no está registrado

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      {/* Botones de acción superior (No se imprimen) */}
      <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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
        <div style={{ maxWidth: '850px', margin: '0 auto 15px auto', padding: '10px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '5px', color: '#38bdf8', textAlign: 'center', fontSize: '13px' }}>
          {mensajeEstado}
        </div>
      )}

      {/* Documento Oficial: Factura y Contrato */}
      <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff', color: '#111111', padding: '45px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', lineHeight: '1.5' }}>
        
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #d4af37', paddingBottom: '20px', marginBottom: '25px' }}>
          <div>
            <h1 style={{ color: '#111', margin: 0, fontSize: '28px', letterSpacing: '1px', fontWeight: '800' }}>MÓNACO LUXURY</h1>
            <p style={{ color: '#555', margin: '4px 0 0 0', fontSize: '13px', fontWeight: '600' }}>Alquiler de Vehículos Exclusivos & Servicios VIP</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0, color: '#b89728', fontSize: '17px' }}>FACTURA & CONTRATO</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>Ref: #{reserva.id.slice(-6).toUpperCase()}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>Fecha de Emisión: {reserva.fechaCreacion || 'N/A'}</p>
          </div>
        </div>

        {/* Datos del Cliente y del Vehículo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px', fontSize: '13px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
          <div>
            <h4 style={{ color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '5px', marginBottom: '8px', fontSize: '14px' }}>👤 Información del Cliente</h4>
            <p style={{ margin: '4px 0' }}><strong>Nombre:</strong> {reserva.clienteNombre || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Documento (Cédula/Pasaporte):</strong> {reserva.documentoCliente || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Teléfono:</strong> {reserva.clienteTelefono || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Correo:</strong> {reserva.clienteEmail || 'N/A'}</p>
          </div>
          <div>
            <h4 style={{ color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '5px', marginBottom: '8px', fontSize: '14px' }}>🚗 Detalle del Vehículo & Alquiler</h4>
            <p style={{ margin: '4px 0' }}><strong>Vehículo Asignado:</strong> {reserva.vehiculoNombre || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Fecha de Retiro:</strong> {reserva.inicio || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Fecha de Devolución:</strong> {reserva.fin || 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>Duración Total:</strong> {reserva.diasTotales || 0} días</p>
          </div>
        </div>

        {/* Tabla de Cobro y Depósito */}
        <h4 style={{ color: '#1f2937', marginBottom: '10px', fontSize: '14px' }}>💳 Desglose Financiero y Garantías</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Concepto del Servicio</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Cantidad / Días</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Importe (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px' }}>Alquiler de Vehículo ({reserva.vehiculoNombre || 'Lujo'})</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{reserva.diasTotales || 1} días</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>${reserva.costoTotal || 0} USD</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fdf8e8' }}>
              <td style={{ padding: '12px' }}>
                <strong>Depósito de Garantía / Fianza (Reembolsable)</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>Se retiene de manera temporal y se devuelve íntegramente al entregar el vehículo sin daños ni multas pendientes.</div>
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>1 Operación</td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>${depositoGarantia} USD</td>
            </tr>
          </tbody>
        </table>

        {/* Total General */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '35px' }}>
          <div style={{ width: '300px', fontSize: '13px', backgroundColor: '#f3f4f6', padding: '12px 15px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Costo Alquiler:</span>
              <span>${reserva.costoTotal || 0} USD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #d1d5db', paddingBottom: '8px' }}>
              <span>Depósito de Garantía:</span>
              <span>${depositoGarantia} USD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px 0', fontWeight: 'bold', fontSize: '15px', color: '#111' }}>
              <span>Total Inicial a Pagar:</span>
              <span style={{ color: '#16a34a' }}>${(Number(reserva.costoTotal || 0) + Number(depositoGarantia))} USD</span>
            </div>
          </div>
        </div>

        {/* Sección de Términos y Condiciones del Contrato */}
        <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '20px', fontSize: '11px', color: '#4b5563' }}>
          <h4 style={{ color: '#111', fontSize: '13px', marginBottom: '8px' }}>📜 Términos, Condiciones y Políticas de Entrega</h4>
          <p style={{ margin: '4px 0' }}><strong>1. Recepción en el País:</strong> El vehículo será entregado en las condiciones óptimas acordadas al momento de su llegada al país. El cliente se compromete a verificar el estado exterior e interior junto a nuestro representante.</p>
          <p style={{ margin: '4px 0' }}><strong>2. Combustible:</strong> El vehículo se entrega con su tanque lleno (o nivel especificado) y debe ser devuelto en las mismas condiciones. En caso contrario, se aplicará el cargo correspondiente por reabastecimiento.</p>
          <p style={{ margin: '4px 0' }}><strong>3. Depósito de Garantía:</strong> El depósito de ${depositoGarantia} USD cubre posibles infracciones de tránsito, daños menores o faltantes. Será devuelto por completo a la tarjeta o método de pago original una vez realizada la inspección de devolución.</p>
          <p style={{ margin: '4px 0' }}><strong>4. Uso del Vehículo:</strong> Queda estrictamente prohibido el uso del vehículo para actividades ilícitas, competencias o subarriendo. El conductor registrado es el único autorizado para operarlo.</p>
        </div>

        {/* Firmas de Conformidad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '50px', textAlign: 'center', fontSize: '12px' }}>
          <div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '8px', fontWeight: 'bold' }}>MóNACO LUXURY CAR</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Representante Autorizado</div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '8px', fontWeight: 'bold' }}>{reserva.clienteNombre || 'Firma del Cliente'}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>Acepto Términos, Condiciones y Tarifas</div>
          </div>
        </div>

      </div>

      {/* Estilos CSS para impresión */}
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
