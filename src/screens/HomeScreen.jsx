import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Modelo de Congreso de la Nación";
  }, []);

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <img
        src="/logomcnnaranja.png"
        alt="Logo MCN"
        style={{ width: 200, marginBottom: 20 }}
      />
      <button
        className="boton-naranja"
        onClick={() => navigate('/camara')}
      >
        INGRESAR
      </button>
    </div>
  );
}
