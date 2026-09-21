import React from 'react';

export default function AdminDashboard() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '850px', margin: '20px auto', border: '1px solid #ccc', padding: '25px', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', borderBottom: '2px solid #222', paddingBottom: '10px', marginTop: 0 }}>
        Panel de Control - Resumen de Reserva
      </h2>

      {/* 1. Datos de la Reserva y Cliente */}
      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', color: '#0056b3' }}>
          1. Datos de la Reserva y Cliente
        </h3>
        <p><strong>Fecha Reserva:</strong> 2026-09-21</p>
        <p><strong>Cliente:</strong> Nombre del Cliente</p>
        <p><strong>Teléfono / Contacto:</strong> +1 800 000 0000</p>
        <p><strong>Tipo / Doc. Identidad:</strong> Pasaporte / Cédula / Licencia</p>
      </section>

      {/* 2. Detalle del Vehículo */}
      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', color: '#0056b3' }}>
          2. Detalle del Vehículo
        </h3>
        <p><strong>Vehículo:</strong> Kia Sportage 2020 (Placa: ABC-1234)</p>
        <p><strong>Condición de Entrega:</strong> Tanque lleno / 45,000 km</p>
      </section>

      {/* 3. Fechas y Logística */}
      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', color: '#0056b3' }}>
          3. Fechas y Logística
        </h3>
        <p><strong>Fechas Renta:</strong> 2026-10-01 al 2026-10-19 (18 Días)</p>
        <p><strong>Lugar de Entrega:</strong> Aeropuerto Internacional</p>
        <p><strong>Lugar de Devolución:</strong> Aeropuerto Internacional</p>
      </section>

      {/* 4. Cobertura y Políticas */}
      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', color: '#0056b3' }}>
          4. Cobertura y Políticas
        </h3>
        <p><strong>Seguro Full:</strong> Sí</p>
        <p><strong>Depósito de Garantía:</strong> USD $0.00 (No aplica)</p>
      </section>

      {/* 5. Desglose Estimado (18 Días) */}
      <section style={{ marginBottom: '20px' }}>
        <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', color: '#0056b3' }}>
          5. Desglose Estimado (18 Días)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Concepto</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tarifa / Frecuencia</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Alquiler Base</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $40.00 / día</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $720.00</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Seguro Full</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $20.00 / día</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $360.00</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Entrega / Movilización</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Cargo Único</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $100.00</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Depósito Garantía</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Reembolsable</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $0.00</td>
            </tr>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}>
              <td colSpan={2} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>TOTAL ESTIMADO:</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>USD $1,180.00</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 6. Información Relevante Adicional */}
      <section>
        <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '5px', color: '#0056b3' }}>
          6. Información Relevante Adicional
        </h3>
        <p><strong>Estatus de Pago:</strong> Pendiente / Pago al entregar</p>
        <p><strong>Método de Pago:</strong> Tarjeta de Crédito / Efectivo</p>
        <p><strong>Conductor Adicional:</strong> No registrado</p>
        <p><strong>Política de Combustible:</strong> Devolver con la misma cantidad inicial</p>
        <p><strong>Margen de Tolerancia Retorno:</strong> 1 hora máx. de retraso</p>
        <p><strong>Registro de Inspección / Daños:</strong> <a href="#" style={{ color: '#0056b3' }}>Ver fotos de checklist inicial</a></p>
      </section>
    </div>
  );
}
