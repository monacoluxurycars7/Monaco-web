import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Head from 'next/head';

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

export default function ListaFacturas() {
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservas() {
      try {
        const q = query(collection(db, 'reservas'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setReservas(lista);
      } catch (error) {
        console.error("Error al cargar facturas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReservas();
  }, []);

  // Filtro inteligente por Cédula o Pasaporte (también busca por nombre o apellido por comodidad)
  const reservasFiltradas = reservas.filter((res) => {
    const texto = busqueda.toLowerCase();
    const cedulaPasaporte = (res.cedula || res.pasaporte || res.documento || '').toLowerCase();
    const clienteNombre = (res.nombreCliente || res.cliente || '').toLowerCase();
    return cedulaPasaporte.includes(texto) || clienteNombre.includes(texto);
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans">
      <Head>
        <title>Control de Facturas y Contratos | Admin</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-wide text-amber-400">Historial de Facturas y Contratos</h1>
            <p className="text-neutral-400 text-sm mt-1">Busca, gestiona e imprime los documentos generados automáticamente por cada reserva.</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-amber-400 rounded-lg text-sm transition"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Barra de Búsqueda por Cédula o Pasaporte */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por Cédula, Pasaporte o Nombre del cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition shadow-inner"
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2 ml-1">La búsqueda filtra de forma instantánea a medida que escribes el documento de identidad.</p>
        </div>

        {/* Tabla de Resultados */}
        {loading ? (
          <div className="text-center py-20 text-neutral-400 animate-pulse">Cargando registros del sistema...</div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800/80">
            <p className="text-neutral-400 text-lg">No se encontraron facturas con ese criterio de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 shadow-xl bg-neutral-900/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/80 text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="p-4">Fecha / ID</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Cédula / Pasaporte</th>
                  <th className="p-4">Vehículo</th>
                  <th className="p-4 text-right">Total / Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-sm">
                {reservasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/70 transition">
                    <td className="p-4">
                      <div className="font-medium text-neutral-200">{item.fechaReserva || 'N/D'}</div>
                      <div className="text-xs text-neutral-500 font-mono">ID: {item.id.slice(0, 8)}...</div>
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {item.nombreCliente || item.cliente || 'Cliente sin nombre'}
                    </td>
                    <td className="p-4 font-mono text-amber-300/90">
                      {item.cedula || item.pasaporte || item.documento || 'No especificada'}
                    </td>
                    <td className="p-4 text-neutral-300">
                      {item.vehiculo || item.auto || 'Vehículo estándar'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-white">${item.total || item.monto || '0.00'}</div>
                      <span className="inline-block px-2 py-0.5 text-xs rounded bg-emerald-950 text-emerald-400 border border-emerald-800 mt-1">
                        Generada
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => router.push(`/admin/factura/${item.id}`)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-xs transition shadow"
                      >
                        Ver Factura y Contrato
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}