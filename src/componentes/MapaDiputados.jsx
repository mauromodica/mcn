import React from 'react';
import Celda from './Celda';

export default function MapaDiputados({
  diputados,
  ubicaciones,
  onMoverDiputado,
  diputadoSeleccionado,
  seleccionarDiputado,
  tipoVotacion = null,
  modoConteo = 'afirmativo',
  votos = {},
  toggleVoto,
}) {
  const filas = 8;
  const columnas = 16;

  // Construir un mapa de celdaKey -> diputado según la estructura correcta de ubicaciones
  const diputadosPorCelda = {};
  Object.entries(ubicaciones).forEach(([celdaKey, celda]) => {
    if (celda && celda.diputado) {
      diputadosPorCelda[celdaKey] = celda.diputado;
    }
  });

  const renderCeldas = () => {
    const celdas = [];

    for (let fila = 0; fila < filas; fila++) {
      for (let columna = 0; columna < columnas; columna++) {
        const celdaKey = `${fila}-${columna}`;
        const diputado = diputadosPorCelda[celdaKey] || null;
        const seleccionado = diputado && diputado.id === diputadoSeleccionado;

        // Obtener voto actual de este diputado
        const voto = diputado ? votos[diputado.id] : null;

        celdas.push(
          <Celda
            key={celdaKey}
            fila={fila}
            columna={columna}
            diputado={diputado}
            onSoltar={(id) => {
              if (tipoVotacion !== 'ubicacion') {
                onMoverDiputado(id, celdaKey);
              }
            }}
            seleccionado={seleccionado}
            seleccionarDiputado={seleccionarDiputado}
            celdaKey={celdaKey}
            tipoVotacion={tipoVotacion}
            modoConteo={modoConteo}
            voto={voto}
            votos={votos}
            modoVotoActivo={tipoVotacion === 'ubicacion'}
            toggleVoto={toggleVoto}
          />
        );
      }
    }

    return celdas;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        className="mapa-diputados"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 95px)',
          gridTemplateRows: 'repeat(8, 70px)',
          gap: '8px',
          justifyContent: 'center',
          paddingTop: '1rem',
          marginBottom: '1rem',
        }}
      >
        {renderCeldas()}
      </div>
    </div>
  );
}
