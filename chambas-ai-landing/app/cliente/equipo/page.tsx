import { redirect } from "next/navigation";

const EquipoRedirectPage = () => {
  redirect("/cliente?modulo=equipo");
};

export default EquipoRedirectPage;
