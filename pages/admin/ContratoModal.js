import React, { useRef } from 'react';

export default function ContratoModal({ reserva, onClose }) {
  if (!reserva) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      {/* Estilos CSS exclusivos para Impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #contrato-imprimible, #contrato-imprimible * {
            visibility: visible;
          }
          #contrato-imprimible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            color: #000 !important;
            background: #fff !important;
          }
          .no-imprimir {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        backgroundColor: '#fff',
        color: '#111',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        position: 'relative',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Botones Flotantes de Acción */}
        <div className="no-imprimir" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ✕ Cerrar
          </button>
          <button onClick={handlePrint} style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>

        {/* DOCUMENTO IMPRIMIBLE */}
        <div id="contrato-imprimible">
          {/* ENCABEZADO MONACO */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '15px' }}>
            <h1 style={{ margin: '0 0 5px', fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>MONACO LUXURY RENT A CAR</h1>
            <p style={{ margin: '2px 0', fontSize: '11px', color: '#444' }}>
              Tel: +1 (829) 425-7986 / +1 (973) 289-4797 | IG: @monacoluxuryrentacar | Web: monacoluxuryrentacar.vercel.app
            </p>
            <p style={{ margin: '2px 0', fontSize: '11px', color: '#444' }}>
              C/ Felix Mariano Lluveres, Gazcue, Sto Dgo, RD.
            </p>
            <h2 style={{ margin: '10px 0 0', fontSize: '15px', textTransform: 'uppercase', textDecoration: 'underline' }}>
              CONTRATO DE ARRENDAMIENTO DE VEHÍCULO
            </h2>
          </div>

          {/* FICHA TÉCNICA DE LA RESERVA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '15px' }}>
            <div>
              <p style={{ margin: '2px 0' }}><strong>Cliente:</strong> {reserva.clienteNombre || 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Teléfono:</strong> {reserva.clienteTelefono || 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Email:</strong> {reserva.clienteEmail || 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Tipo / Doc:</strong> {reserva.tipoCliente || 'Cliente'} - {reserva.documentoCliente || 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Residencia RD:</strong> {reserva.clienteDireccionRD || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '2px 0' }}><strong>Vehículo:</strong> {reserva.vehiculoNombre || 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Color:</strong> <span style={{ borderBottom: '1px dotted #000', paddingRight: '40px' }}></span> <strong>Placa:</strong> <span style={{ borderBottom: '1px dotted #000', paddingRight: '40px' }}></span></p>
              <p style={{ margin: '2px 0' }}><strong>Fechas Renta:</strong> Del {reserva.inicio} Al {reserva.fin} ({reserva.dias_totales || reserva.diasTotales || 'N/A'} Días)</p>
              <p style={{ margin: '2px 0' }}><strong>Lugar Entrega:</strong> {reserva.lugarEntrega || 'N/A'}</p>
              <p style={{ margin: '2px 0' }}><strong>Monto Total:</strong> USD ${reserva.costoTotal || reserva.costo_total || '0'}</p>
            </div>
          </div>

          {/* CLÁUSULAS DEL CONTRATO */}
          <div style={{ fontSize: '10px', lineHeight: '1.35', textAlign: 'justify', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 6px' }}><strong>1. RESERVA Y PAGOS:</strong> 1.1. Monto de Reserva: Para confirmar y garantizar la reserva de un vehículo, el CLIENTE debe realizar un pago inicial de USD $150.00. 1.2. Política de Cancelación: El monto de la reserva (USD $150.00) NO ES REEMBOLSABLE bajo ninguna circunstancia si el CLIENTE decide cancelar el servicio. 1.3. Pago del Saldo Restante: El saldo restante del costo total del alquiler debe ser saldado en su totalidad al momento en que MONACO LUXURY RENT A CAR realice la entrega del vehículo al CLIENTE.</p>
            
            <p style={{ margin: '0 0 6px' }}><strong>2. DOCUMENTACIÓN REQUERIDA Y DEVOLUCIÓN:</strong> 2.1. Clientes Extranjeros: Deberán presentar y dejar en custodia su pasaporte original vigente. 2.2. Clientes Nacionales / Residentes: Deberán entregar copia fotostática legible de su cédula de identidad y electoral y de su licencia de conducir vigente. 2.3. Devolución de Documentos: Los documentos entregados en custodia serán devueltos al CLIENTE únicamente tras la inspección final y devolución satisfactoria del vehículo.</p>

            <p style={{ margin: '0 0 6px' }}><strong>3. DEPÓSITO DE GARANTÍA Y OPCIONES DE SEGURO:</strong> 3.1. Seguro Básico de Tránsito: Todos los vehículos incluyen un seguro de tránsito obligatorio únicamente para circular legalmente. Este seguro no cubre daños físicos ni pérdidas materiales en caso de accidente. 3.2. Depósito de Garantía: Salvo que se adquiera la cobertura completa, el CLIENTE debe dejar un depósito de garantía de USD $400.00. 3.3. Responsabilidad por Daños: Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante. 3.4. Seguro Full (Cobertura Total Exclusiva): Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: Queda totalmente exonerado del depósito de garantía de USD $400.00. En caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.</p>

            <p style={{ margin: '0 0 6px' }}><strong>4. TIEMPO DE RENTA, HORARIOS Y PENALIZACIONES:</strong> 4.1. Hora de Entrega: El vehículo debe ser devuelto a la misma hora exacta en la que fue entregado por MONACO LUXURY RENT A CAR. 4.2. Tolerancia y Recargos: Se otorga un margen máximo de tolerancia. Si la devolución del vehículo se retrasa por más de cuatro (4) horas respecto a la hora pactada, se cobrará automáticamente un (1) día completo adicional de renta.</p>

            <p style={{ margin: '0 0 6px' }}><strong>5. MULTAS E INFRACCIONES DE TRÁNSITO:</strong> 5.1. El CLIENTE asume la responsabilidad total y exclusiva por cualquier multa, sanción, fotomulta o infracción de tránsito emitida por las autoridades correspondientes durante el período en que el vehículo estuvo bajo su posesión. 5.2. En caso de que las multas sean notificadas con posterioridad a la entrega del vehículo, MONACO LUXURY RENT A CAR queda facultada para realizar el cobro o reclamo correspondiente al CLIENTE.</p>

            <p style={{ margin: '0 0 6px' }}><strong>6. CONDICIONES ADICIONALES E IMPORTANTES:</strong> 6.1. Estado del Vehículo: El CLIENTE declara recibir el vehículo en perfectas condiciones mecánicas, estéticas y de limpieza, y se compromete a devolverlo en las mismas condiciones exactas. 6.2. Nivel de Combustible: El vehículo debe ser devuelto con la misma cantidad de combustible entregado. 6.3. Uso Permitido y Prohibiciones: El vehículo solo podrá ser conducido por el CLIENTE o conductores autorizados. Prohibido subarrendar, carreras o transportar cargas ilícitas/pesadas. 6.4. Llaves y Neumáticos: Pérdida o daño de llaves y neumáticos corren por cuenta del CLIENTE. 6.5. Asistencia y Reporte: Reportar siniestros en no más de 2 horas. 6.6. Compensación por Inmovilización y Pérdida de Uso (Loss of Use): Además de los costos de reparación material del vehículo descritos en este contrato, el CLIENTE acepta y
se compromete a indemnizar a MONACO LUXURY RENT A CAR por los días en que el vehículo permanezca fuera de servicio e inhabilitado para la renta debido al tiempo que
tome su peritaje, reparación en el taller y/o proceso de pintura. Esta compensación se calculará multiplicando el número de días que dure la inmovilización por la tarifa diaria
de alquiler vigente del vehículo. Este cobro aplica de manera independiente al estado del seguro o deducibles, ya que cubre la lucrocesante de la flota comercial.</p>
          </div>

          {/* ACEPTACIÓN Y FIRMA DIGITAL */}
          <div style={{ marginTop: '15px' }}>
            <p style={{ fontSize: '10px', fontStyle: 'italic', margin: '0 0 10px' }}>
              <strong>ACEPTACIÓN DIGITAL:</strong> Al realizar el pago de la reserva o tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
              <div>
                <p style={{ fontSize: '10px', margin: '0' }}><strong>Fecha de Registro / Firma:</strong> {reserva.fechaCreacion ? new Date(reserva.fechaCreacion).toLocaleString() : 'Fecha no especificada'}</p>
                <p style={{ fontSize: '10px', margin: '5px 0 0' }}><strong>Arrendador:</strong> MONACO LUXURY RENT A CAR</p>
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px solid #000', width: '220px', paddingTop: '5px' }}>
                {reserva.firmaUrl ? (
                  <img src={reserva.firmaUrl} alt="Firma del Cliente" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', display: 'block', margin: '0 auto 5px' }} />
                ) : (
                  <div style={{ height: '40px', fontSize: '10px', color: '#999' }}>[ Sin Firma Digital ]</div>
                )}
                <p style={{ fontSize: '10px', margin: '0', fontWeight: 'bold' }}>Recibido (Firma del Cliente)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
