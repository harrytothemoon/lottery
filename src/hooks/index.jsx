import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useFavicon = () => {
  const location = useLocation();

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      document.head.appendChild(newFavicon);
    }

    const path = location.pathname;
    if (path.includes("/lawin")) {
      document.querySelector(
        "link[rel='icon']"
      ).href = `${process.env.PUBLIC_URL}/lawin/favicon.ico`;
      document.title = "LAWINPLAY SLOT MACHINE";
    } else if (path.includes("/lodibet")) {
      document.querySelector(
        "link[rel='icon']"
      ).href = `${process.env.PUBLIC_URL}/lodibet/favicon.ico`;
      document.title = "LODIBET SLOT MACHINE";
    }
  }, [location]);
};

export default useFavicon;
