import { useAuth } from "@/provider/use-auth";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { logout, user } = useAuth();
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: any) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div className="py-5 px-8 w-full flex justify-between items-center bg-amber-700  border-l">
        <div className="hidden sm:flex text-text-white text-lg font-medium">
        Starter App
        </div>
      
      <div className="flex gap-8 items-center">
      <div className="text-white text-xl font-bold">
        {t("Hi")}, {(user as any)?.name}
      </div>
        <div
          className="cursor-pointer"
          onClick={() => {
            logout();
          }}
        >
          <LogOut className="size-5 text-primary-foreground" />
        </div>
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent text-text-white border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
          value={i18n.language}
        >
          <option value="en" className="bg-gray-800">
            English
          </option>
          <option value="np" className="bg-gray-800">
            नेपाली
          </option>
        </select>
      </div>
    </div>
  );
}

