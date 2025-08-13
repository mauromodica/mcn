import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import logoBlanco from '../assets/logomcnblanco.png';
import '../styles/diputados.css';  // Usamos los estilos ya existentes
import useSenadores from '../hooks/useSenadores';
import MapaSenadores from '../componentes/MapaSenadores';
import PanelSenadores from '../componentes/PanelSenadores';
import PanelVotaciones from '../componentes/PanelVotaciones';

export default function MCNSenadoresScreen() {
  const navigate = useNavigate();
  const senadores = useSenadores();

  useEffect(() => {
    document.title = "MCN - Cámara de Senadores";
  }, []);

  const [ubicaciones, setUbicaciones] = useState(() => {
    const stored = localStorage.getItem('ubicacionesSenadores');
    return stored ? JSON.parse(stored) : {};
  });

  const [seccionActiva, setSeccionActiva] = useState(null);
  const [senadorSeleccionado, setSenadorSeleccionado] = useState(null);
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

  const handleDrop = (senador, fila, columna) => {
    const nuevasUbicaciones = { ...ubicaciones };
    for (const key in nuevasUbicaciones) {
      if (nuevasUbicaciones[key]?.senador?.id === senador.id) {
        nuevasUbicaciones[key] = null;
      }
    }
    nuevasUbicaciones[`${fila}-${columna}`] = { senador };
    setUbicaciones(nuevasUbicaciones);
  };

  useEffect(() => {
    const senadoresPresentes = Object.values(ubicaciones).filter(
      (celda) => celda && celda.senador
    ).length;

    setContadorManual((prev) => ({
      ...prev,
      presentes: senadoresPresentes,
    }));
  }, [ubicaciones]);

  useEffect(() => {
    localStorage.setItem('ubicacionesSenadores', JSON.stringify(ubicaciones));
  }, [ubicaciones]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        devolverSenadorAlPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [senadorSeleccionado, ubicaciones]);

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

  const seleccionarSenador = (id) => {
    setSenadorSeleccionado(id);
  };

  const moverSenador = (id, nuevaCelda) => {
    if (nuevaCelda !== null && ubicaciones[nuevaCelda]) return;

    setUbicaciones((prev) => {
      const nueva = { ...prev };
      Object.keys(nueva).forEach((key) => {
        if (nueva[key]?.senador?.id === id) {
          nueva[key] = null;
        }
      });

      if (nuevaCelda !== null) {
        const senador = senadores.find((s) => s.id === id);
        if (senador) nueva[nuevaCelda] = { senador };
      }
      return nueva;
    });

    if (nuevaCelda === null) {
      setSenadorSeleccionado(null);
      setVotos((prev) => {
        const { [id]: _, ...resto } = prev;
        return resto;
      });
    }
  };

  const devolverAlPanel = (id) => {
    moverSenador(id, null);
  };

  const limpiarCamara = () => {
    setUbicaciones({});
    setSenadorSeleccionado(null);
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

  const senadoresUbicadosIds = Object.values(ubicaciones)
    .filter((celda) => celda && celda.senador)
    .map((celda) => celda.senador.id);

  const senadoresSinUbicar = senadores.filter(
    (s) => !senadoresUbicadosIds.includes(s.id)
  );

  const conteoVotos = React.useMemo(() => {
    const total = senadoresUbicadosIds.length;
    let afirmativos = 0;
    let negativos = 0;

    senadoresUbicadosIds.forEach((id) => {
      const voto = votos[id];
      if (voto === 'afirmativo') afirmativos++;
      else if (voto === 'negativo') negativos++;
    });

    const abstenciones = total - (afirmativos + negativos);
    return { afirmativos, negativos, abstenciones };
  }, [votos, senadoresUbicadosIds]);

  const conteoContador = React.useMemo(() => {
    const { afirmativos, negativos } = contadorManual;
    const abstenciones = senadoresUbicadosIds.length - (afirmativos + negativos);
    return { afirmativos, negativos, abstenciones };
  }, [contadorManual, senadoresUbicadosIds]);

  const devolverSenadorAlPanel = () => {
    if (!senadorSeleccionado) return;

    const nuevasUbicaciones = { ...ubicaciones };
    const celdaEncontrada = Object.entries(nuevasUbicaciones).find(
      ([, celda]) => celda?.senador?.id === senadorSeleccionado
    );

    if (celdaEncontrada) {
      const [celdaKey] = celdaEncontrada;
      nuevasUbicaciones[celdaKey] = null;
      setUbicaciones(nuevasUbicaciones);
      setSenadorSeleccionado(null);
    }
  };

  const resultadoVotacion = React.useMemo(() => {
    const presentes = senadoresUbicadosIds.length;
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
  }, [modoVotacion, tipoMayoria, contadorManual, conteoVotos, senadoresUbicadosIds]);

  useEffect(() => {
    const ubicacionesValidas = Object.entries(ubicaciones).filter(
      ([_, celda]) => celda && celda.senador
    );

    const data = ubicacionesValidas.map(([clave, celda]) => ({
      id: celda.senador.id,
      nombre: celda.senador.nombre,
      apellido: celda.senador.apellido,
      voto: votos[celda.senador.id] || null
    }));

    canalTransmision.postMessage({
        tipo: 'actualizar',
        mapa: ubicaciones,
        votos: votos,
    });
    }, [votos, ubicaciones]);

  const transmitirVotacion = () => {
    localStorage.setItem('modoVotacion', modoVotacion);
    localStorage.setItem('tipoMayoria', tipoMayoria);

    if (modoVotacion === 'contador') {
      const presentes = senadoresUbicadosIds.length;
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

    if (ventanaTransmision && !ventanaTransmision.closed) {
      const { afirmativos, negativos, abstenciones } = conteoVotos;
      const presentes = senadoresUbicadosIds.length;

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

    localStorage.setItem('camara', 'senadores');
    const transmisionUrl = (process.env.PUBLIC_URL || '') + '/#/transmision';
    const nuevaVentana = window.open(transmisionUrl, 'transmisionVotacion', 'width=1000,height=700');
    if (nuevaVentana) {
      setVentanaTransmision(nuevaVentana);
    }

  };

  const handleTransmitirContador = () => {
    const presentes = senadoresUbicadosIds.length;
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

    transmitirVotacion();
  };

  useEffect(() => {
    localStorage.setItem('mapaSenadores', JSON.stringify(ubicaciones));
  }, [ubicaciones]);

  useEffect(() => {
    localStorage.setItem('votosSenadores', JSON.stringify(votos));
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
            CÁMARA DE SENADORES
          </h1>
        </div>

        {/* Menú */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#E05206',
          }}
        >
          {['SENADORES', 'VOTACIONES', 'OTROS'].map((seccion, i) => {
            const activo = seccionActiva === seccion;

            const manejarClick = () => {
              if (seccion === 'VOTACIONES') {
                if (activo) {
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
        {seccionActiva === 'SENADORES' && (
          <PanelSenadores
            senadores={senadoresSinUbicar}
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
            finalizarVotacion={() => {}}
            transmitirVotacion={transmitirVotacion}
            transmitirVotacionContador={handleTransmitirContador}
            reiniciarVotacion={reiniciarVotacion}
            diputadosUbicadosIds={senadoresUbicadosIds}
            setVotos={setVotos}
            tipoMayoria={tipoMayoria}
            setTipoMayoria={setTipoMayoria}
            resultado={resultadoVotacion}
          />
        )}

        {/* Mapa */}
        <div style={{ padding: '1rem' }}>
          <MapaSenadores
            senadores={senadores}
            ubicaciones={ubicaciones}
            onMoverDiputado={moverSenador}
            diputadoSeleccionado={senadorSeleccionado}
            seleccionarDiputado={seleccionarSenador}
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
              CANTIDAD DE SENADORES PRESENTES: {senadoresUbicadosIds.length}
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
