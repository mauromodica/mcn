import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoNaranja from '../assets/logomcnnaranja.png';

console.log('Logo importado:', logoNaranja);  // <--- aquí

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
      <img src={logoNaranja} alt="Logo MCN" style={{ width: 200, marginBottom: 20 }} />
      <button
        className="boton-naranja"
        onClick={() => navigate('/camara')}
      >
        INGRESAR
      </button>
    </div>
  );
}
