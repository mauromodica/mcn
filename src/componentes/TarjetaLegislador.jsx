import React from 'react';
import { useDrag } from 'react-dnd';

const coloresBloques = {
  rojo: '#ff0000',
  verde: '#34a853',
  azul: '#0000ff',
  amarillo: '#ffd600',
  blanco: '#ecf0f1',
};

function normalizarTexto(texto) {
  return (texto ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function obtenerTitulo(pronombre, camara) {
  const base = camara?.toLowerCase() === 'diputados' ? 'Diputad' : 'Senador';
  const pron = normalizarTexto(pronombre);

  if (camara?.toLowerCase() === 'senadores' && pron === 'el') {
    // Para senadores con pronombre él, no agregar nada, queda 'Senador'
    return base;
  }

  if (pron === 'ella') return base + 'a';
  if (pron === 'elle') return base + 'e';
  return base + 'o';
}


export default function TarjetaLegislador({ legislador, votoActual }) {
  const {
    Bloque,
    Pronombre,
    Nombre,
    Nombres,
    Apellido,
    Apellidos,
    Provincia,
    Cámara,
    id,
  } = legislador;

  const colorBloque = coloresBloques[Bloque?.toLowerCase()] || '#000000';
  const titulo = obtenerTitulo(Pronombre?.toLowerCase(), Cámara);
  const nombre = (Nombre ?? Nombres ?? '').trim();
  const apellido = (Apellido ?? Apellidos ?? '').trim();
  const nombreCompleto = `${nombre} ${apellido}`.trim();
  const provinciaFontSize = Provincia?.length > 15 ? '0.65rem' : '0.75rem';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'DIPUTADO',
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id]);

  // Para el borde según voto (verde, rojo o ninguno)
  let borderStyle = 'none';
  if (votoActual === 'afirmativo') borderStyle = '2px solid #34a853';
  else if (votoActual === 'negativo') borderStyle = '2px solid #ff0000';

  return (
    <div
      ref={drag}
      style={{
        width: '100%',
        height: '70px',
        borderRadius: '8px',
        backgroundColor: '#e9e3e0ff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '6px 10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.5 : 1,
        border: borderStyle,
      }}
      title={nombreCompleto}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '0.8rem',
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: colorBloque,
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#333' }}>{titulo}</span>
      </div>

      <div
        style={{
          fontWeight: 'bold',
          fontSize: '0.9rem',
          color: '#222',
          lineHeight: '1.2em',
          maxHeight: '2.4em',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}
      >
        {apellido}
      </div>

      <div
        style={{
          fontSize: provinciaFontSize,
          fontWeight: '400',
          color: '#555',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {Provincia}
      </div>
    </div>
  );
}
