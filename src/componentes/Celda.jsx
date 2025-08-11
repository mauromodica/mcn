import React from 'react';
import { useDrop } from 'react-dnd';
import TarjetaLegislador from './TarjetaLegislador';

export default function Celda({
  fila,
  columna,
  diputado,
  onSoltar,
  seleccionado,
  seleccionarDiputado,
  celdaKey,
  tipoVotacion = null,
  modoConteo = 'afirmativo',
  voto = null,
  votos = {}, // 🔹 agregado para acceso a votos por ID
  modoVotoActivo = false, // 🔹 indica si estamos en modo votación por ubicación
  toggleVoto,
}) {
  // Drop solo si NO estamos votando por ubicación
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'DIPUTADO',
    drop: (item) => {
      if (item?.id) {
        onSoltar(item.id);
      }
    },
    canDrop: (item) => {
      if (tipoVotacion === 'ubicacion') return false;
      if (!diputado) return true;
      return diputado.id === item.id;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [onSoltar, diputado, tipoVotacion]);

  // Manejar click para votación o selección
  const manejarClick = () => {
    if (!diputado) return;

    if (modoVotoActivo && toggleVoto) {
      toggleVoto(diputado.id);
    } else {
      seleccionarDiputado(diputado.id);
    }
  };

  // Determinar estilo de borde según voto
  let bordeVoto = null;

  if (modoVotoActivo && diputado?.id) {
    const votoDiputado = votos[diputado.id];

    if (votoDiputado === 'afirmativo') {
      bordeVoto = '3px solid #34a853'; // verde
    } else if (votoDiputado === 'negativo') {
      bordeVoto = '3px solid #ff0000'; // rojo
    }
  }

  return (
    <div
      ref={drop}
      onClick={manejarClick}
      style={{
        height: '70px',
        width: '95px',
        borderRadius: '8px',
        border: bordeVoto || (seleccionado ? '3px solid #009AA6' : '1px solid #ccc'),
        backgroundColor: isOver && canDrop ? '#c8f7c5' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        cursor: diputado ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      title={diputado ? `${diputado.Nombre} ${diputado.Apellido}` : 'Libre'}
    >
      {diputado ? (
        <TarjetaLegislador legislador={diputado} />
      ) : (
        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Libre</span>
      )}
    </div>
  );
}
