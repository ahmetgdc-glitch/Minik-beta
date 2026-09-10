import React from "react";
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
export function Art({ name, className = "", alt = "", ...rest }) {
  return (
    <img
      className={`art ${className}`}
      src={assetUrl(`assets/illustrations/${name}.svg`)}
      alt={alt}
      draggable="false"
      {...rest}
    />
  );
}
export function Mino({ className = "", ...rest }) {
  return (
    <img
      className={`mino ${className}`}
      src={assetUrl("assets/mascot/mino.webp")}
      alt="Mino"
      draggable="false"
      {...rest}
    />
  );
}

export function MinoAvatar({ outfit = "classic", className = "", ...rest }) {
  const symbols = { party: "🎉", explorer: "🧢", diver: "🤿", artist: "🎨", hero: "🦸", royal: "👑" };
  const symbol = symbols[outfit] || "";
  return (
    <span className={`mino-avatar outfit-${outfit} ${className}`} {...rest}>
      <Mino />
      {symbol && <span className="mino-outfit-symbol" aria-hidden="true">{symbol}</span>}
    </span>
  );
}

export default function Visual({
  item,
  lang = "de",
  photos = true,
  className = "",
  silhouette = false,
}) {
  if (!item) return null;
  const alt = item.labels?.[lang] || "";
  if (item.type === "number")
    return (
      <span
        className={`item-visual number-visual ${className}`}
        role="img"
        aria-label={alt}
      >
        {item.number}
      </span>
    );
  if (item.type === "color")
    return (
      <span
        className={`item-visual color-visual ${className}`}
        role="img"
        aria-label={alt}
      >
        <span style={{ background: item.color }} />
      </span>
    );
  if (item.type === "shape")
    return (
      <span
        className={`item-visual shape-visual ${className}`}
        role="img"
        aria-label={alt}
      >
        <span
          className={`shape shape-${item.shape}`}
          style={{ "--shape-color": item.color }}
        />
      </span>
    );
  const photo = photos && item.variants?.photo && !silhouette;
  return (
    <img
      className={`item-visual ${photo ? "photo-visual" : ""} ${silhouette ? "silhouette" : ""} ${className}`}
      src={assetUrl(
        photo ? item.variants.photo : `assets/illustrations/${item.asset}.svg`,
      )}
      alt={alt}
      loading="eager"
      draggable="false"
    />
  );
}
