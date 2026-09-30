import { useId } from "react";

export interface Serie {
  nombre: string;
  color: string;
  /** null = sin dato en ese punto (la línea se corta). */
  valores: (number | null)[];
}

interface Props {
  series: Serie[];
  etiquetasX: string[];
  alto?: number;
  unidad?: string;
  /** Línea horizontal de referencia (p. ej. objetivo o umbral). */
  referencia?: { valor: number; etiqueta: string };
  /** Índice de X a resaltar con una línea vertical (p. ej. momento de una alerta). */
  marcaX?: { indice: number; etiqueta: string };
}

/**
 * Gráfico de líneas SVG sin dependencias. Reemplaza a los gráficos hechos a mano
 * de Alertas, Camiones y Operadores: ejes, escala y cortes por dato faltante en un solo lugar.
 */
export function GraficoLinea({ series, etiquetasX, alto = 120, unidad, referencia, marcaX }: Props) {
  const idGrad = useId();
  const W = 600;
  const pad = { top: 8, bottom: 18, left: 34, right: 6 };
  const H = alto;
  const graphW = W - pad.left - pad.right;
  const graphH = H - pad.top - pad.bottom;
  const n = Math.max(etiquetasX.length, ...series.map((s) => s.valores.length));

  const todos = series.flatMap((s) => s.valores.filter((v): v is number => v !== null));
  if (referencia) todos.push(referencia.valor);
  if (todos.length === 0 || n === 0) {
    return <div className="flex items-center justify-center rounded border border-dashed border-white/10 text-xs text-slate-500" style={{ height: H }}>Sin datos en el período</div>;
  }
  const max = Math.max(...todos) * 1.1 || 1;
  const min = Math.min(0, ...todos);
  const x = (i: number) => pad.left + (n <= 1 ? graphW / 2 : (i / (n - 1)) * graphW);
  const y = (v: number) => pad.top + graphH - ((v - min) / (max - min)) * graphH;

  const trazo = (valores: (number | null)[]) => {
    let d = "";
    let abierto = false;
    valores.forEach((v, i) => {
      if (v === null) { abierto = false; return; }
      d += `${abierto ? "L" : "M"} ${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
      abierto = true;
    });
    return d.trim();
  };

  const ticksY = [max, (max + min) / 2, min];
  const pasoX = Math.max(1, Math.ceil(n / 6));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" style={{ height: H }} role="img" aria-label={series.map((s) => s.nombre).join(", ")}>
        {ticksY.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <text x={pad.left - 4} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="monospace">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {referencia && (
          <g>
            <line x1={pad.left} x2={W - pad.right} y1={y(referencia.valor)} y2={y(referencia.valor)} stroke="#d99b42" strokeDasharray="5 4" />
            <text x={W - pad.right} y={y(referencia.valor) - 3} textAnchor="end" fontSize="9" fill="#d99b42">{referencia.etiqueta}</text>
          </g>
        )}
        {marcaX && marcaX.indice >= 0 && marcaX.indice < n && (
          <g>
            <line x1={x(marcaX.indice)} x2={x(marcaX.indice)} y1={pad.top} y2={pad.top + graphH} stroke="#ef5350" strokeDasharray="3 3" />
            <text x={x(marcaX.indice)} y={pad.top + 9} textAnchor="middle" fontSize="9" fill="#ef5350" fontWeight="600">{marcaX.etiqueta}</text>
          </g>
        )}
        {series.map((s, si) => (
          <g key={s.nombre}>
            {series.length === 1 && (
              <>
                <defs>
                  <linearGradient id={`${idGrad}-${si}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {s.valores.every((v) => v !== null) && s.valores.length > 1 && (
                  <path d={`${trazo(s.valores)} L ${x(s.valores.length - 1)} ${pad.top + graphH} L ${x(0)} ${pad.top + graphH} Z`} fill={`url(#${idGrad}-${si})`} />
                )}
              </>
            )}
            <path d={trazo(s.valores)} fill="none" stroke={s.color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
            {s.valores.length <= 40 && s.valores.map((v, i) => v !== null && <circle key={i} cx={x(i)} cy={y(v)} r={2} fill={s.color} />)}
          </g>
        ))}
        {etiquetasX.map((e, i) =>
          i % pasoX === 0 || i === n - 1 ? (
            <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">{e}</text>
          ) : null,
        )}
      </svg>
      {(series.length > 1 || unidad) && (
        <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-slate-400">
          {series.map((s) => (
            <span key={s.nombre} className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded" style={{ background: s.color }} /> {s.nombre}
            </span>
          ))}
          {unidad && <span className="ml-auto">{unidad}</span>}
        </div>
      )}
    </div>
  );
}
