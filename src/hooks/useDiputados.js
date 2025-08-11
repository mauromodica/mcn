import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhHP_PA2GjioU4cvGwnhdNKaja18L8btQHqTmCb2msaCh2fOUtIbcc4dd1PP1NCW20UeCUzNdIIXGy/pub?output=csv';

export default function useDiputados() {
  const [diputados, setDiputados] = useState([]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      complete: (results) => {
        const todos = results.data;

        const filtrados = todos
          .filter((d) => d['Cámara']?.toLowerCase() === 'diputados')
          .map((d) => ({
            ...d,
            id: d.DNI?.trim(), // Usamos DNI como ID único
          }))
          .filter((d) => d.id); // Eliminamos filas sin DNI

        setDiputados(filtrados);
      },
      error: (error) => {
        console.error('Error al cargar CSV:', error);
      },
    });
  }, []);

  return diputados;
}