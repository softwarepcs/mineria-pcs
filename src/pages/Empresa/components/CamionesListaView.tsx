import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Battery,
  Signal,
  Clock,
  User,
  Maximize2,
  Minimize2,
  Check,
  Wrench,
  AlertCircle,
  Download,
} from "lucide-react";
import type { Empresa } from "../../../types";
import { getStoredGeocercas } from "../../../data/geocercasData";
import operadoresData from "../../../data/operadores.json";

export interface CamionUnidad {
  id: string;
  placa: string;
  modelo: string;
  tipoCarga: string;
  estado: "en_marcha" | "ralenti" | "operando" | "sin_senal";
  estadoLabel: string;
  conductor: string;
  legajo?: string;
  base?: string;
  vencimientoLicencia?: string;
  conduccionBrusca?: number;
  viajes?: number;
  turno: string;
  velocidadKmH: number;
  caudalLh: number;
  ultimoDatoSec: number;
  desvioPct: number;
  consumoDiaL: number;
  rendimientoL100km: number;
  horometroH: number;
  ralentiPct: number;
  bateriaPct: number;
  senalEstado: string;
  lat: number;
  lng: number;
  caudalHistorial: { hora: string; valor: number }[];
}

// 15 Default Truck Units matching the image and Buenos Aires coordinates
export const DEFAULT_CAMIONES: CamionUnidad[] = [
  {
    id: "TC-TRUCK-08",
    placa: "TC-TRUCK-08",
    modelo: "Iveco S-Way",
    tipoCarga: "Cisterna 6x4",
    estado: "en_marcha",
    estadoLabel: "En marcha",
    conductor: "Carlos Méndez",
    turno: "Turno mañana",
    velocidadKmH: 62,
    caudalLh: 128,
    ultimoDatoSec: 4,
    desvioPct: 12.8,
    consumoDiaL: 245,
    rendimientoL100km: 34.8,
    horometroH: 8426,
    ralentiPct: 14.7,
    bateriaPct: 87,
    senalEstado: "OK",
    lat: -34.588,
    lng: -58.41,
    caudalHistorial: [
      { hora: "12:00", valor: 310 },
      { hora: "12:30", valor: 280 },
      { hora: "13:00", valor: 270 },
      { hora: "13:30", valor: 305 },
      { hora: "14:00", valor: 290 },
      { hora: "14:30", valor: 240 },
      { hora: "15:00", valor: 180 },
      { hora: "15:30", valor: 270 },
      { hora: "16:00", valor: 320 },
    ],
  },
  {
    id: "TC-TRUCK-01",
    placa: "TC-TRUCK-01",
    modelo: "Volvo FH 540",
    tipoCarga: "Tolva Minera",
    estado: "en_marcha",
    estadoLabel: "En marcha",
    conductor: "Luis Ramírez",
    turno: "Turno mañana",
    velocidadKmH: 68,
    caudalLh: 142,
    ultimoDatoSec: 6,
    desvioPct: 4.3,
    consumoDiaL: 280,
    rendimientoL100km: 36.2,
    horometroH: 7210,
    ralentiPct: 11.2,
    bateriaPct: 92,
    senalEstado: "OK",
    lat: -34.52,
    lng: -58.48,
    caudalHistorial: [
      { hora: "12:00", valor: 290 },
      { hora: "13:00", valor: 330 },
      { hora: "14:00", valor: 310 },
      { hora: "15:00", valor: 250 },
      { hora: "16:00", valor: 340 },
    ],
  },
  {
    id: "TC-TRUCK-02",
    placa: "TC-TRUCK-02",
    modelo: "Scania R500",
    tipoCarga: "Cisterna 8x4",
    estado: "ralenti",
    estadoLabel: "Ralenti",
    conductor: "Ana Torres",
    turno: "Turno mañana",
    velocidadKmH: 12,
    caudalLh: 28,
    ultimoDatoSec: 14,
    desvioPct: 18.6,
    consumoDiaL: 195,
    rendimientoL100km: 41.5,
    horometroH: 6540,
    ralentiPct: 22.4,
    bateriaPct: 84,
    senalEstado: "OK",
    lat: -34.565,
    lng: -58.425,
    caudalHistorial: [
      { hora: "12:00", valor: 80 },
      { hora: "13:00", valor: 120 },
      { hora: "14:00", valor: 60 },
      { hora: "15:00", valor: 45 },
      { hora: "16:00", valor: 90 },
    ],
  },
  {
    id: "TC-TRUCK-11",
    placa: "TC-TRUCK-11",
    modelo: "Mercedes Actros",
    tipoCarga: "Cama Baja",
    estado: "operando",
    estadoLabel: "Operando",
    conductor: "Jorge Fernández",
    turno: "Turno tarde",
    velocidadKmH: 0,
    caudalLh: 310,
    ultimoDatoSec: 8,
    desvioPct: -7.2,
    consumoDiaL: 310,
    rendimientoL100km: 39.0,
    horometroH: 9120,
    ralentiPct: 8.5,
    bateriaPct: 89,
    senalEstado: "OK",
    lat: -34.575,
    lng: -58.49,
    caudalHistorial: [
      { hora: "12:00", valor: 300 },
      { hora: "13:00", valor: 320 },
      { hora: "14:00", valor: 310 },
      { hora: "15:00", valor: 295 },
      { hora: "16:00", valor: 310 },
    ],
  },
  {
    id: "TC-TRUCK-12",
    placa: "TC-TRUCK-12",
    modelo: "Iveco Trakker",
    tipoCarga: "Volquete 6x4",
    estado: "sin_senal",
    estadoLabel: "Sin señal",
    conductor: "María López",
    turno: "Turno mañana",
    velocidadKmH: 0,
    caudalLh: 0,
    ultimoDatoSec: 720,
    desvioPct: 0,
    consumoDiaL: 140,
    rendimientoL100km: 38.0,
    horometroH: 5410,
    ralentiPct: 15.0,
    bateriaPct: 42,
    senalEstado: "DÉBIL",
    lat: -34.545,
    lng: -58.44,
    caudalHistorial: [
      { hora: "12:00", valor: 0 },
      { hora: "13:00", valor: 0 },
      { hora: "14:00", valor: 0 },
      { hora: "15:00", valor: 0 },
      { hora: "16:00", valor: 0 },
    ],
  },
  {
    id: "TC-TRUCK-07",
    placa: "TC-TRUCK-07",
    modelo: "Scania G440",
    tipoCarga: "Tolva 8x4",
    estado: "ralenti",
    estadoLabel: "Ralenti",
    conductor: "Diego Morales",
    turno: "Turno mañana",
    velocidadKmH: 8,
    caudalLh: 24,
    ultimoDatoSec: 37,
    desvioPct: 21.4,
    consumoDiaL: 210,
    rendimientoL100km: 42.1,
    horometroH: 7890,
    ralentiPct: 24.1,
    bateriaPct: 80,
    senalEstado: "OK",
    lat: -34.64,
    lng: -58.5,
    caudalHistorial: [
      { hora: "12:00", valor: 70 },
      { hora: "13:00", valor: 50 },
      { hora: "14:00", valor: 85 },
      { hora: "15:00", valor: 30 },
      { hora: "16:00", valor: 45 },
    ],
  },
  {
    id: "TC-TRUCK-03",
    placa: "TC-TRUCK-03",
    modelo: "Volvo FMX 460",
    tipoCarga: "Hormigonera",
    estado: "en_marcha",
    estadoLabel: "En marcha",
    conductor: "Sofía Castro",
    turno: "Turno mañana",
    velocidadKmH: 74,
    caudalLh: 136,
    ultimoDatoSec: 9,
    desvioPct: -3.1,
    consumoDiaL: 260,
    rendimientoL100km: 35.1,
    horometroH: 6300,
    ralentiPct: 12.0,
    bateriaPct: 91,
    senalEstado: "OK",
    lat: -34.595,
    lng: -58.385,
    caudalHistorial: [
      { hora: "12:00", valor: 320 },
      { hora: "13:00", valor: 340 },
      { hora: "14:00", valor: 280 },
      { hora: "15:00", valor: 310 },
      { hora: "16:00", valor: 350 },
    ],
  },
  {
    id: "TC-TRUCK-05",
    placa: "TC-TRUCK-05",
    modelo: "Mercedes Arocs",
    tipoCarga: "Cisterna Combustible",
    estado: "operando",
    estadoLabel: "Operando",
    conductor: "Martín Ruiz",
    turno: "Turno mañana",
    velocidadKmH: 0,
    caudalLh: 298,
    ultimoDatoSec: 22,
    desvioPct: 6.7,
    consumoDiaL: 325,
    rendimientoL100km: 38.6,
    horometroH: 8900,
    ralentiPct: 10.3,
    bateriaPct: 85,
    senalEstado: "OK",
    lat: -34.655,
    lng: -58.415,
    caudalHistorial: [
      { hora: "12:00", valor: 290 },
      { hora: "13:00", valor: 310 },
      { hora: "14:00", valor: 300 },
      { hora: "15:00", valor: 285 },
      { hora: "16:00", valor: 298 },
    ],
  },
  {
    id: "TC-TRUCK-04",
    placa: "TC-TRUCK-04",
    modelo: "Volvo FM 420",
    tipoCarga: "Cisterna Agua",
    estado: "en_marcha",
    estadoLabel: "En marcha",
    conductor: "Juan Silva",
    turno: "Turno mañana",
    velocidadKmH: 58,
    caudalLh: 118,
    ultimoDatoSec: 5,
    desvioPct: 2.8,
    consumoDiaL: 230,
    rendimientoL100km: 35.8,
    horometroH: 7100,
    ralentiPct: 13.5,
    bateriaPct: 88,
    senalEstado: "OK",
    lat: -34.615,
    lng: -58.455,
    caudalHistorial: [
      { hora: "12:00", valor: 260 },
      { hora: "13:00", valor: 280 },
      { hora: "14:00", valor: 270 },
      { hora: "15:00", valor: 250 },
      { hora: "16:00", valor: 290 },
    ],
  },
  {
    id: "TC-TRUCK-06",
    placa: "TC-TRUCK-06",
    modelo: "Scania R450",
    tipoCarga: "Tolva Minera",
    estado: "ralenti",
    estadoLabel: "Ralenti",
    conductor: "Andrés Rivas",
    turno: "Turno tarde",
    velocidadKmH: 6,
    caudalLh: 22,
    ultimoDatoSec: 18,
    desvioPct: 14.2,
    consumoDiaL: 185,
    rendimientoL100km: 40.8,
    horometroH: 6720,
    ralentiPct: 21.0,
    bateriaPct: 82,
    senalEstado: "OK",
    lat: -34.63,
    lng: -58.46,
    caudalHistorial: [
      { hora: "12:00", valor: 60 },
      { hora: "13:00", valor: 55 },
      { hora: "14:00", valor: 70 },
      { hora: "15:00", valor: 40 },
      { hora: "16:00", valor: 50 },
    ],
  },
  {
    id: "TC-TRUCK-09",
    placa: "TC-TRUCK-09",
    modelo: "Iveco Hi-Way",
    tipoCarga: "Cama Baja",
    estado: "operando",
    estadoLabel: "Operando",
    conductor: "Mateo Herrera",
    turno: "Turno tarde",
    velocidadKmH: 0,
    caudalLh: 285,
    ultimoDatoSec: 11,
    desvioPct: -4.5,
    consumoDiaL: 295,
    rendimientoL100km: 37.9,
    horometroH: 8200,
    ralentiPct: 9.8,
    bateriaPct: 86,
    senalEstado: "OK",
    lat: -34.6,
    lng: -58.43,
    caudalHistorial: [
      { hora: "12:00", valor: 280 },
      { hora: "13:00", valor: 300 },
      { hora: "14:00", valor: 290 },
      { hora: "15:00", valor: 275 },
      { hora: "16:00", valor: 285 },
    ],
  },
  {
    id: "TC-TRUCK-10",
    placa: "TC-TRUCK-10",
    modelo: "Mercedes Actros 2645",
    tipoCarga: "Cisterna Químicos",
    estado: "en_marcha",
    estadoLabel: "En marcha",
    conductor: "Pedro Castillo",
    turno: "Turno noche",
    velocidadKmH: 64,
    caudalLh: 125,
    ultimoDatoSec: 7,
    desvioPct: 3.9,
    consumoDiaL: 250,
    rendimientoL100km: 36.0,
    horometroH: 7450,
    ralentiPct: 12.8,
    bateriaPct: 90,
    senalEstado: "OK",
    lat: -34.55,
    lng: -58.465,
    caudalHistorial: [
      { hora: "12:00", valor: 280 },
      { hora: "13:00", valor: 310 },
      { hora: "14:00", valor: 295 },
      { hora: "15:00", valor: 260 },
      { hora: "16:00", valor: 300 },
    ],
  },
  {
    id: "TC-TRUCK-13",
    placa: "TC-TRUCK-13",
    modelo: "Volvo FMX 500",
    tipoCarga: "Tolva 8x4",
    estado: "sin_senal",
    estadoLabel: "Sin señal",
    conductor: "Gabriel Vega",
    turno: "Turno mañana",
    velocidadKmH: 0,
    caudalLh: 0,
    ultimoDatoSec: 900,
    desvioPct: 0,
    consumoDiaL: 120,
    rendimientoL100km: 37.5,
    horometroH: 5900,
    ralentiPct: 16.2,
    bateriaPct: 35,
    senalEstado: "DÉBIL",
    lat: -34.625,
    lng: -58.405,
    caudalHistorial: [
      { hora: "12:00", valor: 0 },
      { hora: "13:00", valor: 0 },
      { hora: "14:00", valor: 0 },
      { hora: "15:00", valor: 0 },
      { hora: "16:00", valor: 0 },
    ],
  },
  {
    id: "TC-TRUCK-14",
    placa: "TC-TRUCK-14",
    modelo: "Scania P360",
    tipoCarga: "Cisterna Agua",
    estado: "en_marcha",
    estadoLabel: "En marcha",
    conductor: "Esteban Quiroga",
    turno: "Turno mañana",
    velocidadKmH: 70,
    caudalLh: 132,
    ultimoDatoSec: 3,
    desvioPct: 1.5,
    consumoDiaL: 240,
    rendimientoL100km: 35.4,
    horometroH: 6890,
    ralentiPct: 11.5,
    bateriaPct: 93,
    senalEstado: "OK",
    lat: -34.57,
    lng: -58.445,
    caudalHistorial: [
      { hora: "12:00", valor: 270 },
      { hora: "13:00", valor: 300 },
      { hora: "14:00", valor: 290 },
      { hora: "15:00", valor: 275 },
      { hora: "16:00", valor: 310 },
    ],
  },
  {
    id: "TC-TRUCK-15",
    placa: "TC-TRUCK-15",
    modelo: "Mercedes Axor",
    tipoCarga: "Tolva 6x4",
    estado: "ralenti",
    estadoLabel: "Ralenti",
    conductor: "Lucas Benítez",
    turno: "Turno tarde",
    velocidadKmH: 5,
    caudalLh: 20,
    ultimoDatoSec: 25,
    desvioPct: 17.5,
    consumoDiaL: 200,
    rendimientoL100km: 41.2,
    horometroH: 7300,
    ralentiPct: 23.0,
    bateriaPct: 83,
    senalEstado: "OK",
    lat: -34.61,
    lng: -58.48,
    caudalHistorial: [
      { hora: "12:00", valor: 55 },
      { hora: "13:00", valor: 65 },
      { hora: "14:00", valor: 50 },
      { hora: "15:00", valor: 45 },
      { hora: "16:00", valor: 60 },
    ],
  },
];

