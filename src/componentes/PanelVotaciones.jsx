import React from 'react';
import '../styles/global.css';
import '../styles/PanelVotaciones.css';

const colorCian = '#009AA6';
const colorNaranja = '#E05206';
const colorVerde = '#34a853';
const colorRojo = '#ff0000';
const colorAmarillo = '#ffd600';
const colorGris = '#7f8c8d'; // gris para fondo vacío resultado

export default function PanelVotaciones({
  modo,
  setModo,
  votoActivo,
  setVotoActivo,
  conteoVotos,
  contadorManual,
  setContadorManual,
  finalizarVotacion,
  transmitirVotacion,
  transmitirVotacionContador,
  reiniciarVotacion,
  diputadosUbicadosIds,
  setVotos,
  tipoMayoria,
  setTipoMayoria,
  resultado,
}) {
  // Función para definir estilos dinámicos según resultado
  const resultadoEstilos = () => {
    switch ((resultado || '').toUpperCase()) {
      case 'APROBADO':
        return { backgroundColor: colorVerde, color: 'white' };
      case 'RECHAZADO':
        return { backgroundColor: colorRojo, color: 'white' };
      case 'EMPATE':
        return { backgroundColor: colorAmarillo, color: 'black' };
      default:
        return { backgroundColor: colorGris, color: 'white' };
    }
  };

  return (
    <div className="panel-container">
      {/* Selector de modo */}
      <div className="modo-selector">
        <button
          onClick={() => setModo('ubicacion')}
          className={`modo-boton ${modo === 'ubicacion' ? 'activo' : ''}`}
          style={{ backgroundColor: modo === 'ubicacion' ? colorCian : colorNaranja }}
        >
          VOTACIÓN POR UBICACIÓN
        </button>
        <button
          onClick={() => setModo('contador')}
          className={`modo-boton ${modo === 'contador' ? 'activo' : ''}`}
          style={{ backgroundColor: modo === 'contador' ? colorCian : colorNaranja }}
        >
          VOTACIÓN POR CONTADOR
        </button>
      </div>

      {/* Panel por ubicación */}
      {modo === 'ubicacion' && (
        <div className="panel-ubicacion" style={{ height: '80px' }}>
          <div
            className="contador-columna"
            style={{ width: '16%', height: '80px', display: 'flex' }}
          >
            <div
              className="contador-bloque contador-afirmativo"
              title="AFIRMATIVOS"
              style={{
                flex: 1,
                backgroundColor: colorVerde,
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: '900',
                fontSize: '1.5rem',
                userSelect: 'none',
                borderRadius: 0,
              }}
            >
              {conteoVotos.afirmativos}
            </div>
            <div
              className="contador-bloque contador-negativo"
              title="NEGATIVOS"
              style={{
                flex: 1,
                backgroundColor: colorRojo,
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: '900',
                fontSize: '1.5rem',
                userSelect: 'none',
                borderRadius: 0,
              }}
            >
              {conteoVotos.negativos}
            </div>
            <div
              className="contador-bloque contador-abstencion"
              title="ABSTENCIONES / NO VOTO"
              style={{
                flex: 1,
                backgroundColor: colorAmarillo,
                color: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: '900',
                fontSize: '1.5rem',
                userSelect: 'none',
                borderRadius: 0,
              }}
            >
              {conteoVotos.abstenciones}
            </div>
          </div>

          <div className="bloque-votos" style={{ height: '80px', width: '14%' }}>
            <button
              onClick={() => setVotoActivo(prev => (prev === 'afirmativo' ? 'negativo' : 'afirmativo'))}
              className="boton-voto-ubicacion"
              style={{
                backgroundColor: votoActivo === 'afirmativo' ? colorNaranja : '#999',
                height: '40px',
                borderBottom: '1px solid white',
                borderRadius: 0,
              }}
            >
              AFIRMATIVO
            </button>
            <button
              onClick={() => setVotoActivo(prev => (prev === 'negativo' ? 'afirmativo' : 'negativo'))}
              className="boton-voto-ubicacion"
              style={{
                backgroundColor: votoActivo === 'negativo' ? colorNaranja : '#999',
                height: '40px',
                borderRadius: 0,
              }}
            >
              NEGATIVO
            </button>
          </div>

          <button
            onClick={() => setTipoMayoria(prev => (prev === 'simple' ? 'absoluta' : 'simple'))}
            className="boton-panel naranja"
            style={{
              width: '14%',
              height: '80px',
              whiteSpace: 'normal',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              lineHeight: '1.1',
            }}
          >
            <span>MAYORÍA</span>
            <span style={{ fontSize: '1rem' }}>
              {tipoMayoria === 'simple' ? 'SIMPLE' : 'ABSOLUTA'}
            </span>
          </button>

          {/* BOTÓN FINALIZAR - Si quieres lo puedes eliminar si ya no lo usas */}
          <button
            className="boton-panel naranja"
            style={{ width: '14%', height: '80px', borderRadius: 0 }}
            onClick={finalizarVotacion}
          >
            FINALIZAR
          </button>

          <button
            className="boton-panel naranja"
            style={{ width: '14%', height: '80px', borderRadius: 0 }}
            onClick={() => {
              reiniciarVotacion();
              setVotos({});
            }}
          >
            REINICIAR
          </button>

          {/* BLOQUE RESULTADO con estilos dinámicos */}
          <div
            style={{
              width: '14%',
              height: '80px',
              color: resultadoEstilos().color,
              backgroundColor: resultadoEstilos().backgroundColor,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textAlign: 'center',
              borderRadius: 0,
              userSelect: 'none',
            }}
          >
            <div style={{ height: '1.2rem', lineHeight: '1.2rem' }}>RESULTADO:</div>
            <div style={{ fontSize: '1.2rem', marginTop: '4px', minHeight: '1.4rem' }}>
              {resultado || '\u00A0' /* espacio no rompible para ocupar lugar */}
            </div>
          </div>

          <button
            className="boton-panel naranja"
            style={{ width: '14%', height: '80px', borderRadius: 0 }}
            onClick={transmitirVotacionContador}
          >
            TRANSMITIR
          </button>
        </div>
      )}

      {/* Panel por contador */}
      {modo === 'contador' && (
        <div className="panel-ubicacion" style={{ height: '80px' }}>
          {/* Contador primero */}
          <div
            className="contador-columna"
            style={{
              width: '16%',
              height: '80px',
              display: 'flex',
            }}
          >
            <div
              className="contador-bloque contador-afirmativo"
              title="AFIRMATIVOS"
              style={{
                flex: 1,
                backgroundColor: colorVerde,
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: '900',
                fontSize: '1.5rem',
                userSelect: 'none',
                borderRadius: 0,
              }}
            >
              {contadorManual.afirmativos}
            </div>
            <div
              className="contador-bloque contador-negativo"
              title="NEGATIVOS"
              style={{
                flex: 1,
                backgroundColor: colorRojo,
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: '900',
                fontSize: '1.5rem',
                userSelect: 'none',
                borderRadius: 0,
              }}
            >
              {contadorManual.negativos}
            </div>
            <div
              className="contador-bloque contador-abstencion"
              title="ABSTENCIONES / NO VOTO"
              style={{
                flex: 1,
                backgroundColor: colorAmarillo,
                color: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: '900',
                fontSize: '1.5rem',
                userSelect: 'none',
                borderRadius: 0,
              }}
            >
              {Math.max(
                0,
                contadorManual.presentes -
                  contadorManual.afirmativos -
                  contadorManual.negativos
              )}
            </div>
          </div>

          {/* Bloque afirmativos */}
          <div className="bloque-votos" style={{ height: '80px', width: '14%' }}>
            <button
              className="boton-afirmativo"
              onClick={() =>
                setContadorManual(prev => ({
                  ...prev,
                  afirmativos: prev.afirmativos + 1,
                }))
              }
              style={{ borderRadius: 0 }}
            >
              + AFIRMATIVO
            </button>
            <button
              className="boton-afirmativo"
              onClick={() =>
                setContadorManual(prev => ({
                  ...prev,
                  afirmativos: Math.max(0, prev.afirmativos - 1),
                }))
              }
              style={{ borderRadius: 0 }}
            >
              - AFIRMATIVO
            </button>
          </div>

          {/* Bloque negativos */}
          <div className="bloque-votos" style={{ height: '80px', width: '14%' }}>
            <button
              className="boton-negativo"
              onClick={() =>
                setContadorManual(prev => ({
                  ...prev,
                  negativos: prev.negativos + 1,
                }))
              }
              style={{ borderRadius: 0 }}
            >
              + NEGATIVO
            </button>
            <button
              className="boton-negativo"
              onClick={() =>
                setContadorManual(prev => ({
                  ...prev,
                  negativos: Math.max(0, prev.negativos - 1),
                }))
              }
              style={{ borderRadius: 0 }}
            >
              - NEGATIVO
            </button>
          </div>

          {/* Botón mayoría */}
          <button
            onClick={() => setTipoMayoria(prev => (prev === 'simple' ? 'absoluta' : 'simple'))}
            className="boton-panel naranja"
            style={{
              width: '14%',
              height: '80px',
              whiteSpace: 'normal',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              lineHeight: '1.1',
            }}
          >
            <span>MAYORÍA</span>
            <span style={{ fontSize: '1rem' }}>
              {tipoMayoria === 'simple' ? 'SIMPLE' : 'ABSOLUTA'}
            </span>
          </button>

          {/* Botón reiniciar */}
          <button
            className="boton-panel naranja"
            style={{ width: '14%', height: '80px', borderRadius: 0 }}
            onClick={reiniciarVotacion}
          >
            REINICIAR
          </button>

          {/* BLOQUE RESULTADO con estilos dinámicos */}
          <div
            style={{
              width: '14%',
              height: '80px',
              color: resultadoEstilos().color,
              backgroundColor: resultadoEstilos().backgroundColor,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textAlign: 'center',
              borderRadius: 0,
              userSelect: 'none',
            }}
          >
            <div style={{ height: '1.2rem', lineHeight: '1.2rem' }}>RESULTADO:</div>
            <div style={{ fontSize: '1.2rem', marginTop: '4px', minHeight: '1.4rem' }}>
              {resultado || '\u00A0'}
            </div>
          </div>

          {/* Botón transmitir */}
          <button
            className="boton-panel naranja"
            style={{ width: '14%', height: '80px', borderRadius: 0 }}
            onClick={transmitirVotacion}
          >
            TRANSMITIR
          </button>
        </div>
      )}
    </div>
  );
}
