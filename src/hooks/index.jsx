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

    const brandConfigs = {
      lawin: {
        favicon: `${process.env.PUBLIC_URL}/lawin/favicon.ico`,
        title: "LAWINPLAY SLOT MACHINE",
      },
      lodibet: {
        favicon: `${process.env.PUBLIC_URL}/lodibet/favicon.ico`,
        title: "LODIBET SLOT MACHINE",
      },
      integrate: {
        favicon: `${process.env.PUBLIC_URL}/integrate/favicon.ico`,
        title: "INTEGRATED LOTTERY SYSTEM",
      },
    };

    const path = location.pathname;

    if (path.includes("/lawin")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.lawin.favicon;
      document.title = brandConfigs.lawin.title;
    } else if (path.includes("/lodibet")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.lodibet.favicon;
      document.title = brandConfigs.lodibet.title;
    } else if (path.includes("/integrate")) {
      document.querySelector("link[rel='icon']").href =
        brandConfigs.integrate.favicon;
      document.title = brandConfigs.integrate.title;
    }
  }, [location]);
};

export default useFavicon;