// Helper colors
function getStatusColor(estado: CamionUnidad["estado"]) {
  switch (estado) {
    case "en_marcha":
      return "#0df5c6"; // Cyan Mint
    case "ralenti":
      return "#f59e0b"; // Orange/Amber
    case "operando":
      return "#3b82f6"; // Blue
    case "sin_senal":
    default:
      return "#64748b"; // Slate grey
  }
}

export function CamionesListaView({ empresa }: { empresa?: Empresa }) {
  const { id } = useParams(); // empresa id
  const empresaId = id || (empresa ? String(empresa.id) : "1");

  // User-registered custom units stored in local memory
  const [customUnits, setCustomUnits] = useState<CamionUnidad[]>(() => {
    try {
      const saved = localStorage.getItem("custom_unidades_transporte");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load trucks: consume directly from empresa.flota.maquinarias (matching FlotaHome!)
  const camionesList: CamionUnidad[] = useMemo(() => {
    const rawMaquinarias: any[] =
      empresa?.flota?.maquinarias && empresa.flota.maquinarias.length > 0
        ? empresa.flota.maquinarias
        : (empresa?.flota as any)?.camiones && (empresa?.flota as any).camiones.length > 0
        ? (empresa?.flota as any).camiones
        : [];

    const truckModels = [
      "Iveco S-Way",
      "Volvo FH 540",
      "Mercedes-Benz Actros",
      "Scania R500",
      "Volvo FMX 460",
      "Kenworth T800",
      "Scania G440",
      "MAN TGX 26.480",
    ];

    const cargoTypes = [
      "Cisterna 6x4",
      "Tolva Minera",
      "Tolva Granelera",
      "Sideral 28t",
      "Cisterna Criogénica",
      "Plataforma Forestal",
      "Semirremolque B-Double",
    ];

    let baseList: CamionUnidad[] = [];

    if (rawMaquinarias.length > 0) {
      baseList = rawMaquinarias.map((maq, idx) => {
        const idStr = String(maq.id || `c${idx + 1}`);
        const placaStr = String(maq.placa || idStr);

        let estadoMapped: CamionUnidad["estado"] = "en_marcha";
        if (maq.estado === "ralenti" || maq.estado === "revisar") estadoMapped = "ralenti";
        else if (maq.estado === "offline" || maq.estado === "sin_datos") estadoMapped = "sin_senal";
        else if (maq.estado === "operando") estadoMapped = "operando";

        const estadoLabels: Record<CamionUnidad["estado"], string> = {
          en_marcha: "En marcha",
          ralenti: "Ralentí",
          operando: "Operando",
          sin_senal: "Sin señal",
        };

        // Match with operador
        const op =
          operadoresData.find(
            (o) =>
              o.maquinariaId === idStr ||
              o.maquinariaId === placaStr ||
              (o.maquinariaId && idStr.includes(o.maquinariaId)) ||
              (o.maquinariaId && placaStr.includes(o.maquinariaId))
          ) || operadoresData[idx % operadoresData.length];

        const desvio = typeof maq.desvioPct === "number" ? maq.desvioPct : (idx % 2 === 0 ? 12.8 : 4.5);
        const l100 = typeof maq.l100km === "number" ? maq.l100km : 38.0;
        const ralenti = typeof maq.ralentiPct === "number" ? maq.ralentiPct : 14.7;
        const horas = typeof maq.horas === "number" ? maq.horas : 180 + idx * 25;
        const consumoL = typeof maq.litros === "number" ? Math.round(maq.litros / 10) : 240 + idx * 10;
        const velocidad = estadoMapped === "ralenti" ? 0 : estadoMapped === "sin_senal" ? 0 : 55 + ((idx * 7) % 30);
        const caudal = estadoMapped === "ralenti" ? 18 : estadoMapped === "sin_senal" ? 0 : 115 + ((idx * 13) % 65);

        const lat = maq.lat || (-34.588 + ((idx % 4) * 0.02) - ((idx % 3) * 0.015));
        const lng = maq.lng || (-58.41 - ((idx % 3) * 0.02) + ((idx % 2) * 0.012));

        return {
          id: idStr,
          placa: placaStr,
          modelo: maq.modelo || truckModels[idx % truckModels.length],
          tipoCarga: maq.tipoCarga || cargoTypes[idx % cargoTypes.length],
          estado: estadoMapped,
          estadoLabel: estadoLabels[estadoMapped] || "En marcha",
          conductor: op?.nombre || `Conductor ${idx + 1}`,
          legajo: op?.legajo || `001${23 + idx}`,
          base: op?.base || "EZEIZA",
          vencimientoLicencia: op?.vencimientoLicencia || "2027-04-15",
          conduccionBrusca: op?.conduccionBrusca ?? 2,
          viajes: op?.viajes ?? (35 + idx * 2),
          turno: idx % 2 === 0 ? "Turno mañana" : "Turno tarde",
          velocidadKmH: velocidad,
          caudalLh: caudal,
          ultimoDatoSec: idx * 3 + 4,
          desvioPct: desvio,
          consumoDiaL: consumoL,
          rendimientoL100km: l100,
          horometroH: horas,
          ralentiPct: ralenti,
          bateriaPct: 82 + ((idx * 5) % 17),
          senalEstado: estadoMapped === "sin_senal" ? "Débil" : "OK",
          lat,
          lng,
          caudalHistorial: [
            { hora: "12:00", valor: caudal + 15 },
            { hora: "12:30", valor: caudal - 10 },
            { hora: "13:00", valor: caudal + 5 },
            { hora: "13:30", valor: caudal + 25 },
            { hora: "14:00", valor: Math.max(caudal - 30, 20) },
            { hora: "14:30", valor: Math.max(caudal - 40, 15) },
            { hora: "15:00", valor: caudal },
            { hora: "15:30", valor: caudal + 20 },
            { hora: "16:00", valor: caudal + 10 },
          ],
        };
      });
    } else {
      // Default 15 trucks enriched with operators
      baseList = DEFAULT_CAMIONES.map((truck, idx) => {
        const op = operadoresData.find(
          (o) =>
            o.maquinariaId === truck.id ||
            o.maquinariaId === truck.placa ||
            (o.maquinariaId && truck.id.includes(o.maquinariaId))
        ) || operadoresData[idx % operadoresData.length];

        return {
          ...truck,
          conductor: op?.nombre || truck.conductor,
          legajo: op?.legajo || truck.legajo,
          turno: op?.atribucion ? `Turno ${op.atribucion.toLowerCase()}` : truck.turno,
          base: op?.base || truck.base,
          vencimientoLicencia: op?.vencimientoLicencia || truck.vencimientoLicencia,
          conduccionBrusca: op?.conduccionBrusca ?? truck.conduccionBrusca,
          viajes: op?.viajes ?? truck.viajes,
          horometroH: op?.kmPeriodo ? Math.round(op.kmPeriodo) : truck.horometroH,
          rendimientoL100km: op?.rendimientoBruto ?? truck.rendimientoL100km,
          ralentiPct: op?.ralentiImproductivo ?? truck.ralentiPct,
        };
      });
    }

    return [...customUnits, ...baseList];
  }, [empresa, customUnits]);

  // Selected Truck ID (Default to first truck in list or TC-TRUCK-08)
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (camionesList.length > 0) {
      if (!selectedId || !camionesList.some((c) => c.id === selectedId)) {
        setSelectedId(camionesList[0].id);
      }
    }
  }, [camionesList, selectedId]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterConductor, setFilterConductor] = useState<string>("todos");
  const [filterProducto, setFilterProducto] = useState<string>("todos");
  const [filterAlertas, setFilterAlertas] = useState<string>("todos");

  // Register Modal state (matching Wialon / fleet unit properties)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formNombre, setFormNombre] = useState("Nueva unidad");
  const [formTipoUnidad, setFormTipoUnidad] = useState("Camión");
  const [formTipoDispositivo, setFormTipoDispositivo] = useState("Teltonika FMB920");
  const [formDireccionServidor, setFormDireccionServidor] = useState("srv.edgesmart.io:20100");
  const [formIdUnico, setFormIdUnico] = useState("");
  const [formTelefonoCod, setFormTelefonoCod] = useState("+54 9 11");
  const [formTelefonoNum, setFormTelefonoNum] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formCreador, setFormCreador] = useState("rigel_teste_mgr");
  const [formCuenta] = useState("rigel_teste_mgr");

  // Contadores
  const [formKmFuente, setFormKmFuente] = useState("GPS");
  const [formKmValor, setFormKmValor] = useState("0");
  const [formKmAuto, setFormKmAuto] = useState(true);

  const [formHorasFuente, setFormHorasFuente] = useState("Sensor de ignición del motor");
  const [formHorasValor, setFormHorasValor] = useState("0");
  const [formHorasAuto, setFormHorasAuto] = useState(true);

  const [formGprsValor, setFormGprsValor] = useState("0");
  const [formGprsAuto, setFormGprsAuto] = useState(true);

  const [saveAlert, setSaveAlert] = useState(false);

  // Map state
  const [capaMapa, setCapaMapa] = useState<"mapa" | "satelite">("mapa");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vistaMovil, setVistaMovil] = useState<"unidades" | "mapa" | "detalle">("unidades");

  // Refs for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const geocercasLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filtered List
  const filteredCamiones = useMemo(() => {
    return camionesList.filter((c) => {
      const matchSearch =
        searchTerm === "" ||
        c.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.modelo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        filterEstado === "todos" || c.estado === filterEstado;
      const matchConductor =
        filterConductor === "todos" || c.conductor === filterConductor;
      const matchProducto =
        filterProducto === "todos" ||
        c.tipoCarga.toLowerCase().includes(filterProducto.toLowerCase());
      const matchAlertas =
        filterAlertas === "todos" ||
        (filterAlertas === "con_alerta" ? c.desvioPct > 10 : c.desvioPct <= 10);

      return matchSearch && matchEstado && matchConductor && matchProducto && matchAlertas;
    });
  }, [camionesList, searchTerm, filterEstado, filterConductor, filterProducto, filterAlertas]);

  // Active Truck Object
  const currentTruck = useMemo(() => {
    return (
      camionesList.find((c) => c.id === selectedId) ||
      camionesList[0] ||
      DEFAULT_CAMIONES[0]
    );
  }, [camionesList, selectedId]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ResizeObserver for responsive map resizing
  useEffect(() => {
    if (!mapWrapperRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    observer.observe(mapWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Invalidate map size and fly to current truck when mobile view changes to "mapa"
  useEffect(() => {
    if (vistaMovil === "mapa") {
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        if (currentTruck) {
          mapRef.current.flyTo([currentTruck.lat, currentTruck.lng], 13, {
            duration: 0.8,
          });
        }
      }, 100);
    }
  }, [vistaMovil, currentTruck]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapWrapperRef.current?.requestFullscreen().catch((err) => {
        console.error("Error al activar pantalla completa:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    // Centered on Buenos Aires just like in the screenshot
    map.setView([-34.588, -58.43], 12);
    L.control.zoom({ position: "topright" }).addTo(map);

    // Standard OpenStreetMap tiles matching Geocercas view
    const tile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = tile;

    // Layer group for geocercas matching GeocercasView
    const geocercasGroup = L.layerGroup().addTo(map);
    geocercasLayerGroupRef.current = geocercasGroup;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Geocercas on map
  useEffect(() => {
    const group = geocercasLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    const stored = getStoredGeocercas();
    stored.forEach((geo) => {
      if (!geo.activa) return;
      if (geo.tipo === "circle") {
        const circle = L.circle([geo.lat, geo.lng], {
          radius: geo.radio,
          color: geo.color,
          weight: 2,
          fillColor: geo.color,
          fillOpacity: 0.22,
        }).bindPopup(`<strong>${geo.nombre}</strong><br/>${geo.descripcion}`);
        group.addLayer(circle);
      }
    });
  }, []);

  // Layer toggle: Mapa (OpenStreetMap) vs Satélite (Esri) - exactly like Geocercas
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    mapRef.current.removeLayer(tileLayerRef.current);

    const url =
      capaMapa === "satelite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const attr =
      capaMapa === "satelite"
        ? "&copy; Esri &mdash; Source: Esri"
        : "&copy; OpenStreetMap contributors";

    const newTile = L.tileLayer(url, {
      attribution: attr,
      maxZoom: 19,
    }).addTo(mapRef.current);

    tileLayerRef.current = newTile;
  }, [capaMapa]);

  // Update Map Markers with custom pill badges
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    camionesList.forEach((truck) => {
      const isSelected = truck.id === selectedId;
      const statusColor = getStatusColor(truck.estado);

      // Custom capsule pill marker HTML matching the image
      const markerHtml = `
        <div style="
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 8px; border-radius: 9999px;
          background: rgba(13, 17, 23, 0.92);
          border: 1.5px solid ${isSelected ? "#0df5c6" : statusColor};
          box-shadow: ${
            isSelected
              ? "0 0 0 4px rgba(13,245,198,0.25), 0 0 16px rgba(13,245,198,0.7)"
              : "0 2px 8px rgba(0,0,0,0.6)"
          };
          cursor: pointer; transition: all 0.2s ease;
        ">
          <span style="
            width: 8px; height: 8px; border-radius: 50%;
            background: ${statusColor};
            box-shadow: 0 0 6px ${statusColor};
          "></span>
          <span style="
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif;
            font-size: 11px; font-weight: 700; color: #f8fafc;
            letter-spacing: 0.02em; white-space: nowrap;
          ">${truck.placa}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "",
        html: markerHtml,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });

      const marker = L.marker([truck.lat, truck.lng], { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          setSelectedId(truck.id);
        });

      markersRef.current[truck.id] = marker;
    });
  }, [camionesList, selectedId]);

  // Fly to selected truck
  useEffect(() => {
    if (!mapRef.current || !currentTruck) return;
    if (mapContainerRef.current && mapContainerRef.current.clientWidth > 0) {
      mapRef.current.invalidateSize();
      mapRef.current.flyTo([currentTruck.lat, currentTruck.lng], 13, {
        duration: 0.8,
      });
    }
  }, [selectedId, currentTruck]);

  // Register New Unit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    const newId = formIdUnico.trim() || `TC-TRK-${String(Date.now()).slice(-4)}`;
    const newTruck: CamionUnidad = {
      id: newId,
      placa: formNombre.trim(),
      modelo: formTipoUnidad || "Iveco S-Way",
      tipoCarga: formTipoUnidad.includes("Cisterna") ? "Cisterna 6x4" : "Carga General",
      estado: "en_marcha",
      estadoLabel: "En marcha",
      conductor: "Sin asignar",
      turno: "Turno mañana",
      velocidadKmH: 0,
      caudalLh: 0,
      ultimoDatoSec: 1,
      desvioPct: 0,
      consumoDiaL: 0,
      rendimientoL100km: 34.5,
      horometroH: Number(formHorasValor) || 0,
      ralentiPct: 0,
      bateriaPct: 100,
      senalEstado: "OK",
      lat: -34.588 + (Math.random() - 0.5) * 0.04,
      lng: -58.41 + (Math.random() - 0.5) * 0.04,
      caudalHistorial: [
        { hora: "12:00", valor: 0 },
        { hora: "13:00", valor: 0 },
        { hora: "14:00", valor: 0 },
        { hora: "15:00", valor: 0 },
        { hora: "16:00", valor: 0 },
      ],
    };

    const updated = [newTruck, ...customUnits];
    setCustomUnits(updated);
    try {
      localStorage.setItem("custom_unidades_transporte", JSON.stringify(updated));
    } catch (err) {
      console.error("Error guardando unidad:", err);
    }

    setSelectedId(newTruck.id);
    setIsModalOpen(false);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px] w-full overflow-hidden rounded-xl border border-white/10 bg-[#070b12] text-slate-200 font-sans shadow-2xl">
      {/* ─── TOP HEADER BAR ─── */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-white/10 bg-[#0c121d] px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top line on mobile: Title + Badge + Mobile Register button */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Transporte
            </h1>
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-xs font-semibold text-[#0df5c6]">
              {filteredCamiones.length} unidades
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] px-2.5 py-1 text-xs font-bold text-[#07131b] shadow-[0_0_12px_rgba(13,245,198,0.25)] transition"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Registrar</span>
            </button>
          </div>
        </div>

        {/* Search + Filter dropdowns + Mobile View Switcher */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-none md:max-w-2xl justify-start">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[140px] sm:min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar unidad, conductor..."
              className="w-full rounded-lg border border-white/10 bg-[#141b29] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#0df5c6] transition"
            />
          </div>

          {/* Filter: Estado */}
          <div className="relative">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Estado</option>
              <option value="en_marcha">En marcha</option>
              <option value="ralenti">Ralenti</option>
              <option value="operando">Operando</option>
              <option value="sin_senal">Sin señal</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter: Conductor */}
          <div className="relative hidden sm:block">
            <select
              value={filterConductor}
              onChange={(e) => setFilterConductor(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Conductor</option>
              {operadoresData.map((op) => (
                <option key={op.id} value={op.nombre}>
                  {op.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter: Producto */}
          <div className="relative hidden md:block">
            <select
              value={filterProducto}
              onChange={(e) => setFilterProducto(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Producto</option>
              <option value="Cisterna">Cisterna</option>
              <option value="Tolva">Tolva</option>
              <option value="Volquete">Volquete</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter: Con alertas */}
          <div className="relative hidden lg:block">
            <select
              value={filterAlertas}
              onChange={(e) => setFilterAlertas(e.target.value)}
              className="appearance-none rounded-lg border border-white/10 bg-[#141b29] px-2.5 py-1.5 pr-7 text-xs text-slate-300 outline-none focus:border-[#0df5c6] cursor-pointer"
            >
              <option value="todos">Alertas</option>
              <option value="con_alerta">Desvío &gt; 10%</option>
              <option value="sin_alerta">Normal</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

        </div>

        {/* Right Primary Action on Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {saveAlert && (
            <span className="text-xs text-[#0df5c6] font-medium animate-fade-in flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Unidad registrada
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] px-3.5 py-1.5 text-xs font-bold text-[#07131b] shadow-[0_0_15px_rgba(13,245,198,0.3)] transition"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Registrar unidad
          </button>
        </div>
      </header>

      {/* ─── DEDICATED MOBILE VIEW SWITCHER BAR (< xl) ─── */}
      <div className="xl:hidden flex items-center bg-[#0a0f19] border-b border-white/10 p-2 gap-2 shrink-0 z-30">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVistaMovil("unidades")}
          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 active:scale-95 ${
            vistaMovil === "unidades"
              ? "bg-[#0df5c6] text-[#07131b] shadow-md"
              : "bg-[#141b29] text-slate-300 hover:text-white"
          }`}
        >
          <span>Unidades</span>
          <span className="text-[10px] opacity-80 font-mono">({filteredCamiones.length})</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVistaMovil("mapa")}
          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 active:scale-95 ${
            vistaMovil === "mapa"
              ? "bg-[#0df5c6] text-[#07131b] shadow-md"
              : "bg-[#141b29] text-slate-300 hover:text-white"
          }`}
        >
          <span>Mapa</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setVistaMovil("detalle")}
          className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition text-center flex items-center justify-center gap-1 active:scale-95 truncate ${
            vistaMovil === "detalle"
              ? "bg-[#0df5c6] text-[#07131b] shadow-md"
              : "bg-[#141b29] text-slate-300 hover:text-white"
          }`}
        >
          <span>Detalle</span>
          {currentTruck && <span className="text-[10px] opacity-80 truncate hidden xs:inline">({currentTruck.placa})</span>}
        </button>
      </div>

      {/* ─── 3-COLUMN MAIN BODY ─── */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
        {/* ─── COLUMN 1: LEFT LIST OF UNITS ─── */}
        <aside
          className={`w-full xl:w-[280px] shrink-0 border-r border-white/10 bg-[#090e18] flex flex-col h-full overflow-hidden ${
            vistaMovil === "unidades" ? "flex" : "hidden xl:flex"
          }`}
        >
          <div className="shrink-0 px-3 py-2.5 border-b border-white/10 text-xs font-semibold text-slate-400 flex items-center justify-between">
            <span>Unidades ({filteredCamiones.length})</span>
            <span className="text-[10px] text-slate-500 xl:hidden">Toca para centrar en el mapa</span>
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scroll divide-y divide-white/[0.04]">
            {filteredCamiones.map((truck) => {
              const isSelected = truck.id === selectedId;
              const statusColor = getStatusColor(truck.estado);
              const isPositive = truck.desvioPct >= 0;

              return (
                <div
                  key={truck.id}
                  onClick={() => {
                    setSelectedId(truck.id);
                    setVistaMovil("mapa");
                  }}
                  className={`p-3 cursor-pointer transition relative ${
                    isSelected
                      ? "bg-[#111c2e] border-l-4 border-[#0df5c6]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Top line: Status Dot + Placa + Percentage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: statusColor,
                          boxShadow: `0 0 6px ${statusColor}`,
                        }}
                      />
                      <span className="text-xs font-bold text-white tracking-wide">
                        {truck.placa}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-mono font-semibold ${
                        truck.desvioPct === 0
                          ? "text-slate-500"
                          : isPositive
                          ? "text-[#fbbf24]"
                          : "text-[#0df5c6]"
                      }`}
                    >
                      {truck.desvioPct === 0
                        ? "—"
                        : `${isPositive ? "+" : ""}${truck.desvioPct.toFixed(1).replace(".", ",")} %`}
                    </span>
                  </div>

                  {/* Second line: Status Label */}
                  <div
                    className="mt-0.5 text-[11px] font-medium"
                    style={{ color: statusColor }}
                  >
                    {truck.estadoLabel}
                  </div>

                  {/* Third line: Driver Name */}
                  <div className="text-[11px] text-slate-300 truncate">
                    {truck.conductor}
                  </div>

                  {/* Fourth line: Metrics summary */}
                  <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
                    {truck.estado === "sin_senal" ? (
                      `--- km/h • --- L/h • ${Math.round(truck.ultimoDatoSec / 60)} min`
                    ) : (
                      `${truck.velocidadKmH} km/h • ${truck.caudalLh} L/h • ${truck.ultimoDatoSec} s`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ─── COLUMN 2: MIDDLE MAP ─── */}
        <div
          ref={mapWrapperRef}
          className={`flex-1 relative h-full w-full bg-[#050911] overflow-hidden ${
            isFullscreen ? "fixed inset-0 z-[99999]" : ""
          } ${
            vistaMovil === "mapa" ? "flex" : "hidden xl:flex"
          }`}
        >
          {/* Map Controls Top Right */}
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-[1000] flex items-center gap-2"
          >
            {/* Mapa | Satélite Pill */}
            <div className="flex items-center rounded-lg bg-[#0d1422]/90 border border-white/15 p-0.5 shadow-xl backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setCapaMapa("mapa")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  capaMapa === "mapa"
                    ? "bg-[#0df5c6] text-[#07131b] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Mapa
              </button>
              <button
                type="button"
                onClick={() => setCapaMapa("satelite")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  capaMapa === "satelite"
                    ? "bg-[#0df5c6] text-[#07131b] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Satélite
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              className="p-1.5 rounded-lg bg-[#0d1422]/90 border border-white/15 text-slate-300 hover:text-[#0df5c6] shadow-xl backdrop-blur-sm transition"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Floating Bottom Legend (desktop only, to not overlap mobile bottom card) */}
          <div className="hidden xl:flex absolute bottom-4 left-4 z-[1000] items-center gap-4 px-3.5 py-1.5 rounded-full bg-[#0d1422]/90 border border-white/10 shadow-2xl backdrop-blur-md text-[11px] font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0df5c6] shadow-[0_0_6px_#0df5c6]" />
              En marcha
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]" />
              Ralenti
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_#3b82f6]" />
              Operando
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#64748b]" />
              Sin señal
            </span>
          </div>

          {/* Scale Legend bottom right (desktop only) */}
          <div className="hidden xl:flex absolute bottom-4 right-4 z-[1000] items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/50 px-2 py-0.5 rounded border border-white/10">
            <span className="w-8 border-b-2 border-slate-400 inline-block mr-1" />
            10 km
          </div>

          {/* Mobile Selected Truck Bottom Floating Card (< xl) */}
          {vistaMovil === "mapa" && currentTruck && (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="xl:hidden absolute bottom-3 left-3 right-3 z-[1000] rounded-xl border border-white/15 bg-[#0c121d]/95 backdrop-blur-md p-3 shadow-2xl animate-fade-in flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: getStatusColor(currentTruck.estado),
                      boxShadow: `0 0 8px ${getStatusColor(currentTruck.estado)}`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide truncate">
                        {currentTruck.placa}
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          color: getStatusColor(currentTruck.estado),
                          backgroundColor: `${getStatusColor(currentTruck.estado)}20`,
                        }}
                      >
                        {currentTruck.estadoLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {currentTruck.conductor} • {currentTruck.modelo}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setVistaMovil("detalle")}
                  className="shrink-0 flex items-center gap-1 rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] px-3 py-1.5 text-xs font-bold text-[#07131b] transition shadow"
                >
                  <span>Ver detalle</span>
                  <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick Metrics Bar inside the card on mobile */}
              <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-white/10 text-center">
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Vel.</span>
                  <span className="text-[11px] font-bold text-white font-mono">{currentTruck.velocidadKmH} <span className="text-[8px] text-slate-400">km/h</span></span>
                </div>
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Caudal</span>
                  <span className="text-[11px] font-bold text-white font-mono">{currentTruck.caudalLh} <span className="text-[8px] text-slate-400">L/h</span></span>
                </div>
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Consumo</span>
                  <span className="text-[11px] font-bold text-white font-mono">{currentTruck.consumoDiaL} <span className="text-[8px] text-slate-400">L</span></span>
                </div>
                <div className="bg-[#121926] rounded px-1 py-0.5">
                  <span className="text-[8px] uppercase text-slate-400 block">Desvío</span>
                  <span className={`text-[11px] font-bold font-mono ${currentTruck.desvioPct >= 0 ? "text-[#fbbf24]" : "text-[#0df5c6]"}`}>
                    {currentTruck.desvioPct > 0 ? `+${currentTruck.desvioPct}%` : `${currentTruck.desvioPct}%`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div ref={mapContainerRef} className="h-full w-full bg-[#050911]" />
        </div>

        {/* ─── COLUMN 3: RIGHT UNIT DETAIL PANEL ─── */}
        <aside
          className={`w-full xl:w-[340px] shrink-0 border-l border-white/10 bg-[#090e18] flex flex-col h-full overflow-y-auto sidebar-scroll ${
            vistaMovil === "detalle" ? "flex" : "hidden xl:flex"
          }`}
        >
          {/* Mobile Back Bar (< xl) */}
          <div className="p-3 border-b border-white/10 flex xl:hidden items-center justify-between bg-[#0e1624]">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setVistaMovil("mapa")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0df5c6] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Volver al mapa</span>
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setVistaMovil("unidades")}
              className="text-xs text-slate-400 hover:text-white"
            >
              Ver todas las unidades
            </button>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-white/10 relative">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {currentTruck.placa}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentTruck.modelo} • {currentTruck.tipoCarga}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                  style={{
                    color: getStatusColor(currentTruck.estado),
                    borderColor: `${getStatusColor(currentTruck.estado)}44`,
                    backgroundColor: `${getStatusColor(currentTruck.estado)}15`,
                  }}
                >
                  {currentTruck.estadoLabel.toUpperCase()}
                </span>
                <button
                  type="button"
                  title="Cerrar detalle"
                  onClick={() => {
                    setSelectedId("");
                    setVistaMovil("mapa");
                  }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Driver Profile Card */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#121926] p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-[#0df5c6] font-bold text-sm">
                  {currentTruck.conductor ? currentTruck.conductor.charAt(0) : <User className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                    <span>{currentTruck.conductor}</span>
                    {currentTruck.legajo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                        Leg. {currentTruck.legajo}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <span>{currentTruck.turno}</span>
                    {currentTruck.base && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{currentTruck.base}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6 Key Metric Indicators */}
          <div className="p-4 border-b border-white/10 grid grid-cols-3 gap-3">
            {/* VELOCIDAD */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Velocidad
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {currentTruck.velocidadKmH}
                </span>
                <span className="text-[11px] text-slate-400">km/h</span>
              </div>
            </div>

            {/* CAUDAL */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Caudal
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {currentTruck.caudalLh}
                </span>
                <span className="text-[11px] text-slate-400">L/h</span>
              </div>
            </div>

            {/* CONSUMO DEL DÍA */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Consumo del día
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {currentTruck.consumoDiaL}
                </span>
                <span className="text-[11px] text-slate-400">L</span>
              </div>
            </div>

            {/* RENDIMIENTO */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Rendimiento
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentTruck.rendimientoL100km.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-[10px] text-slate-400">L/100 km</span>
              </div>
            </div>

            {/* HORÓMETRO */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Horómetro
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentTruck.horometroH.toLocaleString("es-AR")}
                </span>
                <span className="text-[11px] text-slate-400">h</span>
              </div>
            </div>

            {/* RALENTÍ DEL DÍA */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Ralentí del día
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {currentTruck.ralentiPct.toFixed(1).replace(".", ",")}
                </span>
                <span className="text-[11px] text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Smooth Fuel Flow Area Chart (Caudal de combustible) */}
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              Caudal de combustible (últimas 4 horas)
            </h3>

            <div className="relative w-full h-32 mt-2">
              {/* SVG Area Chart */}
              <svg
                viewBox="0 0 300 100"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0df5c6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0df5c6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />

                {/* Y Ticks labels */}
                <text x="5" y="18" fill="#64748b" fontSize="8" fontFamily="monospace">600</text>
                <text x="5" y="48" fill="#64748b" fontSize="8" fontFamily="monospace">400</text>
                <text x="5" y="78" fill="#64748b" fontSize="8" fontFamily="monospace">200</text>
                <text x="5" y="98" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>

                {/* Path Area */}
                <path
                  d="M 25 60 Q 60 40, 95 65 T 160 55 T 225 80 T 290 55 L 290 100 L 25 100 Z"
                  fill="url(#cyanGradient)"
                />

                {/* Path Stroke Line */}
                <path
                  d="M 25 60 Q 60 40, 95 65 T 160 55 T 225 80 T 290 55"
                  fill="none"
                  stroke="#0df5c6"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {/* X Time Labels */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
                <span>12:00</span>
                <span>13:00</span>
                <span>14:00</span>
                <span>15:00</span>
                <span>16:00</span>
              </div>
            </div>
          </div>

          {/* Equipment Status: Estado del equipo */}
          <div className="p-4 border-b border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 block mb-3">
              Estado del equipo
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Batería */}
              <div className="rounded-lg bg-[#111827] border border-white/5 p-2">
                <div className="flex justify-center text-emerald-400 mb-1">
                  <Battery className="h-4 w-4" />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Batería
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currentTruck.bateriaPct} %
                </span>
              </div>

              {/* Señal */}
              <div className="rounded-lg bg-[#111827] border border-white/5 p-2">
                <div className="flex justify-center text-cyan-400 mb-1">
                  <Signal className="h-4 w-4" />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Señal
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currentTruck.senalEstado}
                </span>
              </div>

              {/* Último dato */}
              <div className="rounded-lg bg-[#111827] border border-white/5 p-2">
                <div className="flex justify-center text-slate-400 mb-1">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                  Último dato
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {currentTruck.estado === "sin_senal"
                    ? `${Math.round(currentTruck.ultimoDatoSec / 60)} min`
                    : `${currentTruck.ultimoDatoSec} s`}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="p-4 mt-auto space-y-2">
            <Link
              to={`/empresa/${empresaId}/camiones-detalle?camionId=${encodeURIComponent(currentTruck.id)}`}
              className="flex w-full items-center justify-center rounded-lg bg-[#0df5c6] hover:bg-[#0bdba0] py-2.5 text-xs font-bold text-[#07131b] shadow-[0_0_15px_rgba(13,245,198,0.25)] transition"
            >
              Ver ficha completa
            </Link>

            <button
              type="button"
              onClick={() => alert(`Visualizando recorrido histórico para ${currentTruck.placa}...`)}
              className="flex w-full items-center justify-center rounded-lg border border-white/15 bg-[#121926] hover:bg-[#1a2335] py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              Ver recorrido
            </button>
          </div>
        </aside>
      </div>

      {/* ─── MODAL: PROPIEDADES DE LA UNIDAD / REGISTRAR UNIDAD ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0c121d] p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto sidebar-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Propiedades de la unidad
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              {/* Row 1: Nombre: * */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Nombre: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] transition"
                  placeholder="Nueva unidad"
                />
              </div>

              {/* Row 2: Tipo de unidad: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Tipo de unidad:
                </label>
                <div className="relative w-full sm:flex-1">
                  <select
                    value={formTipoUnidad}
                    onChange={(e) => setFormTipoUnidad(e.target.value)}
                    className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 pr-8 text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                  >
                    <option value="Camión">Camión</option>
                    <option value="Cisterna 6x4">Cisterna 6x4</option>
                    <option value="Tolva Minera">Tolva Minera</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Maquinaria Pesada">Maquinaria Pesada</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Row 3: Tipo de dispositivo: * + Wrench icon */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Tipo de dispositivo: <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2 w-full sm:flex-1">
                  <div className="relative flex-1">
                    <select
                      value={formTipoDispositivo}
                      onChange={(e) => setFormTipoDispositivo(e.target.value)}
                      className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 pr-8 text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                    >
                      <option value="Teltonika FMB920">Teltonika FMB920</option>
                      <option value="Teltonika FMB120">Teltonika FMB120</option>
                      <option value="Queclink GV300">Queclink GV300</option>
                      <option value="DFM 250D Flowmeter">DFM 250D Flowmeter</option>
                      <option value="Suntech ST310U">Suntech ST310U</option>
                      <option value="Ruptela PRO4">Ruptela PRO4</option>
                      <option value="CalAmp LMU-3030">CalAmp LMU-3030</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    title="Configurar dispositivo"
                    className="p-1.5 rounded border border-white/15 bg-[#162235] text-slate-400 hover:text-[#0df5c6] transition shrink-0"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 4: Dirección del servidor: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Dirección del servidor:
                </label>
                <input
                  type="text"
                  value={formDireccionServidor}
                  onChange={(e) => setFormDireccionServidor(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="srv.edgesmart.io:20100"
                />
              </div>

              {/* Row 5: ID único: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  ID único:
                </label>
                <input
                  type="text"
                  value={formIdUnico}
                  onChange={(e) => setFormIdUnico(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="IMEI / MAC / ID de unidad"
                />
              </div>

              {/* Row 6: Número de teléfono: (2 inputs) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Número de teléfono:
                </label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:flex-1">
                  <input
                    type="text"
                    value={formTelefonoCod}
                    onChange={(e) => setFormTelefonoCod(e.target.value)}
                    className="w-28 sm:w-32 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                    placeholder="+54 9 11"
                  />
                  <input
                    type="text"
                    value={formTelefonoNum}
                    onChange={(e) => setFormTelefonoNum(e.target.value)}
                    className="flex-1 min-w-[140px] rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>

              {/* Row 7: Contraseña: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Contraseña:
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full sm:flex-1 rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 text-white outline-none focus:border-[#0df5c6] font-mono transition"
                  placeholder="••••••••"
                />
              </div>

              {/* Row 8: Creador: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Creador:
                </label>
                <div className="relative w-full sm:flex-1">
                  <select
                    value={formCreador}
                    onChange={(e) => setFormCreador(e.target.value)}
                    className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2.5 py-1.5 pr-8 text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                  >
                    <option value="rigel_teste_mgr">rigel_teste_mgr</option>
                    <option value="admin_general">admin_general</option>
                    <option value="supervisor_flota">supervisor_flota</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Row 9: Cuenta: */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <label className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                  Cuenta:
                </label>
                <input
                  type="text"
                  value={formCuenta}
                  disabled
                  className="w-full sm:flex-1 rounded border border-white/5 bg-[#090e18] px-2.5 py-1.5 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>

              {/* ─── COUNTERS SECTION ─── */}
              <div className="border-t border-white/10 pt-3 space-y-3 mt-4">
                {/* Contador de kilometraje */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                    Contador de kilometraje:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
                    <div className="relative w-full sm:w-44">
                      <select
                        value={formKmFuente}
                        onChange={(e) => setFormKmFuente(e.target.value)}
                        className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2 py-1 pr-6 text-xs text-white outline-none focus:border-[#0df5c6] cursor-pointer"
                      >
                        <option value="GPS">GPS</option>
                        <option value="Sensor de kilometraje">Sensor de kilometraje</option>
                        <option value="CAN Bus / FMS">CAN Bus / FMS</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">
                      Valor actual: <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="number"
                      value={formKmValor}
                      onChange={(e) => setFormKmValor(e.target.value)}
                      className="w-20 rounded border border-white/15 bg-[#121927] px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#0df5c6]"
                    />
                    <span className="text-slate-400 font-mono">km</span>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer ml-1 sm:ml-3">
                      <input
                        type="checkbox"
                        checked={formKmAuto}
                        onChange={(e) => setFormKmAuto(e.target.checked)}
                        className="rounded accent-[#0df5c6] cursor-pointer"
                      />
                      Automático
                    </label>
                  </div>
                </div>

                {/* Contador de horas de motor */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                    Contador de horas de motor:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
                    <div className="relative w-full sm:w-44">
                      <select
                        value={formHorasFuente}
                        onChange={(e) => setFormHorasFuente(e.target.value)}
                        className="w-full appearance-none rounded border border-white/15 bg-[#121927] px-2 py-1 pr-6 text-xs text-white truncate outline-none focus:border-[#0df5c6] cursor-pointer"
                      >
                        <option value="Sensor de ignición del motor">Sensor de ignición del mot...</option>
                        <option value="Sensor de vibración">Sensor de vibración</option>
                        <option value="Horómetro CAN Bus">Horómetro CAN Bus</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">
                      Valor actual: <span className="text-red-400">*</span>
                    </span>
                    <input
                      type="number"
                      value={formHorasValor}
                      onChange={(e) => setFormHorasValor(e.target.value)}
                      className="w-20 rounded border border-white/15 bg-[#121927] px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#0df5c6]"
                    />
                    <span className="text-slate-400 font-mono">h</span>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer ml-1 sm:ml-3">
                      <input
                        type="checkbox"
                        checked={formHorasAuto}
                        onChange={(e) => setFormHorasAuto(e.target.checked)}
                        className="rounded accent-[#0df5c6] cursor-pointer"
                      />
                      Automático
                    </label>
                  </div>
                </div>

                {/* Contador del tráfico GPRS */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-full sm:w-44 text-left sm:text-right text-slate-300 font-medium shrink-0">
                    Contador del tráfico GPRS:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:flex-1">
                    <button
                      type="button"
                      onClick={() => setFormGprsValor("0")}
                      className="w-full sm:w-44 rounded border border-white/15 bg-[#162235] hover:bg-[#1d2d46] px-2 py-1 text-xs text-slate-200 transition font-medium text-center"
                    >
                      Reiniciar contador
                    </button>
                    <span className="text-slate-400">
                      Valor actual:
                    </span>
                    <input
                      type="number"
                      value={formGprsValor}
                      onChange={(e) => setFormGprsValor(e.target.value)}
                      className="w-20 rounded border border-white/15 bg-[#121927] px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#0df5c6]"
                    />
                    <span className="text-slate-400 font-mono">KB</span>
                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer ml-1 sm:ml-3">
                      <input
                        type="checkbox"
                        checked={formGprsAuto}
                        onChange={(e) => setFormGprsAuto(e.target.checked)}
                        className="rounded accent-[#0df5c6] cursor-pointer"
                      />
                      Automático
                    </label>
                  </div>
                </div>
              </div>

              {/* ─── FOOTER ACTIONS ─── */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/10 mt-4">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Propiedades exportadas en formato JSON / Wialon.")}
                    className="flex-1 sm:flex-initial rounded border border-white/15 bg-[#141d2d] hover:bg-[#1c283d] px-3 py-1.5 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>Exportar propiedades</span>
                  </button>
                  <div
                    title="Información y configuración avanzada de la unidad"
                    className="text-amber-400 hover:text-amber-300 cursor-help transition p-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-initial rounded border border-white/15 bg-transparent hover:bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial rounded bg-[#0df5c6] hover:bg-[#0bdba0] px-6 py-1.5 text-xs font-bold text-[#07131b] shadow-[0_0_12px_rgba(13,245,198,0.3)] transition text-center"
                  >
                    OK
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
