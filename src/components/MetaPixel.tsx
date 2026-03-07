import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initMetaPixel, trackMetaPageView } from "@/lib/metaPixel";

const DEFAULT_META_PIXEL_ID = "1989378395324414";

const MetaPixel = () => {
  const location = useLocation();
  const pixelId = import.meta.env.VITE_META_PIXEL_ID?.trim() || DEFAULT_META_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) return;
    initMetaPixel(pixelId);
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId) return;
    trackMetaPageView();
  }, [location.pathname, location.search, pixelId]);

  return null;
};

export default MetaPixel;
