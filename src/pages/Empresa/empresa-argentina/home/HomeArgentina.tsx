import type { Empresa } from "../../../../types";
import { FlotaHome } from "../../../../components/flota/FlotaHome";

export function HomeArgentina({ empresa }: { empresa: Empresa }) {
  return <FlotaHome empresa={empresa} />;
}
