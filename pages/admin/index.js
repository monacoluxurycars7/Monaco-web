<!-- Ficha de Control de Reserva / Alquiler -->
<div class="panel-control-reserva" style="font-family: Arial, sans-serif; max-width: 800px; border: 1px solid #ccc; padding: 20px; border-radius: 8px;">

  <!-- 1. Datos de la Reserva y Cliente -->
  <section class="seccion-bloque" style="margin-bottom: 20px;">
    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">1. Datos de la Reserva y Cliente</h3>
    <p><strong>Fecha Reserva:</strong> <span id="fechaReserva">2026-09-21</span></p>
    <p><strong>Cliente:</strong> <span id="nombreCliente">Nombre del Cliente</span></p>
    <p><strong>Teléfono / Contacto:</strong> <span id="telefonoCliente">+1 800 000 0000</span></p>
    <p><strong>Tipo / Doc. Identidad:</strong> <span id="docIdentidad">Pasaporte / Cédula / Licencia</span></p>
  </section>

  <!-- 2. Detalle del Vehículo -->
  <section class="seccion-bloque" style="margin-bottom: 20px;">
    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">2. Detalle del Vehículo</h3>
    <p><strong>Vehículo:</strong> <span id="vehiculoDetalle">Kia Sportage 2020 (Placa: ABC-1234)</span></p>
    <p><strong>Condición de Entrega:</strong> <span id="condicionEntrega">Tanque lleno / 45,000 km</span></p>
  </section>

  <!-- 3. Fechas y Logística -->
  <section class="seccion-bloque" style="margin-bottom: 20px;">
    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">3. Fechas y Logística</h3>
    <p><strong>Fechas Renta:</strong> <span id="fechasRenta">2026-10-01 al 2026-10-19 (18 Días)</span></p>
    <p><strong>Lugar de Entrega:</strong> <span id="lugarEntrega">Aeropuerto Internacional</span></p>
    <p><strong>Lugar de Devolución:</strong> <span id="lugarDevolucion">Aeropuerto Internacional</span></p>
  </section>

  <!-- 4. Cobertura y Políticas -->
  <section class="seccion-bloque" style="margin-bottom: 20px;">
    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">4. Cobertura y Políticas</h3>
    <p><strong>Seguro Full:</strong> <span id="seguroFull">Sí</span></p>
    <p><strong>Depósito de Garantía:</strong> <span id="depositoGarantia">USD $0.00 (No aplica)</span></p>
  </section>

  <!-- 5. Desglose Estimado (18 Días) -->
  <section class="seccion-bloque" style="margin-bottom: 20px;">
    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">5. Desglose Estimado (18 Días)</h3>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ddd;">Concepto</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Tarifa / Frecuencia</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Alquiler Base</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $40.00 / día</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $720.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Seguro Full</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $20.00 / día</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $360.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Entrega / Movilización</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cargo Único</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $100.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Depósito Garantía</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Reembolsable</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $0.00</td>
        </tr>
        <tr style="font-weight: bold; background-color: #e9ecef;">
          <td colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: right;">TOTAL ESTIMADO:</td>
          <td style="padding: 8px; border: 1px solid #ddd;">USD $1,180.00</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- 6. Información Relevante Adicional -->
  <section class="seccion-bloque">
    <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">6. Información Relevante Adicional</h3>
    <p><strong>Estatus de Pago:</strong> <span id="estatusPago">Pendiente / Pago al entregar</span></p>
    <p><strong>Método de Pago:</strong> <span id="metodoPago">Tarjeta de Crédito / Efectivo</span></p>
    <p><strong>Conductor Adicional:</strong> <span id="conductorAdicional">No registrado</span></p>
    <p><strong>Política de Combustible:</strong> <span id="politicaCombustible">Devolver con la misma cantidad inicial</span></p>
    <p><strong>Margen de Tolerancia Retorno:</strong> <span id="toleranciaHorario">1 hora máx. de retraso</span></p>
    <p><strong>Registro de Inspección / Daños:</strong> <a href="#" id="linkInspeccion">Ver fotos de checklist inicial</a></p>
  </section>

</div>
