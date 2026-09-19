import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin'); // Redirige al panel principal
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #333', borderRadius: '12px', backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px' }}>Acceso Admin</h2>
      {error && <p style={{ color: '#ff4d4d', marginBottom: '15px' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ fontSize: '14px', color: '#ccc' }}>Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }}
          />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ fontSize: '14px', color: '#ccc' }}>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#222', color: '#fff' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#d4af37', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
