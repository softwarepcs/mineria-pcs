import { useEffect, useState } from "react";
import { ClipboardPaste, Plus, X } from "lucide-react";
import { latValida, lngValida, parsearCoordenadas, parsearNumero, type LatLng } from "@/shared/utils/geometria";

const claseInput = "w-full min-w-0 rounded border bg-[#161b22] px-2 py-1 font-mono text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400";

/**
 * Campo numérico que acepta texto a medias («-12.», «-») sin perderlo: solo avisa al padre
 * cuando el valor ya es un número dentro de rango. Si el valor cambia desde fuera
 * (clic en el mapa, otra fila) se reescribe.
 */
function CampoCoord({ valor, onValido, etiqueta, esValido, placeholder }: { valor: number | null; onValido: (n: number) => void; etiqueta: string; esValido: (n: number) => boolean; placeholder: string }) {
  const [texto, setTexto] = useState(valor === null ? "" : String(valor));

  useEffect(() => {
    setTexto((t) => (valor === null ? (parsearNumero(t) === null ? t : "") : parsearNumero(t) === valor ? t : String(valor)));
  }, [valor]);

  const n = parsearNumero(texto);
  const invalido = texto.trim() !== "" && (n === null || !esValido(n));

  return (
    <input
      aria-label={etiqueta}
      aria-invalid={invalido}
      inputMode="decimal"
      value={texto}
      placeholder={placeholder}
      onChange={(e) => {
        setTexto(e.target.value);
        const v = parsearNumero(e.target.value);
        if (v !== null && esValido(v)) onValido(v);
      }}
      className={`${claseInput} ${invalido ? "border-red-500/70" : "border-white/15"}`}
    />
  );
}

const Encabezado = () => (
  <div className="grid grid-cols-[1.5rem_1fr_1fr_1.25rem] gap-1.5 px-0.5 text-[10px] uppercase tracking-wider text-slate-500">
    <span />
    <span>Latitud</span>
    <span>Longitud</span>
    <span />
  </div>
);

/** Ayuda breve y fija: de dónde sacar las coordenadas y en qué orden. */
const Ayuda = () => (
  <p className="text-[10px] leading-snug text-slate-500">
    Orden: <strong className="text-slate-300">latitud, longitud</strong> en grados decimales (Perú: latitud ≈ −3 a −18, longitud ≈ −68 a −81). En Google Maps, clic derecho sobre un punto copia ese par.
  </p>
);

export function CoordenadasCirculo({ centro, onCentro }: { centro: LatLng | null; onCentro: (p: LatLng) => void }) {
  const [pegado, setPegado] = useState("");
  const [errorPegado, setErrorPegado] = useState<string | null>(null);

  const alPegar = (texto: string) => {
    setPegado(texto);
    if (!texto.trim()) return setErrorPegado(null);
    const r = parsearCoordenadas(texto);
    if (r.errores.length || r.puntos.length !== 1) return setErrorPegado(r.errores[0] ?? "Escribe un solo par: latitud, longitud.");
    setErrorPegado(null);
    onCentro(r.puntos[0]);
  };

  return (
    <div className="space-y-1.5">
      <Encabezado />
      <div className="grid grid-cols-[1.5rem_1fr_1fr_1.25rem] items-center gap-1.5">
        <span className="text-[10px] text-slate-500">C</span>
        <CampoCoord valor={centro?.[0] ?? null} etiqueta="Latitud del centro" placeholder="-12.046374" esValido={latValida} onValido={(lat) => onCentro([lat, centro?.[1] ?? 0])} />
        <CampoCoord valor={centro?.[1] ?? null} etiqueta="Longitud del centro" placeholder="-77.042793" esValido={lngValida} onValido={(lng) => onCentro([centro?.[0] ?? 0, lng])} />
        <span />
      </div>
      <input
        aria-label="Pegar coordenada del centro"
        value={pegado}
        onChange={(e) => alPegar(e.target.value)}
        placeholder="…o pega «lat, lng» de Google Maps"
        className={`${claseInput} ${errorPegado ? "border-red-500/70" : "border-white/15"}`}
      />
      {errorPegado && <p className="text-[11px] text-amber-400">{errorPegado}</p>}
      <Ayuda />
    </div>
  );
}

