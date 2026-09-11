import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import SignatureCanvas from 'react-signature-canvas';

const VEHICULOS = [
  {
    id: 'kia-sportage',
    nombre: 'Kia Sportage LX 2020',
    color: 'Roja',
    imagen: '/kia.jpeg',
    precios: { min: 50, mid: 45, max: 40 }
  },
  {
    id: 'jeep-cherokee',
    nombre: 'Jeep Cherokee Latitude 2019',
    color: 'Blanca',
    imagen: '/jeep.jpg',
    precios: { min: 55, mid: 50, max: 45 }
  },
  {
    id: 'kia-seltos',
    nombre: 'Kia Seltos 2021',
    color: 'Negra',
    imagen: '/logo.png',
    precios: { min: 60, mid: 55, max: 50 }
  }
];

export default function Home() {
  const [vehiculoSel, setVehiculoSel] = useState(VEHICULOS[0]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [metodoPago, setMetodoPago] = useState('transferencia');
  
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [cargando, setCargando] = useState(false);

  const sigCanvas = useRef({});

  useEffect(() => {
    const obtenerReservas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reservas'));
        const lista = querySnapshot.docs.map(doc => doc.data());
        setReservasExistentes(lista);
      } catch (e) {
        console.error("Error al cargar reservas:", e);
      }
    };
    obtenerReservas();
  }, []);

  const calcularDias = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin - inicio;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24)) + 1;
    return dias > 0 ? dias : 0;
  };

  const totalDias = calcularDias();

  const obtenerPrecioPorDia = (vehiculo, dias) => {
    if (dias >= 11) return vehiculo.precios.max;
    if (dias >= 4) return vehiculo.precios.mid;
    return vehiculo.precios.min;
  };

  const precioPorDia = obtenerPrecioPorDia(vehiculoSel, totalDias);
  const totalPagar = totalDias * precioPorDia;

  const esFechaOcupada = () => {
    if (!fechaInicio || !fechaFin) return false;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    return reservasExistentes.some(res => {
      if (res.vehiculo !== vehiculoSel.nombre) return false;
      const resInicio = new Date(res.rangoFechasRaw?.from);
      const resFin = new Date(res.rangoFechasRaw?.to);
      return (inicio <= resFin && fin >= resInicio);
    });
  };

  const manejarReserva = async (e) => {
    e.preventDefault();
    if (esFechaOcupada()) return alert('Las fechas seleccionadas ya están reservadas para este vehículo.');
    if (sigCanvas.current.isEmpty()) return alert('Por favor, firme el contrato antes de continuar.');

    setCargando(true);
    const fechaFirma = new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' });

    const datosReserva = {
      clienteNombre,
      clienteEmail,
      clienteTelefono,
      vehiculo: vehiculoSel.nombre,
      dias: totalDias,
      fechas: `${fechaInicio} al ${fechaFin}`,
      rangoFechasRaw: { from: fechaInicio, to: fechaFin },
      totalAlquiler: totalPagar,
      metodoPago,
      fechaCreacion: new Date().toISOString(),
      fechaFirmaContrato: fechaFirma
    };

    try {
      await addDoc(collection(db, 'reservas'), datosReserva);

      const templateParams = {
        cliente_nombre: clienteNombre,
        cliente_email: clienteEmail,
        vehiculo: vehiculoSel.nombre,
        fechas: datosReserva.fechas,
        total: totalPagar,
        metodo_pago: metodoPago,
        fecha_firma: fechaFirma,
        empresa_email: 'monacoluxurycars7@gmail.com'
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      alert('¡Reserva completada con éxito! Revisa tu correo de confirmación.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error al procesar la reserva. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #7f1d1d', padding: '24px', textAlign: 'center', backgroundColor: '#09090b' }}>
        <img src="/logo.png" alt="Monaco Luxury Rent a Car" style={{ height: '96px', marginBottom: '8px' }} />
        <p style={{ color: '#a1a1aa', fontSize: '14px' }}>C/ Félix Mariano Lluveres #16, Gazcue, Santo Domingo, D.N.</p>
        <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>WhatsApp: 973-289-4797 / 829-425-7986 | IG: @monacoluxurycars</p>
      </header>

      <main style={{ maxWidth: '896px', margin: '0 auto', padding: '24px' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', color: '#dc2626', textAlign: 'center', marginBottom: '16px' }}>1. Selecciona tu Vehículo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {VEHICULOS.map((car) => (
              <div
                key={car.id}
                onClick={() => setVehiculoSel(car)}
                style={{
                  border: vehiculoSel.id === car.id ? '2px solid #dc2626' : '1px solid #27272a',
                  backgroundColor: vehiculoSel.id === car.id ? '#18181b' : '#09090b',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer'
                }}
              >
                <img src={car.imagen} alt={car.nombre} style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                <h3 style={{ fontWeight: 'bold', fontSize: '18px' }}>{car.nombre}</h3>
                <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>Color: {car.color}</p>
                <div style={{ fontSize: '12px', color: '#d4d4d8' }}>
                  <p>1-3 días: <strong style={{ color: '#ef4444' }}>${car.precios.min}/día</strong></p>
                  <p>4-10 días: <strong style={{ color: '#ef4444' }}>${car.precios.mid}/día</strong></p>
                  <p>11+ días: <strong style={{ color: '#ef4444' }}>${car.precios.max}/día</strong></p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ backgroundColor: '#09090b', padding: '24px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', color: '#dc2626', marginBottom: '16px' }}>2. Fechas de Reserva</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Fecha de Inicio:</label>
              <input
                type="date"
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '4px', color: '#fff' }}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Fecha de Devolución:</label>
              <input
                type="date"
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '4px', color: '#fff' }}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          {esFechaOcupada() && (
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Este vehículo ya está reservado en las fechas seleccionadas.</p>
          )}

          {totalDias > 0 && !esFechaOcupada() && (
            <div style={{ backgroundColor: '#18181b', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
              <p><strong>Días Totales:</strong> {totalDias} días</p>
              <p><strong>Tarifa Aplicada:</strong> ${precioPorDia} USD / día</p>
              <p style={{ fontSize: '18px', color: '#ef4444', marginTop: '8px' }}><strong>Total a Pagar:</strong> ${totalPagar} USD</p>
            </div>
          )}
        </section>

        {totalDias > 0 && !esFechaOcupada() && (
          <form onSubmit={manejarReserva} style={{ backgroundColor: '#09090b', padding: '24px', borderRadius: '12px', border: '1px solid #27272a' }}>
            <h2 style={{ fontSize: '20px', color: '#dc2626', marginBottom: '16px' }}>3. Datos del Cliente y Pago</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Nombre Completo"
                required
                style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '4px', color: '#fff' }}
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                required
                style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '4px', color: '#fff' }}
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
              />
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp"
                required
                style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '4px', color: '#fff' }}
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '4px' }}>Método de Pago:</label>
              <select
                style={{ width: '100%', backgroundColor: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '4px', color: '#fff' }}
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="transferencia">Transferencia Bancaria Local</option>
                <option value="zelle">Zelle (landra2916@gmail.com)</option>
                <option value="paypal">PayPal (landra2916@gmail.com)</option>
              </select>
            </div>

            {metodoPago === 'transferencia' && (
              <div style={{ fontSize: '12px', backgroundColor: '#18181b', padding: '16px', borderRadius: '8px', border: '1px solid #27272a', marginBottom: '16px' }}>
                <p><strong>Banco Popular:</strong> 814423729 (Landra Guzman)</p>
                <p><strong>Banreservas:</strong> 9605170252 (Freddy Rodriguez)</p>
                <p><strong>Qik:</strong> 1006620357 (Freddy Rodriguez)</p>
                <p><strong>BHD:</strong> 39485910015 (FREDDY RODRIGUEZ)</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>Firma del Contrato Digital:</p>
              <div style={{ backgroundColor: '#fff', borderRadius: '4px' }}>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
                />
              </div>
              <button
                type="button"
                onClick={() => sigCanvas.current.clear()}
                style={{ marginTop: '8px', fontSize: '12px', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Limpiar Firma
              </button>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{ width: '100%', backgroundColor: '#dc2626', color: '#fff', fontWeight: 'bold', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              {cargando ? 'Procesando Reserva...' : 'Confirmar Reserva y Firmar Contrato'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}