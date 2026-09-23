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
      const depositoGarantiaVal = reserva.depositoGarantia || 400;
      const costoTotalFinalVal = Number(reserva.costoTotal || 0) + Number(depositoGarantiaVal);

      // Datos bancarios oficiales y exactos
      const textoCuentasBancarias = `
        <strong>CUENTAS BANCARIAS PARA TRANSFERENCIA / RESERVA ($150 USD):</strong><br/>
        • <strong>Banco Popular Dominicano (Pesos DOP):</strong> Cta. Ahorros N° 814423729<br/>
        • <strong>Banreservas (Pesos DOP):</strong> Cta. Corriente N° 9605170252<br/>
        • <strong>BHD (Pesos DOP):</strong> Cta. Corriente N° 39485910015<br/>
        • <strong>Zelle (Dólares USD):</strong> Landra2916@gmail.com<br/><br/>
        <em>* Titular: Landra Guzman, Freddy Rodriguez. Enviar comprobante vía WhatsApp.</em>
      `;

      // Contrato de Arrendamiento Oficial Completo
      const textoContratoOficial = `
        <strong>CONTRATO DE ARRENDAMIENTO DE VEHÍCULO</strong><br/>
        <strong>EMPRESA ARRENDADORA: MONACO LUXURY RENT A CAR</strong><br/><br/>
        
        <strong>1. RESERVA Y PAGOS</strong><br/>
        1.1. Monto de Reserva: Para confirmar y garantizar la reserva de un vehículo, el CLIENTE debe realizar un pago inicial de USD $150.00.<br/>
        1.2. Política de Cancelación: El monto de la reserva (USD $150.00) NO ES REEMBOLSABLE bajo ninguna circunstancia si el CLIENTE decide cancelar el servicio.<br/>
        1.3. Pago del Saldo Restante: El saldo restante del costo total del alquiler debe ser saldado en su totalidad al momento en que MONACO LUXURY RENT A CAR realice la entrega del vehículo al CLIENTE.<br/><br/>

        <strong>2. DOCUMENTACIÓN REQUERIDA Y DEVOLUCIÓN</strong><br/>
        2.1. Clientes Extranjeros: Deberán presentar y dejar en custodia su pasaporte original vigente.<br/>
        2.2. Clientes Nacionales / Residentes: Deberán entregar copia fotostática legible de su cédula de identidad y electoral y de su licencia de conducir vigente.<br/>
        2.3. Devolución de Documentos: Los documentos entregados en custodia serán devueltos al CLIENTE únicamente tras la inspección final y devolución satisfactoria del vehículo.<br/><br/>

        <strong>3. DEPÓSITO DE GARANTÍA Y OPCIONES DE SEGURO</strong><br/>
        3.1. Seguro Básico de Tránsito: Todos los vehículos incluyen un seguro de tránsito obligatorio únicamente para circular legalmente. Este seguro no cubre daños físicos ni pérdidas materiales en caso de accidente.<br/>
        3.2. Depósito de Garantía: Salvo que se adquiera la cobertura completa, el CLIENTE debe dejar un depósito de garantía de USD $400.00.<br/>
        3.3. Responsabilidad por Daños: Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante.<br/>
        3.4. Seguro Full (Cobertura Total Exclusiva): Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: queda totalmente exonerado del depósito de garantía de USD $400.00, y en caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.<br/><br/>

        <strong>4. TIEMPO DE RENTA, HORARIOS Y PENALIZACIONES</strong><br/>
        4.1. Hora de Entrega: El vehículo debe ser devuelto a la misma hora exacta en la que fue entregado por MONACO LUXURY RENT A CAR.<br/>
        4.2. Tolerancia y Recargos: Se otorga un margen máximo de tolerancia. Si la devolución del vehículo se retrasa por más de cuatro (4) horas respecto a la hora pactada, se cobrará automáticamente un (1) día completo adicional de renta.<br/><br/>

        <strong>5. MULTAS Y INFRACCIONES DE TRÁNSITO</strong><br/>
        5.1. El CLIENTE asume la responsabilidad total y exclusiva por cualquier multa, sanción, fotomulta o infracción de tránsito emitida por las autoridades correspondientes durante el período en que el vehículo estuvo bajo su posesión.<br/>
        5.2. En caso de que las multas sean notificadas con posterioridad a la entrega del vehículo, MONACO LUXURY RENT A CAR queda facultada para realizar el cobro o reclamo correspondiente al CLIENTE.<br/><br/>

        <strong>6. CONDICIONES ADICIONALES E IMPORTANTES</strong><br/>
        6.1. Estado del Vehículo: El CLIENTE declara recibir el vehículo en perfectas condiciones mecánicas, estéticas y de limpieza, y se compromete a devolverlo en las mismas condiciones exactas en que lo recibió.<br/>
        6.2. Nivel de Combustible: El vehículo debe ser devuelto con la misma cantidad de combustible con la que fue entregado. De lo contrario, se aplicará un cargo por reabastecimiento.<br/>
        6.3. Uso Permitido y Prohibiciones: El vehículo solo podrá ser conducido por el CLIENTE o por conductores adicionales autorizados explícitamente. Queda estrictamente prohibido utilizarlo para subarrendar, transportar carga pesada, participar en carreras, remolcar, realizar actividades ilícitas o conducir bajo los efectos del alcohol o sustancias controladas.<br/>
        6.4. Llaves y Neumáticos: La pérdida o daño de las llaves, así como pinchaduras o daños severos en los neumáticos por negligencia, no están cubiertos por ningún seguro y serán facturados directamente al CLIENTE.<br/>
        6.5. Asistencia y Reporte de Siniestros: En caso de accidente, avería o robo, el CLIENTE debe notificar inmediatamente a MONACO LUXURY RENT A CAR y a las autoridades policiales en un plazo no mayor a 2 horas.<br/>
        6.6. Compensación por Inmovilización y Pérdida de Uso (Loss of Use): Además de los costos de reparación material del vehículo descritos en este contrato, el CLIENTE acepta y se compromete a indemnizar a MONACO LUXURY RENT A CAR por los días en que el vehículo permanezca fuera de servicio e inhabilitado para la renta debido al tiempo que tome su peritaje, reparación en el taller y/o proceso de pintura. Esta compensación se calculará multiplicando el número de días que dure la inmovilización por la tarifa diaria de alquiler vigente del vehículo.<br/><br/>

        <strong>7. ACEPTACIÓN DIGITAL</strong><br/>
        Al realizar el pago de la reserva o al tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato digital emitido por MONACO LUXURY RENT A CAR.
      `;

      const templateParams = {
        cliente_email: reserva.clienteEmail,
        cliente_nombre: reserva.clienteNombre || 'Estimado cliente',
        vehiculo: reserva.vehiculoNombre || 'Vehículo de lujo',
        tipo_cliente: reserva.tipoCliente || reserva.documentoTipo || 'Residente',
        documento_cliente: reserva.documentoCliente || 'N/A',
        fecha_inicio: reserva.inicio || '',
        fecha_fin: reserva.fin || '',
        dias_totales: reserva.diasTotales || 1,
        precio_por_dia: reserva.precioPorDia || (reserva.costoTotal / (reserva.diasTotales || 1)).toFixed(2),
        seguro_full: reserva.seguroFull || 'NO',
        depositoGarantia: depositoGarantiaVal,
        lugarEntrega: reserva.lugarEntrega || 'Oficina Monaco Luxury',
        costoEntrega: reserva.costoEntrega || 0,
        costoTotalFinal: costoTotalFinalVal,
        cuentas_bancarias: textoCuentasBancarias,
        contrato_texto: textoContratoOficial,
        firma_url: reserva.firmaUrl || ''
      };

      await emailjs.send(
        'service_av3mxdg',
        'template_d2myfzs',
        templateParams,
        'bn6WeQnxOIluVFxfB'
      );

      setMensajeEstado('¡Factura y contrato enviados por correo exitosamente al cliente!');
    } catch (error) {
      console.error('Error al enviar correo:', error);
      setMensajeEstado('Hubo un error al enviar el correo. Revisa la consola para más detalles.');
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
              <p style={{ color: '#dc2626', margin: '2px 0 0 0', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Rent a Car & VIP Services</p>
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
