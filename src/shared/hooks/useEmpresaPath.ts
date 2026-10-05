import { useParams } from "react-router-dom";

export function useEmpresaPath() {
  const { token } = useParams();
  return token ? `/empresa/${token}` : "/panel";
}
