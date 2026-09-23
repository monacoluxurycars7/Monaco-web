import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function FacturaReserva() {
  const router = useRouter();
  const { id } = router.query;

  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchReserva = async () => {
      try {
        const docRef = doc(db, 'reservas', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReserva({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('No se encontró la reserva.');
        }
      } catch (error) {
        console.error('Error al cargar la reserva:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleEnviarCorreo = async () => {
    if (!reserva.clienteEmail) {
      alert('Este cliente no tiene un correo registrado en esta reserva.');
      return;
    }

    setEnviandoEmail(true);
    try {
      const subtotalSeguro = reserva.seguroFull ? (reserva.diasTotales * 20) : 0;
      const templateParams = {
        to_name: reserva.clienteNombre,
        to_email: reserva.clienteEmail,
        cliente_nombre: reserva.clienteNombre,
        vehiculo: reserva.vehiculoNombre,
        tipo_cliente: reserva.tipoCliente === 'residente' ? 'Residente RD' : 'Turista / Extranjero',
        documento_cliente: reserva.documentoCliente || 'No especificado',
        fecha_inicio: reserva.inicio,
        fecha_fin: reserva.fin,
        dias_totales: reserva.diasTotales,
        precio_por_dia: reserva.precioPorDia,
        seguro_full: reserva.seguroFull ? `Sí ($${subtotalSeguro} USD)` : 'No',
        depositoGarantia: reserva.depositoGarantia,
        lugarEntrega: reserva.lugarEntrega,
        costoEntrega: reserva.costoEntrega,
        costoTotalFinal: reserva.costoTotal,
        cuentas_bancarias: 'Banco Popular Dominicano: C/A 123-45678-9<br/>Banco BHD León: C/A 987-65432-1',
        contrato_texto: 'El cliente se compromete a devolver el vehículo en las mismas condiciones óptimas de entrega y respetar las leyes de tránsito de la Rep. Dominicana...',
        firma_url: ''
      };

      await emailjs.send(
        'service_av3mxdg',
        'template_d2myfzs',
        templateParams,
        'bn6WeQnxOIluVFxfB'
      );

      alert('¡Comprobante y detalles enviados con éxito al correo del cliente!');
    } catch (error) {
      console.error('Error al enviar correo:', error);
      alert('Hubo un error al enviar el correo.');
    } finally {
      setEnviandoEmail(false);
    }
  };

  // Mensaje profesional generado automáticamente para copiar y enviar
  const mensajeProfesional = reserva ? `Estimado/a ${reserva.clienteNombre}, 

Le saludamos desde Mónaco Luxury. Nos complace confirmarle los detalles de su reserva para el vehículo ${reserva.vehiculoNombre}.

📅 Fechas: Del ${reserva.inicio} al ${reserva.fin} (${reserva.diasTotales} días)
📍 Lugar de entrega: ${reserva.lugarEntrega}
💰 Total a pagar: $${reserva.costoTotal} USD (Depósito de garantía reembolsable: $${reserva.depositoGarantia} USD)

Cuentas bancarias autorizadas para depósito/transferencia:
• Banco Popular Dominicano: C/A 123-45678-9
• Banco BHD León: C/A 987-65432-1

Por favor, envíenos el comprobante de pago por esta vía para dejar su unidad totalmente asegurada. ¡Gracias por confiar en nosotros!` : '';

  const handleCopiarMensaje = () => {
    navigator.clipboard.writeText(mensajeProfesional);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando factura...</p>;
  if (!reserva) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Reserva no encontrada.</p>;

  const subtotalAlquiler = reserva.diasTotales * Number(reserva.precioPorDia);
  const subtotalSeguro = reserva.seguroFull ? (reserva.diasTotales * 20) : 0;

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Botones de acción (No se imprimen gracias al CSS media print) */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          onClick={() => router.push('/admin/facturas')}
          style={{ padding: '10px 16px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          ← Volver al Historial
        </button>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handlePrint}
            style={{ padding: '10px 20px', backgroundColor: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🖨️ Imprimir / Guardar PDF
          </button>
          <button 
            onClick={handleEnviarCorreo}
            disabled={enviandoEmail}
            style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {enviandoEmail ? 'Enviando...' : '📧 Enviar por Correo'}
          </button>
        </div>
      </div>

      {/* Contenedor de la Factura / Constancia */}
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }} id="factura-print">
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #d4af37', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#d4af37', margin: 0, fontSize: '24px', letterSpacing: '1px' }}>MÓNACO LUXURY</h1>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#aaa' }}>Alquiler de Vehículos Exclusivos</p>
            <p style={{ margin: '2px 0', fontSize: '12px', color: '#888' }}>Santo Domingo, Rep. Dom. | Tel: +1 (800) 000-0000</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>CONSTANCIA DE RESERVA</h2>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#d4af37' }}>Ref: #{reserva.id.slice(-6).toUpperCase()}</p>
            <p style={{ margin: '2px 0', fontSize: '12px', color: '#aaa' }}>Fecha Emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Información del Cliente y Vehículo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', backgroundColor: '#161616', padding: '15px', borderRadius: '6px', border: '1px solid #262626' }}>
          <div>
            <h3 style={{ color: '#d4af37', fontSize: '14px', margin: '0 0 8px 0', borderBottom: '1px solid #333', paddingBottom: '4px' }}>DATOS DEL CLIENTE</h3>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Nombre:</strong> {reserva.clienteNombre}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Teléfono:</strong> {reserva.clienteTelefono || 'N/A'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Email:</strong> {reserva.clienteEmail || 'N/A'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Documento (Cédula/Pasaporte):</strong> {reserva.documentoCliente || 'Pendiente'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Tipo:</strong> {reserva.tipoCliente === 'residente' ? 'Residente RD' : 'Turista / Extranjero'}</p>
          </div>

          <div>
            <h3 style={{ color: '#d4af37', fontSize: '14px', margin: '0 0 8px 0', borderBottom: '1px solid #333', paddingBottom: '4px' }}>DATOS DE LA RENTA</h3>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Vehículo:</strong> {reserva.vehiculoNombre}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Fecha Inicio:</strong> {reserva.inicio}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Fecha Fin:</strong> {reserva.fin}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Duración:</strong> {reserva.diasTotales} día(s)</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Lugar de Entrega:</strong> {reserva.lugarEntrega}</p>
          </div>
        </div>

        {/* Tabla de Desglose de Costos */}
        <h3 style={{ color: '#d4af37', fontSize: '14px', margin: '0 0 10px 0' }}>DESGLOSE FINANCIERO</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#222', color: '#d4af37', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #333' }}>Concepto</th>
              <th style={{ padding: '10px', border: '1px solid #333', textAlign: 'center' }}>Cant. / Días</th>
              <th style={{ padding: '10px', border: '1px solid #333', textAlign: 'right' }}>Precio Unit.</th>
              <th style={{ padding: '10px', border: '1px solid #333', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #333' }}>Alquiler de Vehículo ({reserva.vehiculoNombre})</td>
              <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'center' }}>{reserva.diasTotales}</td>
              <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'right' }}>${reserva.precioPorDia} USD</td>
              <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'right' }}>${subtotalAlquiler} USD</td>
            </tr>
            {reserva.seguroFull && (
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>Seguro Full / Cobertura Total</td>
                <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'center' }}>{reserva.diasTotales}</td>
                <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'right' }}>$20 USD</td>
                <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'right' }}>${subtotalSeguro} USD</td>
              </tr>
            )}
            {Number(reserva.costoEntrega) > 0 && (
              <tr>
                <td style={{ padding: '8px', border: '1px solid #333' }}>Costo de Movilización / Entrega</td>
                <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'center' }}>1</td>
                <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'right' }}>${reserva.costoEntrega} USD</td>
                <td style={{ padding: '8px', border: '1px solid #333', textAlign: 'right' }}>${reserva.costoEntrega} USD</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totales y Garantía */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
          <div style={{ width: '300px', backgroundColor: '#161616', padding: '15px', borderRadius: '6px', border: '1px solid #262626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span>Depósito de Garantía (Reembolsable):</span>
              <strong style={{ color: '#d4af37' }}>${reserva.depositoGarantia} USD</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '8px', fontSize: '15px' }}>
              <strong style={{ color: '#fff' }}>TOTAL A PAGAR:</strong>
              <strong style={{ color: '#22c55e' }}>${reserva.costoTotal} USD</strong>
            </div>
          </div>
        </div>

        {/* Métodos de Pago / Cuentas Bancarias */}
        <div style={{ marginBottom: '25px', backgroundColor: '#161616', padding: '15px', borderRadius: '6px', border: '1px solid #262626' }}>
          <h3 style={{ color: '#d4af37', fontSize: '14px', margin: '0 0 8px 0' }}>MÉTODOS DE PAGO / CUENTAS BANCARIAS</h3>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Banco Popular Dominicano:</strong> C/A 123-45678-9 (Mónaco Luxury SRL)</p>
          <p style={{ margin: '4px 0', fontSize: '13px' }}>• <strong>Banco BHD León:</strong> C/A 987-65432-1 (Mónaco Luxury SRL)</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#aaa', marginTop: '6px' }}>Favor enviar el comprobante de transferencia por WhatsApp o correo electrónico para confirmar la vigencia definitiva de la reserva.</p>
        </div>

        {/* Términos y Contrato abreviado */}
        <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
          <h3 style={{ color: '#d4af37', fontSize: '14px', margin: '0 0 6px 0' }}>TÉRMINOS Y CONDICIONES DEL CONTRATO</h3>
          <p style={{ fontSize: '11px', color: '#999', lineHeight: '1.4', margin: 0 }}>
            1. El presente documento sirve como constancia oficial de reserva de vehículo en Mónaco Luxury.<br/>
            2. El arrendatario se compromete a entregar el vehículo en las mismas condiciones óptimas en las que lo recibe, respetando las leyes de tránsito vigentes en la República Dominicana.<br/>
            3. Queda estrictamente prohibido conducir bajo los efectos del alcohol, subarrendar el vehículo o sacarlo de territorio nacional sin autorización expresa por escrito.<br/>
            4. El contrato físico definitivo será firmado por ambas partes al momento de la entrega presencial de la unidad.
          </p>
        </div>

      </div>

      {/* SECCIÓN NUEVA: Generador de Mensaje Profesional para Copiar y Enviar */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '30px auto 0 auto', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: '#d4af37', fontSize: '15px', margin: 0 }}>💬 Mensaje Profesional para Cliente (WhatsApp / Correo)</h3>
          <button
            onClick={handleCopiarMensaje}
            style={{ padding: '8px 16px', backgroundColor: copiado ? '#16a34a' : '#d4af37', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: '0.2s' }}
          >
            {copiado ? '¡Copiado con éxito! ✅' : '📋 Copiar Mensaje'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '10px' }}>Este texto incluye toda la información de la reserva de forma impecable y educada. Solo haz clic en copiar y pégaselo al cliente:</p>
        <textarea
          readOnly
          value={mensajeProfesional}
          rows={7}
          style={{ width: '100%', backgroundColor: '#121212', color: '#ddd', border: '1px solid #333', borderRadius: '6px', padding: '12px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical' }}
        />
      </div>

      {/* Estilos CSS para ocultar secciones al imprimir en papel o guardar como PDF */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #fff !important;
            color: #000 !important;
          }
          div#factura-print {
            background-color: #fff !important;
            color: #000 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          h1, h2, h3, strong {
            color: #000 !important;
          }
          p, span, td, th {
            color: #333 !important;
          }
        }
      `}</style>

    </div>
  );
}[id].js
