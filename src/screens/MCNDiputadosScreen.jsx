// Mismo archivo con lógica confirmada y estable

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import logoBlanco from '../assets/logomcnblanco.png';
import '../styles/diputados.css';
import useDiputados from '../hooks/useDiputados';
import MapaDiputados from '../componentes/MapaDiputados';
import PanelDiputados from '../componentes/PanelDiputados';
import PanelVotaciones from '../componentes/PanelVotaciones';


export default function MCNDiputadosScreen() {
  const navigate = useNavigate();
  const diputados = useDiputados();

  useEffect(() => {
    document.title = "MCN - Cámara de Diputados";
  }, []);

  const [ubicaciones, setUbicaciones] = useState(() => {
    const stored = localStorage.getItem('ubicacionesDiputados');
    return stored ? JSON.parse(stored) : {};
  });

  const [seccionActiva, setSeccionActiva] = useState(null);
  const [diputadoSeleccionado, setDiputadoSeleccionado] = useState(null);
  const [modoVotacion, setModoVotacion] = useState(null);
  const [modoSeleccion, setModoSeleccion] = useState('afirmativo');
  const [votos, setVotos] = useState({});
  const [contadorManual, setContadorManual] = useState({
    afirmativos: 0,
    negativos: 0,
    presentes: 0,
  });
  const [tipoMayoria, setTipoMayoria] = useState('simple');

  const [panelVotacionesAbierto, setPanelVotacionesAbierto] = React.useState(false);
  const [modo, setModo] = React.useState(null);
  const [votacionActiva, setVotacionActiva] = React.useState(false);
  const [ventanaTransmision, setVentanaTransmision] = useState(null);
  

  const reiniciarVotacion = () => {
    setContadorManual((prev) => ({
      ...prev,
      afirmativos: 0,
      negativos: 0,
      presentes: prev.presentes,
    }));
  };



  const canalTransmision = new BroadcastChannel('transmision_votacion');


  const toggleVoto = (id) => {
    if (modoVotacion !== 'ubicacion') return;

    setVotos((prevVotos) => {
      const votoActual = prevVotos[id];
      if (votoActual === modoSeleccion) {
        const { [id]: _, ...resto } = prevVotos;
        return resto;
      }
      return { ...prevVotos, [id]: modoSeleccion };
    });
  };

  const handleDrop = (diputado, fila, columna) => {
    const nuevasUbicaciones = { ...ubicaciones };
    for (const key in nuevasUbicaciones) {
      if (nuevasUbicaciones[key]?.diputado?.id === diputado.id) {
        nuevasUbicaciones[key] = null;
      }
    }
    nuevasUbicaciones[`${fila}-${columna}`] = { diputado };
    setUbicaciones(nuevasUbicaciones);
  };

  useEffect(() => {
    const diputadosPresentes = Object.values(ubicaciones).filter(
      (celda) => celda && celda.diputado
    ).length;

    setContadorManual((prev) => ({
      ...prev,
      presentes: diputadosPresentes,
    }));
  }, [ubicaciones]);

  useEffect(() => {
    localStorage.setItem('ubicacionesDiputados', JSON.stringify(ubicaciones));
  }, [ubicaciones]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        devolverDiputadoAlPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diputadoSeleccionado, ubicaciones]);

  useEffect(() => {
    if (ventanaTransmision && !ventanaTransmision.closed) {
      ventanaTransmision.postMessage(
        { ubicaciones, votos },
        window.location.origin
      );
    }
  }, [ubicaciones, votos, ventanaTransmision]);

  useEffect(() => {
    if (!ventanaTransmision) return;

    const handleUnload = () => setVentanaTransmision(null);

    ventanaTransmision.addEventListener('beforeunload', handleUnload);
    ventanaTransmision.addEventListener('unload', handleUnload);
  
    return () => {
      if (ventanaTransmision) {
        ventanaTransmision.removeEventListener('beforeunload', handleUnload);
        ventanaTransmision.removeEventListener('unload', handleUnload);
      }
    };
  }, [ventanaTransmision]);

  const seleccionarDiputado = (id) => {
    setDiputadoSeleccionado(id);
  };

  const moverDiputado = (id, nuevaCelda) => {
    if (nuevaCelda !== null && ubicaciones[nuevaCelda]) return;

    setUbicaciones((prev) => {
      const nueva = { ...prev };
      Object.keys(nueva).forEach((key) => {
        if (nueva[key]?.diputado?.id === id) {
          nueva[key] = null;
        }
      });

      if (nuevaCelda !== null) {
        const diputado = diputados.find((d) => d.id === id);
        if (diputado) nueva[nuevaCelda] = { diputado };
      }
      return nueva;
    });

    if (nuevaCelda === null) {
      setDiputadoSeleccionado(null);
      setVotos((prev) => {
        const { [id]: _, ...resto } = prev;
        return resto;
      });
    }
  };

  const devolverAlPanel = (id) => {
    moverDiputado(id, null);
  };

  const limpiarCamara = () => {
    setUbicaciones({});
    setDiputadoSeleccionado(null);
    setVotos({});
  };

  const toggleSeccion = (seccion) => {
    if (seccion === 'VOTACIONES') {
      if (seccionActiva === 'VOTACIONES') {
        setSeccionActiva(null);
        setModoVotacion(null);
        setVotacionActiva(false);
      } else {
        setSeccionActiva('VOTACIONES');
        setModoVotacion('ubicacion');
        setVotacionActiva(true);
      }
    } else {
      setSeccionActiva((prev) => (prev === seccion ? null : seccion));
      setModoVotacion(null);
      setVotacionActiva(false);
    }
  };

  const finalizarVotacion = () => {
    setVotos((prevVotos) => {
      const nuevosVotos = { ...prevVotos };
      diputadosUbicadosIds.forEach((id) => {
        if (!nuevosVotos[id]) {
          nuevosVotos[id] = 'negativo';
        }
      });
      return nuevosVotos;
    });
  };

  const diputadosUbicadosIds = Object.values(ubicaciones)
    .filter((celda) => celda && celda.diputado)
    .map((celda) => celda.diputado.id);

  const diputadosSinUbicar = diputados.filter(
    (d) => !diputadosUbicadosIds.includes(d.id)
  );

  const conteoVotos = React.useMemo(() => {
    const total = diputadosUbicadosIds.length;
    let afirmativos = 0;
    let negativos = 0;

    diputadosUbicadosIds.forEach((id) => {
      const voto = votos[id];
      if (voto === 'afirmativo') afirmativos++;
      else if (voto === 'negativo') negativos++;
    });

    const abstenciones = total - (afirmativos + negativos);
    return { afirmativos, negativos, abstenciones };
  }, [votos, diputadosUbicadosIds]);

  const conteoContador = React.useMemo(() => {
    const { afirmativos, negativos } = contadorManual;
    const abstenciones = diputadosUbicadosIds.length - (afirmativos + negativos);
    return { afirmativos, negativos, abstenciones };
  }, [contadorManual, diputadosUbicadosIds]);


  const devolverDiputadoAlPanel = () => {
    if (!diputadoSeleccionado) return;

    const nuevasUbicaciones = { ...ubicaciones };
    const celdaEncontrada = Object.entries(nuevasUbicaciones).find(
      ([, celda]) => celda?.diputado?.id === diputadoSeleccionado
    );

    if (celdaEncontrada) {
      const [celdaKey] = celdaEncontrada;
      nuevasUbicaciones[celdaKey] = null;
      setUbicaciones(nuevasUbicaciones);
      setDiputadoSeleccionado(null);
    }
  };

    // Agregar este useMemo o función para calcular resultado
  const resultadoVotacion = React.useMemo(() => {
    const presentes = diputadosUbicadosIds.length;
    const mayoriaAbsoluta = tipoMayoria === 'absoluta';

    let afirm = 0;
    let negat = 0;

    if (modoVotacion === 'contador') {
      afirm = contadorManual.afirmativos;
      negat = contadorManual.negativos;
    } else if (modoVotacion === 'ubicacion') {
      afirm = conteoVotos.afirmativos;
      negat = conteoVotos.negativos;
    }

    if (afirm === 0 && negat === 0) {
      return '';
    }

    if (mayoriaAbsoluta) {
      if (afirm > presentes / 2) return 'APROBADO';
      if (negat > presentes / 2) return 'RECHAZADO';
      if (afirm === negat && afirm + negat === presentes) return 'EMPATE';
    } else {
      if (afirm > negat) return 'APROBADO';
      if (negat > afirm) return 'RECHAZADO';
      return 'EMPATE';
    }
    return '';
  }, [modoVotacion, tipoMayoria, contadorManual, conteoVotos, diputadosUbicadosIds]);



  // 🚀 NUEVO: Emitimos por BroadcastChannel en cada cambio de votos o ubicaciones
  useEffect(() => {
    const ubicacionesValidas = Object.entries(ubicaciones).filter(
      ([_, celda]) => celda && celda.diputado
    );

    const data = ubicacionesValidas.map(([clave, celda]) => ({
      id: celda.diputado.id,
      nombre: celda.diputado.nombre,
      apellido: celda.diputado.apellido,
      voto: votos[celda.diputado.id] || null
    }));

    canalTransmision.postMessage({
      tipo: 'actualizar',
      diputados: data
    });
  }, [votos, ubicaciones]);

  const transmitirVotacion = () => {
    // Guarda el modo actual
    localStorage.setItem('modoVotacion', modoVotacion);
    localStorage.setItem('tipoMayoria', tipoMayoria);

    // Si el modo es contador, guarda también los valores actuales del contador
    if (modoVotacion === 'contador') {
      const presentes = diputadosUbicadosIds.length;
      const afirm = contadorManual.afirmativos;
      const negat = contadorManual.negativos;
      const abst = Math.max(0, presentes - afirm - negat);
      const mayoriaAbsoluta = tipoMayoria === 'absoluta';

      let resultado = '';
      if (afirm === 0 && negat === 0) {
        resultado = '';
      } else if (mayoriaAbsoluta) {
        if (afirm > presentes / 2) {
          resultado = 'APROBADO';
        } else if (negat > presentes / 2) {
          resultado = 'RECHAZADO';
        } else if (afirm === negat && afirm + negat === presentes) {
          resultado = 'EMPATE';
        } else {
          resultado = '';
        }
      } else {
        if (afirm > negat) {
          resultado = 'APROBADO';
        } else if (negat > afirm) {
          resultado = 'RECHAZADO';
        } else {
          resultado = 'EMPATE';
        }
      }

      const datosContador = {
        presentes,
        afirmativos: afirm,
        negativos: negat,
        abstenciones: abst,
        resultado,
      };

      localStorage.setItem('contadorManual', JSON.stringify(datosContador));
    }

    const mayoriaAbsoluta = tipoMayoria === 'absoluta';

    // Si la ventana ya está abierta, actualizar el contenido
    if (ventanaTransmision && !ventanaTransmision.closed) {
      const { afirmativos, negativos, abstenciones } = conteoVotos;
      const presentes = diputadosUbicadosIds.length;

      let resultado = '';
      if (afirmativos === 0 && negativos === 0) {
        resultado = '';
      } else if (mayoriaAbsoluta) {
        if (afirmativos > presentes / 2) {
          resultado = 'APROBADO';
        } else if (negativos > presentes / 2) {
          resultado = 'RECHAZADO';
        } else if (
          afirmativos === negativos &&
          afirmativos + negativos === presentes &&
          afirmativos === presentes / 2
        ) {
          resultado = 'EMPATE';
        } else {
          resultado = '';
        }
      } else {
        if (afirmativos > negativos) {
          resultado = 'APROBADO';
        } else if (negativos > afirmativos) {
          resultado = 'RECHAZADO';
        } else {
          resultado = 'EMPATE';
        }
      }

      localStorage.setItem('resultadoUbicacion', JSON.stringify({
        presentes,
        afirmativos,
        negativos,
        abstenciones,
        resultado,
      }));

      ventanaTransmision.postMessage({
        tipo: 'resultado',
        presentes,
        afirmativos,
        negativos,
        abstenciones,
        resultado,
      });

      ventanaTransmision.focus();
      return;
    }

    // Abrir una nueva ventana si aún no existe
    localStorage.setItem('camara', 'diputados');
    const nuevaVentana = window.open('/#/transmision', 'transmisionVotacion', 'width=1000,height=700');
    if (nuevaVentana) {
      setVentanaTransmision(nuevaVentana);
    }
  };

  const handleTransmitirContador = () => {
    const presentes = diputadosUbicadosIds.length;
    const afirm = contadorManual.afirmativos;
    const negat = contadorManual.negativos;
    const abst = Math.max(0, presentes - afirm - negat);
    const mayoriaAbsoluta = tipoMayoria === 'absoluta';

    let resultado = '';
    if (afirm === 0 && negat === 0) {
      resultado = '';
    } else if (mayoriaAbsoluta) {
      if (afirm > presentes / 2) {
        resultado = 'APROBADO';
      } else if (negat > presentes / 2) {
        resultado = 'RECHAZADO';
      } else if (afirm === negat) {
        resultado = 'EMPATE';
      } else {
        resultado = '';
      }
    } else {
      if (afirm > negat) {
        resultado = 'APROBADO';
      } else if (negat > afirm) {
        resultado = 'RECHAZADO';
      } else {
        resultado = 'EMPATE';
      }
    }

    const datosContador = {
      presentes,
      afirmativos: afirm,
      negativos: negat,
      abstenciones: abst,
      resultado,
    };

    localStorage.setItem('contadorManual', JSON.stringify(datosContador));

    transmitirVotacion(); // Abre la ventana como siempre
  };


  useEffect(() => {
    localStorage.setItem('ubicacionesDiputados', JSON.stringify(ubicaciones));
  }, [ubicaciones]);

  useEffect(() => {
    localStorage.setItem('votosDiputados', JSON.stringify(votos));
  }, [votos]);

  

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ fontFamily: 'Nunito, sans-serif' }}>
        {/* Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#E05206',
            padding: '1rem',
          }}
        >
          <img
            src={logoBlanco}
            alt="Logo MCN"
            style={{ height: 60, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />
          <h1 style={{ color: 'white', marginLeft: '1rem', fontSize: '1.8rem' }}>
            CÁMARA DE DIPUTADOS
          </h1>
        </div>

        {/* Menú */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#E05206',
            //borderBottom: '1px solid white',//
          }}
        >
          {['DIPUTADOS', 'VOTACIONES', 'OTROS'].map((seccion, i) => {
            const activo = seccionActiva === seccion;

            const manejarClick = () => {
              if (seccion === 'VOTACIONES') {
                if (activo) {
                  // Si ya está abierto, lo cerramos y desactivamos votación
                  setSeccionActiva(null);
                  setModoVotacion(null);
                  setVotacionActiva(false);
                } else {
                  // Abrimos votaciones y activamos modo
                  setSeccionActiva('VOTACIONES');
                  setModoVotacion('ubicacion');
                  setVotacionActiva(true);
                }
              } else {
                setSeccionActiva((prev) => (prev === seccion ? null : seccion));
                setModoVotacion(null);
                setVotacionActiva(false);
              }
            };

            return (
              <button
                key={seccion}
                onClick={manejarClick}
                className={`boton-menu ${activo ? 'activo' : ''}`}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: activo ? '#009AA6' : '#E05206',
                  color: 'white',
                  border: 'none',
                  borderRadius: 0,
                  //borderRight: i !== 2 ? '1px solid white' : undefined,//
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
              >
                {seccion}
              </button>
            );
          })}
        </div>

        {/* Paneles */}
        {seccionActiva === 'DIPUTADOS' && (
          <PanelDiputados
            diputados={diputadosSinUbicar}
            ubicaciones={ubicaciones}
            onDropAlPanel={devolverAlPanel}
            abierto={true}
          />
        )}

        {seccionActiva === 'VOTACIONES' && (
          <PanelVotaciones
              modo={modoVotacion}
              setModo={setModoVotacion}
              votoActivo={modoSeleccion}
              setVotoActivo={setModoSeleccion}
              conteoVotos={conteoVotos}
              contadorManual={contadorManual}
              setContadorManual={setContadorManual}
              finalizarVotacion={finalizarVotacion}
              transmitirVotacion={transmitirVotacion}
              transmitirVotacionContador={handleTransmitirContador}
              reiniciarVotacion={reiniciarVotacion}
              diputadosUbicadosIds={diputadosUbicadosIds}
              setVotos={setVotos}
              tipoMayoria={tipoMayoria}
              setTipoMayoria={setTipoMayoria}
              resultado={resultadoVotacion}
          />
        )}

        {/* Mapa */}
        <div style={{ padding: '1rem' }}>
          <MapaDiputados
            diputados={diputados}
            ubicaciones={ubicaciones}
            onMoverDiputado={moverDiputado}
            diputadoSeleccionado={diputadoSeleccionado}
            seleccionarDiputado={seleccionarDiputado}
            onDropEnCelda={handleDrop}
            votos={votos}
            modoVotoActivo={modoVotacion === 'ubicacion'}
            toggleVoto={toggleVoto}
            tipoVotacion={modoVotacion}
            mostrarVotacion={true}
          />

          {/* Contador + Limpiar */}
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: '600',
              fontSize: '1rem',
              color: '#222',
            }}
          >
            <div>
              CANTIDAD DE DIPUTADOS PRESENTES: {diputadosUbicadosIds.length}
            </div>
            <button
              className="boton-naranja boton-pequeno"
              onClick={limpiarCamara}
              type="button"
            >
              Limpiar cámara
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
