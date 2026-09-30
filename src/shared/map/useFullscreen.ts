import { useEffect, useState, type RefObject } from "react";

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const onCambio = () => setActivo(document.fullscreenElement === ref.current && ref.current !== null);
    document.addEventListener("fullscreenchange", onCambio);
    return () => document.removeEventListener("fullscreenchange", onCambio);
  }, [ref]);

  const alternar = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void ref.current?.requestFullscreen().catch(() => undefined);
  };

  return { pantallaCompleta: activo, alternarPantallaCompleta: alternar };
}
