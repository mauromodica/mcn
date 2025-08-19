import React from 'react';
import Celda from './Celda';

export default function MapaSenadores({
  senadores,
  ubicaciones,
  onMoverDiputado, // Podrías renombrar a onMoverSenador para más claridad
  diputadoSeleccionado, // Mejor: senadorSeleccionado para evitar confusión
  seleccionarDiputado,  // Mejor: seleccionarSenador
  tipoVotacion = null,
  modoConteo = 'afirmativo',
  votos = {},
  toggleVoto,
}) {
  const filas = 6;
  const columnas = 12;

  const senadoresPorCelda = {};
  Object.entries(ubicaciones).forEach(([celdaKey, celda]) => {
    if (celda && celda.senador) {
      senadoresPorCelda[celdaKey] = celda.senador;
    }
  });

  const renderCeldas = () => {
    const celdas = [];

    for (let fila = 0; fila < filas; fila++) {
      for (let columna = 0; columna < columnas; columna++) {
        const celdaKey = `${fila}-${columna}`;
        const senador = senadoresPorCelda[celdaKey] || null;
        const seleccionado = senador && senador.id === diputadoSeleccionado;

        const voto = senador ? votos[senador.id] : null;

        celdas.push(
          <Celda
            key={celdaKey}
            fila={fila}
            columna={columna}
            diputado={senador}
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
        className="mapa-senadores"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 95px)',
          gridTemplateRows: 'repeat(6, 70px)',
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

