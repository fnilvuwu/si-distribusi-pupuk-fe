import LoginPetani from "./LoginPetani";
import LoginRole from "./LoginRole";
import RegisterPetani from "./RegisterPetani";

interface LoginRoutesProps {
  activeTab: string;
  setRole: (role: string) => void;
  setActiveTab: (tab: string) => void;
  setStatusVerifikasi: (v: "pending" | "verified" | "rejected") => void;
}

export function LoginRoutes({
  activeTab,
  setRole,
  setActiveTab,
  setStatusVerifikasi,
}: LoginRoutesProps) {
  switch (activeTab) {
    case "register-petani":
      return (
        <RegisterPetani
          setRole={setRole}
          setActiveTab={setActiveTab}
          setStatusVerifikasi={setStatusVerifikasi}
        />
      );

    case "login-role":
      return <LoginRole setRole={setRole} setActiveTab={setActiveTab} />;

    case "login-petani":
    default:
      return <LoginPetani setRole={setRole} setActiveTab={setActiveTab} />;
  }
}