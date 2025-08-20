// src/screens/TransmisionVotacion.jsx
import React, { useEffect, useState, useCallback } from 'react';
import '../styles/diputados.css';
import '../styles/transmision.css';
import logoNaranja from '../assets/logomcnnaranja.png';

const safeParse = (s) => {
  try { return JSON.parse(s); } catch { return null; }
};

const posiblesClaveMapa = [
  'mapaSenadores', 'mapaDiputados',
  'ubicacionesSenadores', 'ubicacionesDiputados',
  'mapa', 'ubicaciones'
];

const posiblesClaveVotos = [
  'votosSenadores', 'votosDiputados',
  'votos', 'votos_map'
];



export default function TransmisionVotacion() {
  const camara = (localStorage.getItem('camara') || 'diputados').toLowerCase();
  const filas = camara === 'senadores' ? 6 : 8;
  const textoPresentes = camara === 'senadores' ? 'SENADORES PRESENTES' : 'DIPUTADOS PRESENTES';
  const cols = 16;

  useEffect(() => {
      document.title = "MCN - Votación";
    }, []);

  const [mapaOriginal, setMapaOriginal] = useState({});
  const [votos, setVotos] = useState({});
  const [presentes, setPresentes] = useState(0);
  const [afirmativos, setAfirmativos] = useState(0);
  const [negativos, setNegativos] = useState(0);
  const [resultado, setResultado] = useState('');
  const [modoVotacion, setModoVotacion] = useState('ubicacion');

  const leerDeLocalStorage = useCallback((claves) => {
    for (const k of claves) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = safeParse(raw);
      if (parsed) return parsed;
    }
    return null;
  }, []);

  const recalcular = useCallback((mapa, votosObj) => {
    const presentesCount = Object.values(mapa || {}).filter(celda => {
      const legislador = celda?.diputado || celda?.senador;
      return !!(legislador && legislador.id);
    }).length;

    const afirm = Object.values(votosObj || {}).filter(v => v === 'afirmativo').length;
    const negat = Object.values(votosObj || {}).filter(v => v === 'negativo').length;

    const tipoMayoria = localStorage.getItem('tipoMayoria') || 'simple';
    const mayoriaAbsoluta = tipoMayoria === 'absoluta';

    let res = '';
    if (afirm === 0 && negat === 0) {
      res = '';
    } else if (mayoriaAbsoluta) {
      const necesarios = Math.floor(presentesCount / 2) + 1;
      if (afirm >= necesarios) res = 'APROBADO';
      else if (negat >= necesarios) res = 'RECHAZADO';
      else if (afirm === negat && afirm + negat === presentesCount && presentesCount > 0) res = 'EMPATE';
      else res = '';
    } else {
      if (afirm > negat) res = 'APROBADO';
      else if (negat > afirm) res = 'RECHAZADO';
      else res = 'EMPATE';
    }

    setPresentes(presentesCount);
    setAfirmativos(afirm);
    setNegativos(negat);
    setResultado(res);
  }, []);

  useEffect(() => {
    const modo = localStorage.getItem('modoVotacion') || 'ubicacion';
    setModoVotacion(modo);

    if (modo === 'contador') {
      const datos = safeParse(localStorage.getItem('contadorManual') || '{}') || {};
      setPresentes(datos.presentes || 0);
      setAfirmativos(datos.afirmativos || 0);
      setNegativos(datos.negativos || 0);
      setResultado(datos.resultado || '');
      return;
    }

    const mapaFromLS = leerDeLocalStorage(posiblesClaveMapa) || {};
    const votosFromLS = leerDeLocalStorage(posiblesClaveVotos) || {};

    setMapaOriginal(mapaFromLS);
    setVotos(votosFromLS);
    recalcular(mapaFromLS, votosFromLS);
  }, [leerDeLocalStorage, recalcular]);

  useEffect(() => {
    if (modoVotacion === 'contador') return;
    recalcular(mapaOriginal, votos);
  }, [mapaOriginal, votos, modoVotacion, recalcular]);

  useEffect(() => {
    const handleMensaje = (event) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data) return;

      if (data.tipo === 'actualizar') {
        const mapa = data.mapa || data.ubicaciones || {};
        const votosN = data.votos || {};
        setMapaOriginal(mapa);
        setVotos(votosN);
        recalcular(mapa, votosN);
        return;
      }

      if (data.tipo === 'resultado') {
        setPresentes(data.presentes || 0);
        setAfirmativos(data.afirmativos || 0);
        setNegativos(data.negativos || 0);
        setResultado(data.resultado || '');
        return;
      }

      if (data.ubicaciones || data.votos) {
        const mapa = data.ubicaciones || data.mapa || {};
        const votosN = data.votos || {};
        setMapaOriginal(mapa);
        setVotos(votosN);
        recalcular(mapa, votosN);
      }
    };

    window.addEventListener('message', handleMensaje);
    return () => window.removeEventListener('message', handleMensaje);
  }, [recalcular]);

  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('transmision_votacion');
      bc.onmessage = (ev) => {
        const data = ev.data;
        if (!data) return;
        if (data.tipo === 'actualizar' && (data.mapa || data.votos)) {
          const mapa = data.mapa || {};
          const votosN = data.votos || {};
          setMapaOriginal(mapa);
          setVotos(votosN);
          recalcular(mapa, votosN);
        }
      };
    } catch (e) {
      // no soportado
    }
    return () => {
      if (bc) bc.close();
    };
  }, [recalcular]);

  // construimos matriz (filas x cols)
  const matriz = Array.from({ length: filas }, (_, i) =>
    Array.from({ length: cols }, (_, j) => mapaOriginal[`${i}-${j}`] || null)
  );
  const mapaEspejado = matriz.map(fila => [...fila].reverse()).reverse();

  // STYLES dinámicos que solucionan el "espacio extra" para senadores
  const wrapperStyle = {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: camara === 'senadores' ? 'stretch' : 'center',
    padding: '1rem 10px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const mapaGridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${filas}, 1fr)`,
    gap: '4px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    borderRadius: '6px',
    // usamos aspect-ratio para mantener proporción; height:100% para que ocupe el contenedor si es necesario
    aspectRatio: `${cols}/${filas}`,
    height: '100%',
  };

  return (
    <div className="transmision-container">
      <header className="transmision-header">
        <img src={logoNaranja} alt="Logo MCN" className="logo-transmision" />
        <h1 className="titulo-transmision">
          VOTACIÓN
          <span style={{ fontSize: '1rem', marginLeft: '1rem', color: '#ccc' }}>
            ({localStorage.getItem('tipoMayoria') === 'absoluta' ? 'Mayoría Absoluta' : 'Mayoría Simple'})
          </span>
        </h1>
      </header>

      <div className={`contador-transmision ${modoVotacion === 'contador' ? 'contador-contador' : ''}`}>
        {modoVotacion === 'contador' ? (
          <>
            <div className="bloque presente">
              <div className="titulo">{textoPresentes}</div>
              <div className="numero">{presentes}</div>
            </div>
            <div className="bloques-50">
              <div className="bloque verde">
                <div className="titulo">AFIRMATIVOS</div>
                <div className="numero">{afirmativos}</div>
              </div>
              <div className="bloque rojo">
                <div className="titulo">NEGATIVOS</div>
                <div className="numero">{negativos}</div>
              </div>
            </div>
            <div className={`bloque resultado ${resultado.toLowerCase() || 'gris'}`}>
              <div className="titulo">RESULTADO</div>
              <div className="numero">{resultado || ''}</div>
            </div>
          </>
        ) : (
          <>
            <div className="bloque cian">
              <div className="titulo">{textoPresentes}</div>
              <div className="numero">{presentes}</div>
            </div>
            <div className="bloque verde">
              <div className="titulo">AFIRMATIVOS</div>
              <div className="numero">{afirmativos}</div>
            </div>
            <div className="bloque rojo">
              <div className="titulo">NEGATIVOS</div>
              <div className="numero">{negativos}</div>
            </div>
            <div className={`bloque resultado ${resultado.toLowerCase() || 'gris'}`}>
              <div className="titulo">RESULTADO</div>
              <div className="numero">{resultado || ''}</div>
            </div>
          </>
        )}
      </div>

      {modoVotacion === 'ubicacion' && (
        <div className="mapa-wrapper" style={wrapperStyle}>
          <div className="mapa" style={mapaGridStyle}>
            {mapaEspejado.map((fila, i) =>
              fila.map((celda, j) => {
                let clase = 'gris-vacio';
                const legislador = celda?.diputado || celda?.senador;
                if (legislador?.id) {
                  const voto = votos[legislador.id];
                  if (voto === 'afirmativo') clase = 'verde';
                  else if (voto === 'negativo') clase = 'rojo';
                  else clase = 'gris-presente';
                }
                return <div key={`${i}-${j}`} className={`celda-transmision ${clase}`} />;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
