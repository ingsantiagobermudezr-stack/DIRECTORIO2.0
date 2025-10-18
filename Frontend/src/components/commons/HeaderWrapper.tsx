import React, { useEffect, useState } from "react";
import Header from "./Header";

const getCookie = (name: string): string | undefined => {
  const target = `${name}=`;
  const parts = document.cookie.split(";");
  for (let p of parts) {
    const s = p.trim();
    if (s.startsWith(target)) return decodeURIComponent(s.slice(target.length));
  }
  return undefined;
};

const HeaderWrapper: React.FC = () => {
  const [token, setToken] = useState<string | undefined>();
  const [rol, setRol] = useState<string | undefined>();

  useEffect(() => {
    setToken(getCookie("token"));
    setRol(getCookie("rol"));
  }, []);

  return <Header title="Páginas Amarillas 360" token={token} rol={rol} />;
};

export default HeaderWrapper;
