import React from 'react';

export default function ContratoModal({ reserva, onClose }) {
  if (!reserva) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato de Arrendamiento - Monaco Luxury Rent A Car</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #111;
              padding: 20px;
              margin: 0;
              background: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .logo {
              max-height: 60px;
              max-width: 180px;
              display: block;
              margin: 0 auto 5px auto;
            }
            h1 {
              margin: 0 0 2px 0;
              font-size: 18px;
              letter-spacing: 1px;
            }
            p.sub {
              margin: 1px 0;
              font-size: 9.5px;
              color: #333;
            }
            h2 {
              margin: 6px 0 0 0;
              font-size: 13px;
              text-transform: uppercase;
              text-decoration: underline;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 9.5px;
              background-color: #f8f8f8;
              padding: 8px 10px;
              border-radius: 4px;
              border: 1px solid #ccc;
              margin-bottom: 10px;
            }
            .grid p {
              margin: 1px 0;
            }
            .clauses {
              font-size: 8.5px;
              line-height: 1.25;
              text-align: justify;
              border-bottom: 1px solid #ccc;
              padding-bottom: 8px;
              margin-bottom: 10px;
            }
            .clauses p {
              margin: 0 0 4px 0;
            }
            .acceptance {
              font-size: 8.5px;
              font-style: italic;
              margin: 0 0 6px 0;
              text-align: justify;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 10px;
            }
            .signature-box {
              text-align: center;
              border-top: 1px solid #000;
              width: 180px;
              padding-top: 3px;
            }
            .signature-img {
              max-height: 50px;
              max-width: 160px;
              display: block;
              margin: 0 auto 2px auto;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" alt="Monaco Luxury Rent A Car" class="logo" />
            <h1>MONACO LUXURY RENT A CAR</h1>
            <p class="sub">Tel: +1 (829) 425-7986 / +1 (973) 289-4797 | IG: @monacoluxuryrentacar | Web: monacoluxuryrentacar.vercel.app</p>
            <p class="sub">C/ Felix Mariano Lluveres, Gazcue, Sto Dgo, RD.</p>
            <h2>CONTRATO DE ARRENDAMIENTO DE VEHÍCULO</h2>
          </div>

          <div class="grid">
            <div>
              <p><strong>Cliente:</strong> ${reserva.clienteNombre || 'N/A'}</p>
              <p><strong>Teléfono:</strong> ${reserva.clienteTelefono || 'N/A'}</p>
              <p><strong>Email:</strong> ${reserva.clienteEmail || 'N/A'}</p>
              <p><strong>Tipo / Doc:</strong> ${reserva.tipoCliente || 'Cliente'} - ${reserva.documentoCliente || 'N/A'}</p>
              <p><strong>Residencia RD:</strong> ${reserva.clienteDireccionRD || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Vehículo:</strong> ${reserva.vehiculoNombre || 'N/A'}</p>
              <p><strong>Color:</strong> ___________ <strong>Placa:</strong> ___________</p>
              <p><strong>Fechas Renta:</strong> Del ${reserva.inicio} Al ${reserva.fin} (${reserva.dias_totales || reserva.diasTotales || 'N/A'} Días)</p>
              <p><strong>Lugar Entrega:</strong> ${reserva.lugarEntrega || 'N/A'}</p>
              <p><strong>Monto Total:</strong> USD $${reserva.costoTotal || reserva.costo_total || '0'}</p>
            </div>
          </div>

          <div class="clauses">
            <p><strong>1. RESERVA Y PAGOS:</strong><br />
            1.1. Monto de Reserva: Para confirmar y garantizar la reserva de un vehículo, el CLIENTE debe realizar un pago inicial de USD $150.00.<br />
            1.2. Política de Cancelación: El monto de la reserva (USD $150.00) NO ES REEMBOLSABLE bajo ninguna circunstancia si el CLIENTE decide cancelar el servicio.<br />
            1.3. Pago del Saldo Restante: El saldo restante del costo total del alquiler debe ser saldado en su totalidad al momento en que MONACO LUXURY RENT A CAR realice la entrega del vehículo al CLIENTE.</p>

            <p><strong>2. DOCUMENTACIÓN REQUERIDA Y DEVOLUCIÓN:</strong><br />
            2.1. Clientes Extranjeros: Deberán presentar y dejar en custodia su pasaporte original vigente.<br />
            2.2. Clientes Nacionales / Residentes: Deberán entregar copia fotostática legible de su cédula de identidad y electoral y de su licencia de conducir vigente.<br />
            2.3. Devolución de Documentos: Los documentos entregados en custodia serán devueltos al CLIENTE únicamente tras la inspección final y devolución satisfactoria del vehículo.</p>

            <p><strong>3. DEPÓSITO DE GARANTÍA Y OPCIONES DE SEGURO:</strong><br />
            3.1. Seguro Básico de Tránsito: Todos los vehículos incluyen un seguro de tránsito obligatorio únicamente para circular legalmente. Este seguro no cubre daños físicos ni pérdidas materiales en caso de accidente.<br />
            3.2. Depósito de Garantía: Salvo que se adquiera la cobertura completa, el CLIENTE debe dejar un depósito de garantía de USD $400.00.<br />
            3.3. Responsabilidad por Daños: Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante.<br />
            3.4. Seguro Full (Cobertura Total Exclusiva): Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: Queda totalmente exonerado del depósito de garantía de USD $400.00. En caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.</p>

            <p><strong>4. TIEMPO DE RENTA, HORARIOS Y PENALIZACIONES:</strong><br />
            4.1. Hora de Entrega: El vehículo debe ser devuelto a la misma hora exacta en la que fue entregado por MONACO LUXURY RENT A CAR.<br />
            4.2. Tolerancia y Recargos: Se otorga un margen máximo de tolerancia. Si la devolución del vehículo se retrasa por más de cuatro (4) horas respecto a la hora pactada, se cobrará automáticamente un (1) día completo adicional de renta.</p>

            <p><strong>5. MULTAS E INFRACCIONES DE TRÁNSITO:</strong><br />
            5.1. El CLIENTE asume la responsabilidad total y exclusiva por cualquier multa, sanción, fotomulta o infracción de tránsito emitida por las autoridades correspondientes durante el período en que el vehículo estuvo bajo su posesión.<br />
            5.2. En caso de que las multas sean notificadas con posterioridad a la entrega del vehículo, MONACO LUXURY RENT A CAR queda facultada para realizar el cobro o reclamo correspondiente al CLIENTE.</p>

            <p><strong>6. CONDICIONES ADICIONALES E IMPORTANTES (CLÁUSULAS ADICIONADAS):</strong><br />
            6.1. Estado del Vehículo: El CLIENTE declara recibir el vehículo en perfectas condiciones mecánicas, estéticas y de limpieza, y se compromete a devolverlo en las mismas condiciones exactas en que lo recibió.<br />
            6.2. Nivel de Combustible: El vehículo debe ser devuelto con la misma cantidad de combustible con la que fue entregado. De lo contrario, se aplicará un cargo por reabastecimiento.<br />
            6.3. Uso Permitido y Prohibiciones: El vehículo solo podrá ser conducido por el CLIENTE o por conductores adicionales autorizados explícitamente en el registro. Queda estrictamente prohibido utilizar el vehículo para subarrendar, transportar carga pesada, participar en carreras, remolcar otros vehículos, realizar actividades ilícitas o conducir bajo los efectos del alcohol o sustancias controladas.<br />
            6.4. Llaves y Neumáticos: La pérdida o daño de las llaves, así como pinchaduras o daños severos en los neumáticos por negligencia, no están cubiertos por ningún seguro y serán facturados directamente al CLIENTE.<br />
            6.5. Asistencia y Reporte de Siniestros: En caso de accidente, avería o robo, el CLIENTE debe notificar inmediatamente a MONACO LUXURY RENT A CAR y a las autoridades policiales de tránsito en un plazo no mayor a 2 horas desde ocurrido el evento.<br />
            6.6. Compensación por Inmovilización y Pérdida de Uso (Loss of Use): Además de los costos de reparación material del vehículo descritos en este contrato, el CLIENTE acepta y se compromete a indemnizar a MONACO LUXURY RENT A CAR por los días en que el vehículo permanezca fuera de servicio e inhabilitado para la renta debido al tiempo que tome su peritaje, reparación en el taller y/o proceso de pintura. Esta compensación se calculará multiplicando el número de días que dure la inmovilización por la tarifa diaria de alquiler vigente del vehículo. Este cobro aplica de manera independiente al estado del seguro o deducibles, ya que cubre la lucrocesante de la flota comercial.</p>
          </div>

          <p class="acceptance">
            <strong>ACEPTACIÓN DIGITAL:</strong> Al realizar el pago de la reserva o al tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato digital emitido por MONACO LUXURY RENT A CAR.
          </p>

          <div class="footer">
            <div>
              <p style="font-size: 8.5px; margin: 0;"><strong>Fecha de Registro / Firma:</strong> ${reserva.fechaCreacion ? new Date(reserva.fechaCreacion).toLocaleString() : 'Fecha no especificada'}</p>
              <p style="font-size: 8.5px; margin: 2px 0 0 0;"><strong>Arrendador:</strong> MONACO LUXURY RENT A CAR</p>
            </div>

            <div class="signature-box">
              ${reserva.firmaUrl ? `<img src="${reserva.firmaUrl}" alt="Firma del Cliente" class="signature-img" />` : '<div style="height: 30px; font-size: 8.5px; color: #888;">[ Sin Firma Digital ]</div>'}
              <p style="font-size: 8.5px; margin: 0; font-weight: bold;">Recibido (Firma del Cliente)</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        color: '#111',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '8px',
        padding: '25px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ✕ Cerrar
          </button>
          <button onClick={handlePrint} style={{ padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>

        <div>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
            <img src="/logo.png" alt="Monaco Luxury Rent A Car" style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain', marginBottom: '4px', display: 'block', margin: '0 auto' }} />
            <h1 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>MONACO LUXURY RENT A CAR</h1>
            <p style={{ margin: '1px 0', fontSize: '9.5px', color: '#333' }}>
              Tel: +1 (829) 425-7986 / +1 (973) 289-4797 | IG: @monacoluxuryrentacar | Web: monacoluxuryrentacar.vercel.app
            </p>
            <p style={{ margin: '1px 0', fontSize: '9.5px', color: '#333' }}>
              C/ Felix Mariano Lluveres, Gazcue, Sto Dgo, RD.
            </p>
            <h2 style={{ margin: '6px 0 0', fontSize: '13px', textTransform: 'uppercase', textDecoration: 'underline' }}>
              CONTRATO DE ARRENDAMIENTO DE VEHÍCULO
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '9.5px', backgroundColor: '#f8f8f8', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px' }}>
            <div>
              <p style={{ margin: '1px 0' }}><strong>Cliente:</strong> {reserva.clienteNombre || 'N/A'}</p>
              <p style={{ margin: '1px 0' }}><strong>Teléfono:</strong> {reserva.clienteTelefono || 'N/A'}</p>
              <p style={{ margin: '1px 0' }}><strong>Email:</strong> {reserva.clienteEmail || 'N/A'}</p>
              <p style={{ margin: '1px 0' }}><strong>Tipo / Doc:</strong> {reserva.tipoCliente || 'Cliente'} - {reserva.documentoCliente || 'N/A'}</p>
              <p style={{ margin: '1px 0' }}><strong>Residencia RD:</strong> {reserva.clienteDireccionRD || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '1px 0' }}><strong>Vehículo:</strong> {reserva.vehiculoNombre || 'N/A'}</p>
              <p style={{ margin: '1px 0' }}><strong>Color:</strong> ___________ <strong>Placa:</strong> ___________</p>
              <p style={{ margin: '1px 0' }}><strong>Fechas Renta:</strong> Del {reserva.inicio} Al {reserva.fin} ({reserva.dias_totales || reserva.diasTotales || 'N/A'} Días)</p>
              <p style={{ margin: '1px 0' }}><strong>Lugar Entrega:</strong> {reserva.lugarEntrega || 'N/A'}</p>
              <p style={{ margin: '1px 0' }}><strong>Monto Total:</strong> USD ${reserva.costoTotal || reserva.costo_total || '0'}</p>
            </div>
          </div>

          <div style={{ fontSize: '8.5px', lineHeight: '1.25', textAlign: 'justify', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '10px' }}>
            <p style={{ margin: '0 0 4px' }}><strong>1. RESERVA Y PAGOS:</strong><br />1.1. Monto de Reserva: Para confirmar y garantizar la reserva de un vehículo, el CLIENTE debe realizar un pago inicial de USD $150.00.<br />1.2. Política de Cancelación: El monto de la reserva (USD $150.00) NO ES REEMBOLSABLE bajo ninguna circunstancia si el CLIENTE decide cancelar el servicio.<br />1.3. Pago del Saldo Restante: El saldo restante del costo total del alquiler debe ser saldado en su totalidad al momento en que MONACO LUXURY RENT A CAR realice la entrega del vehículo al CLIENTE.</p>
            <p style={{ margin: '0 0 4px' }}><strong>2. DOCUMENTACIÓN REQUERIDA Y DEVOLUCIÓN:</strong><br />2.1. Clientes Extranjeros: Deberán presentar y dejar en custodia su pasaporte original vigente.<br />2.2. Clientes Nacionales / Residentes: Deberán entregar copia fotostática legible de su cédula de identidad y electoral y de su licencia de conducir vigente.<br />2.3. Devolución de Documentos: Los documentos entregados en custodia serán devueltos al CLIENTE únicamente tras la inspección final y devolución satisfactoria del vehículo.</p>
            <p style={{ margin: '0 0 4px' }}><strong>3. DEPÓSITO DE GARANTÍA Y OPCIONES DE SEGURO:</strong><br />3.1. Seguro Básico de Tránsito: Todos los vehículos incluyen un seguro de tránsito obligatorio únicamente para circular legalmente. Este seguro no cubre daños físicos ni pérdidas materiales en caso de accidente.<br />3.2. Depósito de Garantía: Salvo que se adquiera la cobertura completa, el CLIENTE debe dejar un depósito de garantía de USD $400.00.<br />3.3. Responsabilidad por Daños: Si el vehículo sufre daños o accidentes y el CLIENTE no cuenta con seguro full, el CLIENTE se hace totalmente responsable por los costos de reparación. Si el monto de los daños supera los USD $400.00 del depósito, el CLIENTE está obligado a pagar la diferencia restante.<br />3.4. Seguro Full (Cobertura Total Exclusiva): Si el CLIENTE contrata la opción de Seguro Full directamente con MONACO LUXURY RENT A CAR: Queda totalmente exonerado del depósito de garantía de USD $400.00. En caso de accidente o siniestro, el CLIENTE solo responderá por el pago del monto correspondiente al deducible del seguro.</p>
            <p style={{ margin: '0 0 4px' }}><strong>4. TIEMPO DE RENTA, HORARIOS Y PENALIZACIONES:</strong><br />4.1. Hora de Entrega: El vehículo debe ser devuelto a la misma hora exacta en la que fue entregado por MONACO LUXURY RENT A CAR.<br />4.2. Tolerancia y Recargos: Se otorga un margen máximo de tolerancia. Si la devolución del vehículo se retrasa por más de cuatro (4) horas respecto a la hora pactada, se cobrará automáticamente un (1) día completo adicional de renta.</p>
            <p style={{ margin: '0 0 4px' }}><strong>5. MULTAS E INFRACCIONES DE TRÁNSITO:</strong><br />5.1. El CLIENTE asume la responsabilidad total y exclusiva por cualquier multa, sanción, fotomulta o infracción de tránsito emitida por las autoridades correspondientes durante el período en que el vehículo estuvo bajo su posesión.<br />5.2. En caso de que las multas sean notificadas con posterioridad a la entrega del vehículo, MONACO LUXURY RENT A CAR queda facultada para realizar el cobro o reclamo correspondiente al CLIENTE.</p>
            <p style={{ margin: '0 0 4px' }}><strong>6. CONDICIONES ADICIONALES E IMPORTANTES (CLÁUSULAS ADICIONADAS):</strong><br />6.1. Estado del Vehículo: El CLIENTE declara recibir el vehículo en perfectas condiciones mecánicas, estéticas y de limpieza, y se compromete a devolverlo en las mismas condiciones exactas en que lo recibió.<br />6.2. Nivel de Combustible: El vehículo debe ser devuelto con la misma cantidad de combustible con la que fue entregado. De lo contrario, se aplicará un cargo por reabastecimiento.<br />6.3. Uso Permitido y Prohibiciones: El vehículo solo podrá ser conducido por el CLIENTE o por conductores adicionales autorizados explícitamente en el registro. Queda estrictamente prohibido utilizar el vehículo para subarrendar, transportar carga pesada, participar en carreras, remolcar otros vehículos, realizar actividades ilícitas o conducir bajo los efectos del alcohol o sustancias controladas.<br />6.4. Llaves y Neumáticos: La pérdida o daño de las llaves, así como pinchaduras o daños severos en los neumáticos por negligencia, no están cubiertos por ningún seguro y serán facturados directamente al CLIENTE.<br />6.5. Asistencia y Reporte de Siniestros: En caso de accidente, avería o robo, el CLIENTE debe notificar inmediatamente a MONACO LUXURY RENT A CAR y a las autoridades policiales de tránsito en un plazo no mayor a 2 horas desde ocurrido el evento.<br />6.6. Compensación por Inmovilización y Pérdida de Uso (Loss of Use): Además de los costos de reparación material del vehículo descritos en este contrato, el CLIENTE acepta y se compromete a indemnizar a MONACO LUXURY RENT A CAR por los días en que el vehículo permanezca fuera de servicio e inhabilitado para la renta debido al tiempo que tome su peritaje, reparación en el taller y/o proceso de pintura. Esta compensación se calculará multiplicando el número de días que dure la inmovilización por la tarifa diaria de alquiler vigente del vehículo. Este cobro aplica de manera independiente al estado del seguro o deducibles, ya que cubre la lucrocesante de la flota comercial.</p>
          </div>

          <p style={{ fontSize: '8.5px', fontStyle: 'italic', margin: '0 0 6px', textAlign: 'justify' }}>
            <strong>ACEPTACIÓN DIGITAL:</strong> Al realizar el pago de la reserva o al tomar posesión del vehículo, el CLIENTE confirma que ha leído, comprendido y aceptado la totalidad de los términos, condiciones y políticas expuestas en este contrato digital emitido por MONACO LUXURY RENT A CAR.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
            <div>
              <p style={{ fontSize: '8.5px', margin: '0' }}><strong>Fecha de Registro / Firma:</strong> {reserva.fechaCreacion ? new Date(reserva.fechaCreacion).toLocaleString() : 'Fecha no especificada'}</p>
              <p style={{ fontSize: '8.5px', margin: '2px 0 0' }}><strong>Arrendador:</strong> MONACO LUXURY RENT A CAR</p>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid #000', width: '180px', paddingTop: '3px' }}>
              {reserva.firmaUrl ? (
                <img src={reserva.firmaUrl} alt="Firma del Cliente" style={{ maxHeight: '50px', maxWidth: '160px', objectFit: 'contain', display: 'block', margin: '0 auto 2px' }} />
              ) : (
                <div style={{ height: '30px', fontSize: '8.5px', color: '#888' }}>[ Sin Firma Digital ]</div>
              )}
              <p style={{ fontSize: '8.5px', margin: '0', fontWeight: 'bold' }}>Recibido (Firma del Cliente)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
