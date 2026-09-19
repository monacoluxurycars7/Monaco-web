import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

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

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [cars, setCars] = useState([]);
  const [activeTab, setActiveTab] = useState('reservations');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, [router]);

  // Leer la colección 'reservas' e 'vehiculos' o 'cars'
  useEffect(() => {
    if (!user) return;
    
    // Conectado a tu colección 'reservas'
    const unsubscribeRes = onSnapshot(collection(db, 'reservas'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(docs);
    });

    const unsubscribeCars = onSnapshot(collection(db, 'cars'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCars(docs);
    });

    return () => {
      unsubscribeRes();
      unsubscribeCars();
    };
  }, [user]);

  const toggleCarAvailability = async (carId, currentStatus) => {
    try {
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, { available: !currentStatus });
    } catch (err) {
      console.error("Error al actualizar vehículo:", err);
    }
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Cargando panel...</p>;

  return (
    <div style={{ padding: '30px', color: '#fff', minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '22px' }}>Monaco Luxury - Panel de Control</h1>
        <button 
          onClick={() => signOut(getAuth(app))}
          style={{ padding: '8px 16px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </header>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setActiveTab('reservations')}
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'reservations' ? '#d4af37' : '#222', color: activeTab === 'reservations' ? '#000' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Reservas ({reservations.length})
        </button>
        <button 
          onClick={() => setActiveTab('cars')}
          style={{ padding: '10px 20px', backgroundColor: activeTab === 'cars' ? '#d4af37' : '#222', color: activeTab === 'cars' ? '#000' : '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Vehículos ({cars.length})
        </button>
      </div>

      {activeTab === 'reservations' && (
        <section style={{ marginTop: '25px' }}>
          <h2>Reservas Recibidas</h2>
          {reservations.length === 0 ? (
            <p style={{ color: '#888', marginTop: '15px' }}>No hay reservas registradas aún.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#111' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#d4af37' }}>
                    <th style={{ padding: '12px' }}>Cliente</th>
                    <th style={{ padding: '12px' }}>Teléfono</th>
                    <th style={{ padding: '12px' }}>Vehículo</th>
                    <th style={{ padding: '12px' }}>Inicio</th>
                    <th style={{ padding: '12px' }}>Entrega</th>
                    <th style={{ padding: '12px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '12px' }}>{res.clienteNombre || 'Sin nombre'}</td>
                      <td style={{ padding: '12px' }}>{res.clienteTelefono || '-'}</td>
                      <td style={{ padding: '12px' }}>{res.vehiculoNombre || '-'}</td>
                      <td style={{ padding: '12px' }}>{res.inicio || '-'}</td>
                      <td style={{ padding: '12px' }}>{res.fin || '-'}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#4caf50' }}>${res.costoTotal || 0} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'cars' && (
        <section style={{ marginTop: '25px' }}>
          <h2>Flota de Vehículos</h2>
          {cars.length === 0 ? (
            <p style={{ color: '#888', marginTop: '15px' }}>No hay vehículos en la colección 'cars'.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
              {cars.map((car) => (
                <div key={car.id} style={{ padding: '15px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}>
                  <h3>{car.name || car.model}</h3>
                  <p style={{ color: '#aaa', margin: '5px 0' }}>Renta: <strong>${car.pricePerDay || car.price} USD/día</strong></p>
                  <button 
                    onClick={() => toggleCarAvailability(car.id, car.available)}
                    style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: car.available !== false ? '#2e7d32' : '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {car.available !== false ? 'Disponible' : 'No Disponible'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
