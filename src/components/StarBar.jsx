import React from "react";
import { Star } from "lucide-react";
export default function StarBar({ stars = 0, lang = "de", onClick }) {
  return (
    <button
      className="star-pill"
      onClick={onClick}
      aria-label={`${stars} ${lang === "tr" ? "yıldız. Ödülleri aç" : "Sterne. Belohnungen öffnen"}`}
    >
      <Star size={23} fill="currentColor" />
      <b>{stars}</b>
    </button>
  );
}
