import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import TarjetaLegislador from './TarjetaLegislador';

const colorCian = '#009AA6';
const colorNaranja = '#E05206';

// Normaliza texto para ignorar tildes, mayúsculas y espacios extra
const normalizar = (str) =>
  (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// Normaliza una clave (para los nombres de las propiedades del objeto)
const normalizarClave = (key) =>
  (key || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();

export default function PanelSenadores({ senadores, ubicaciones, abierto, onDropAlPanel }) {
  const [busqueda, setBusqueda] = useState('');

  const texto = normalizar(busqueda);

  const senadoresUbicados = Object.keys(ubicaciones ?? {});
  const ausentes = senadores.filter((d) => !senadoresUbicados.includes(d.id));

  const senadoresFiltrados = ausentes.filter((dip) => {
    const camposNorm = {};
    Object.entries(dip || {}).forEach(([k, v]) => {
      const kNorm = normalizarClave(k);
      camposNorm[kNorm] = (v ?? '').toString().trim();
    });

    const nombreRaw =
      camposNorm['nombre'] ||
      camposNorm['nombres'] ||
      camposNorm['nombreyapellido'] ||
      camposNorm['nombre_completo'] ||
      camposNorm['nombresyapellidos'] ||
      camposNorm['givenname'] ||
      '';

    const apellidoRaw =
      camposNorm['apellido'] ||
      camposNorm['apellidos'] ||
      camposNorm['apellido_nombre'] ||
      camposNorm['familyname'] ||
      '';

    const provinciaRaw =
      camposNorm['provincia'] ||
      camposNorm['provincia_reside'] ||
      camposNorm['province'] ||
      '';

    const bloqueRaw =
      camposNorm['bloque'] ||
      camposNorm['partido'] ||
      camposNorm['partidonombre'] ||
      '';

    const colegioRaw =
      camposNorm['colegio'] ||
      camposNorm['escuela'] ||
      camposNorm['colegionombre'] ||
      '';

    const nombre = normalizar(nombreRaw);
    const apellido = normalizar(apellidoRaw);
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    const apellidoNombre = `${apellido} ${nombre}`.trim();
    const provincia = normalizar(provinciaRaw);
    const bloque = normalizar(bloqueRaw);
    const colegio = normalizar(colegioRaw);

    return (
      nombre.includes(texto) ||
      apellido.includes(texto) ||
      nombreCompleto.includes(texto) ||
      apellidoNombre.includes(texto) ||
      provincia.includes(texto) ||
      bloque.includes(texto) ||
      colegio.includes(texto)
    );
  });

  const mostrarSenadores = texto === '' ? ausentes : senadoresFiltrados;

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'DIPUTADO', // Por compatibilidad, podés cambiar a 'SENADOR' si querés
      drop: (item) => {
        onDropAlPanel(item.id);
      },
      canDrop: (item) => senadoresUbicados.includes(item.id),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [senadoresUbicados, onDropAlPanel]
  );

  if (!abierto) return null;

  return (
    <div
      ref={drop}
      style={{
        padding: '0 1rem 1rem 1rem',
        backgroundColor: isOver && canDrop ? '#fef3c7' : 'transparent',
        transition: 'background-color 0.3s',
      }}
    >
      <div style={{ marginTop: '10px' }} />

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar legislador..."
        style={{
          width: '45%',
          padding: '0.4rem 0.8rem',
          borderRadius: '12px',
          border: '1px solid #ccc',
          fontSize: '0.9rem',
          fontFamily: 'Nunito, sans-serif',
          marginBottom: '1rem',
        }}
      />

      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '0.5rem',
          maxHeight: '80px',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'thin',
          scrollbarColor: `${colorCian} transparent`,
          marginBottom: '10px',
        }}
        className="panel-scroll-horizontal"
      >
        {mostrarSenadores.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
            No se encontraron legisladores.
          </div>
        ) : (
          mostrarSenadores.map((dip) => (
            <div
              key={dip.id}
              style={{
                width: '95px',
                height: '70px',
                flexShrink: 0,
              }}
            >
              <TarjetaLegislador legislador={dip} />
            </div>
          ))
        )}
      </div>

      <div
        style={{
          height: '2px',
          width: '90%',
          backgroundColor: colorNaranja,
          borderRadius: '10px',
          margin: '10px auto 0 auto',
          boxShadow: '0 2px 5px rgba(224, 82, 6, 0.5)',
        }}
      />

      <style>{`
        .panel-scroll-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .panel-scroll-horizontal::-webkit-scrollbar-track {
          background: transparent;
        }
        .panel-scroll-horizontal::-webkit-scrollbar-thumb {
          background-color: ${colorCian};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
