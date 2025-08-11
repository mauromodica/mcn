import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectorCamaraScreen() {
  const navigate = useNavigate();
  const [camaraSeleccionada, setCamaraSeleccionada] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "MCN - Ingresar";
  }, []);

  const passwords = {
    diputados: 'DIPsalta2007',
    senadores: 'SENsalta2007',
  };

  const handleSeleccion = (camara) => {
    setCamaraSeleccionada(camara);
    setPassword('');
    setError('');
  };

  const handleIngresar = () => {
    if (password === passwords[camaraSeleccionada]) {
      navigate(`/${camaraSeleccionada}`);
    } else {
      setError('Contraseña incorrecta, intentá nuevamente.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleIngresar();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {!camaraSeleccionada && (
        <>
          <div
            onClick={() => handleSeleccion('diputados')}
            className="boton-naranja boton-seleccion-camara borde-derecho"
          >
            CÁMARA DE DIPUTADOS
          </div>

          <div
            onClick={() => handleSeleccion('senadores')}
            className="boton-naranja boton-seleccion-camara"
          >
            CÁMARA DE SENADORES
          </div>
        </>
      )}

      {camaraSeleccionada && (
        <div
          style={{
            margin: 'auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 0 10px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '300px',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>
            Ingresá la contraseña para {camaraSeleccionada === 'diputados' ? 'la Cámara de Diputados' : 'la Cámara de Senadores'}
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Contraseña"
            style={{
              fontSize: '1rem',
              padding: '0.5rem',
              width: '100%',
              marginBottom: '1rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: 'Nunito, sans-serif',
            }}
            autoFocus
          />
          {error && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleIngresar}
              className="boton-naranja"
              style={{ padding: '0.5rem 1rem' }}
            >
              Ingresar
            </button>
            <button
              onClick={() => setCamaraSeleccionada(null)}
              className="boton-naranja"
              style={{ padding: '0.5rem 1rem', backgroundColor: '#999' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