export function CoordenadasPoligono({
  puntos,
  onPunto,
  onQuitar,
  onAgregar,
  onReemplazar,
}: {
  puntos: LatLng[];
  onPunto: (i: number, p: LatLng) => void;
  onQuitar: (i: number) => void;
  onAgregar: (p: LatLng) => void;
  onReemplazar: (puntos: LatLng[], anadir: boolean) => void;
}) {
  const [nuevoLat, setNuevoLat] = useState("");
  const [nuevoLng, setNuevoLng] = useState("");
  const [pegando, setPegando] = useState(false);
  const [texto, setTexto] = useState("");
  const lat = parsearNumero(nuevoLat);
  const lng = parsearNumero(nuevoLng);
  const nuevoOk = lat !== null && lng !== null && latValida(lat) && lngValida(lng);

  const resultado = texto.trim() ? parsearCoordenadas(texto) : null;
  const puedeAplicar = !!resultado && resultado.errores.length === 0 && resultado.puntos.length > 0;

  const agregarNuevo = () => {
    if (!nuevoOk) return;
    onAgregar([lat, lng]);
    setNuevoLat("");
    setNuevoLng("");
  };
  const alEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarNuevo();
    }
  };
  const aplicar = (anadir: boolean) => {
    if (!resultado || !puedeAplicar) return;
    onReemplazar(resultado.puntos, anadir);
    setTexto("");
    setPegando(false);
  };

  return (
    <div className="space-y-1.5">
      {puntos.length > 0 && <Encabezado />}
      {puntos.map((p, i) => (
        <div key={i} className="grid grid-cols-[1.5rem_1fr_1fr_1.25rem] items-center gap-1.5">
          <span className="text-center font-mono text-[10px] text-slate-500">{i + 1}</span>
          <CampoCoord valor={p[0]} etiqueta={`Latitud del vértice ${i + 1}`} placeholder="lat" esValido={latValida} onValido={(v) => onPunto(i, [v, p[1]])} />
          <CampoCoord valor={p[1]} etiqueta={`Longitud del vértice ${i + 1}`} placeholder="lng" esValido={lngValida} onValido={(v) => onPunto(i, [p[0], v])} />
          <button type="button" aria-label={`Quitar vértice ${i + 1}`} onClick={() => onQuitar(i)} className="text-slate-500 hover:text-red-400">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* Fila para añadir un vértice nuevo: solo se agrega cuando es válido */}
      <div className="grid grid-cols-[1.5rem_1fr_1fr_1.25rem] items-center gap-1.5">
        <span className="text-center font-mono text-[10px] text-slate-600">+</span>
        <input aria-label="Latitud del nuevo vértice" inputMode="decimal" value={nuevoLat} onChange={(e) => setNuevoLat(e.target.value)} onKeyDown={alEnter} placeholder="lat" className={`${claseInput} border-white/15`} />
        <input aria-label="Longitud del nuevo vértice" inputMode="decimal" value={nuevoLng} onChange={(e) => setNuevoLng(e.target.value)} onKeyDown={alEnter} placeholder="lng" className={`${claseInput} border-white/15`} />
        <button type="button" aria-label="Agregar vértice" disabled={!nuevoOk} onClick={agregarNuevo} className="text-cyan-300 hover:text-white disabled:opacity-30">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <button type="button" onClick={() => setPegando((v) => !v)} aria-expanded={pegando} className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-white">
        <ClipboardPaste className="h-3.5 w-3.5" /> Pegar lista de coordenadas
      </button>
      {pegando && (
        <div className="space-y-1.5 rounded border border-white/10 bg-[#0b0f17] p-2">
          <textarea
            aria-label="Lista de coordenadas"
            rows={5}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={"Una por línea: latitud, longitud\n-12.046374, -77.042793\n-12.047100, -77.040200\n-12.049800, -77.041500"}
            className={`${claseInput} resize-y ${resultado?.errores.length ? "border-red-500/70" : "border-white/15"}`}
          />
          {resultado?.errores.map((e) => (
            <p key={e} className="text-[11px] text-amber-400">{e}</p>
          ))}
          {puedeAplicar && <p className="text-[11px] text-emerald-400">{resultado.puntos.length} vértice{resultado.puntos.length === 1 ? "" : "s"} válido{resultado.puntos.length === 1 ? "" : "s"}.</p>}
          <div className="flex gap-2">
            <button type="button" disabled={!puedeAplicar} onClick={() => aplicar(false)} className="rounded bg-cyan-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-cyan-500 disabled:opacity-40">
              Reemplazar vértices
            </button>
            <button type="button" disabled={!puedeAplicar} onClick={() => aplicar(true)} className="rounded border border-white/15 px-2.5 py-1 text-[11px] text-slate-200 hover:bg-white/5 disabled:opacity-40">
              Añadir al final
            </button>
          </div>
        </div>
      )}
      <Ayuda />
    </div>
  );
}
