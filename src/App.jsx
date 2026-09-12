import React, { useEffect, useState } from "react";
import {
  Home as HomeIcon,
  Compass,
  Gamepad2,
  Waves,
  Lock,
  Volume2,
  VolumeX,
  ArrowLeft,
  Users,
} from "lucide-react";
import {
  useProgress,
  setSettings,
  getStorageFailure,
  getStorageRecovery,
} from "./progress/store.js";
import { useRoute, navigate } from "./app/router.js";
import { worlds, worldById } from "./data/content.js";
import { gameById } from "./games/registry.js";
import { stopSpeech } from "./audio/voice.js";
import { stopSounds } from "./audio/sounds.js";
import { useGameWakeLock } from "./app/useGameWakeLock.js";
import { useOnlineStatus } from "./app/useOnlineStatus.js";
import { applyOfflineUpdate, consumeOfflineReloadRequest, onOfflineUpdateReady } from "./app/offline.js";
import { useAudioPrime } from "./app/useAudioPrime.js";
import { gameFitsAge } from "./learning/age.js";
import { Mino } from "./components/Visual.jsx";
import StarBar from "./components/StarBar.jsx";
import WorldAtlas from "./worlds/WorldAtlas.jsx";
import Home from "./app/Home.jsx";
import GamesScreen from "./app/GamesScreen.jsx";
import WorldScreen from "./worlds/WorldScreen.jsx";
import Aquarium from "./rewards/Aquarium.jsx";
import Parents from "./parent/Parents.jsx";
import Profiles from "./parent/Profiles.jsx";
import GameSession from "./games/GameSession.jsx";
export default function App() {
  const progress = useProgress(),
    lang = progress.settings.lang,
    [route, arg, third, fourth] = useRoute(),
    t = (de, tr) => (lang === "tr" ? tr : de);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.motion = progress.settings.reducedMotion
      ? "reduced"
      : "full";
  }, [lang, progress.settings.reducedMotion]);
  const gameRoute = route === "play" || route === "replay";
  useAudioPrime(
    progress.settings.audio || progress.settings.sfx,
    progress.settings.audio,
  );
  const online = useOnlineStatus();
  const [updateReady, setUpdateReady] = useState(false);
  const [updating, setUpdating] = useState(false);
  useEffect(() => onOfflineUpdateReady(() => setUpdateReady(true)), []);
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let reloading = false;
    const changed = () => {
      // clients.claim() also fires controllerchange on the very first service-
      // worker install. Reload only when the parent explicitly accepted a
      // waiting MINIK update, otherwise a child could lose a just-opened game.
      if (reloading || !consumeOfflineReloadRequest()) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", changed);
  }, []);
  useEffect(() => {
    if (!updating) return undefined;
    // WebKit normally emits controllerchange after SKIP_WAITING, but a rare
    // suspended-PWA transition can miss/delay that event. Because the parent
    // already explicitly accepted the update, finish it with one bounded
    // fallback reload instead of leaving the button disabled forever.
    const fallback = setTimeout(() => {
      if (consumeOfflineReloadRequest()) {
        window.location.reload();
        return;
      }
      setUpdating(false);
    }, 6000);
    return () => clearTimeout(fallback);
  }, [updating]);
  const [profileReady, setProfileReady] = useState(() => {
    try { return sessionStorage.getItem("minik_profile_ready") === "1"; }
    catch { return false; }
  });
  useEffect(() => {
    if (progress.profiles.length <= 1 && !profileReady) setProfileReady(true);
  }, [progress.profiles.length, profileReady]);
  function confirmProfile() {
    try { sessionStorage.setItem("minik_profile_ready", "1"); } catch {}
    setProfileReady(true);
  }
  function go(path) {
    if (path.startsWith("/replay/")) path = path + `/${Date.now()}`;
    navigate(path);
  }
  const game = gameById[arg],
    world = worldById[third],
    validGame =
      game &&
      world &&
      gameFitsAge(game, progress.activeProfile?.ageGroup) &&
      (game.allWorlds || game.worlds.includes(world.id));
  const playing = gameRoute && Boolean(validGame);
  useGameWakeLock(playing);
  const nav = [
    ["/", HomeIcon, t("Start", "Ana sayfa")],
    ["/worlds", Compass, t("Lernwelten", "Dünyalar")],
    ["/games", Gamepad2, t("Spielkiste", "Oyunlar")],
    ["/aquarium", Waves, t("Aquarium", "Akvaryum")],
  ];
  function selected(path) {
    return path === "/"
      ? !route
      : path === "/worlds"
        ? ["worlds", "world"].includes(route)
        : path === `/${route}`;
  }
  if (!profileReady && progress.profiles.length > 1 && route !== "profiles")
    return (
      <main className="profile-launch-shell">
        <Profiles progress={progress} onChoose={confirmProfile} chooserOnly />
      </main>
    );
  if (playing && validGame)
    return (
      <main className="game-shell">
        <GameSession
          key={`${progress.activeProfileId}-${progress.activeProfile?.ageGroup}-${progress.settings.adaptive ? "adaptive" : `fixed-${progress.settings.options}`}-${arg}-${third}-${fourth || route}-${lang}`}
          gameId={arg}
          worldId={third}
          onNavigate={go}
        />
      </main>
    );
  return (
    <div className={`app-shell ${!["parents", "profiles"].includes(route) ? "child-world-shell" : ""}`} data-age={progress.activeProfile?.ageGroup || "4-5"}>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => go("/")}
          aria-label={t("MINIK Startseite", "MINIK ana sayfa")}
        >
          <Mino />
          <span>
            minik<span className="brand-dot">.</span>
          </span>
        </button>
        <span className="sidebar-label">
          {t("DEINE LERNWELT", "SENİN ÖĞRENME DÜNYAN")}
        </span>
        <nav aria-label={t("Hauptnavigation", "Ana menü")}>
          {nav.map(([path, Icon, name]) => (
            <button
              key={path}
              aria-label={name}
              className={selected(path) ? "active" : ""}
              onClick={() => go(path)}
              aria-current={selected(path) ? "page" : undefined}
            >
              <Icon size={23} />
              <span>{name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-mino">
          <Mino />
          <p>
            {t(
              "Kleine Schritte,\ngroße Freude.",
              "Küçük adımlar,\nbüyük mutluluk.",
            )}
          </p>
          <span>DEUTSCH · TÜRKÇE</span>
        </div>
        <button
          className={`parent-link ${route === "profiles" ? "active" : ""}`}
          onClick={() => go("/profiles")}
        >
          <Users size={18} />
          {progress.activeProfile?.avatar} {progress.activeProfile?.name || t("Profil", "Profil")}
        </button>
        <button
          className={`parent-link ${route === "parents" ? "active" : ""}`}
          onClick={() => go("/parents")}
        >
          <Lock size={18} />
          {t("Elternbereich", "Ebeveyn alanı")}
        </button>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button className="mobile-brand" onClick={() => go("/")}>
            <Mino />
            <b>minik.</b>
          </button>
          <div className="topbar-caption">
            {t(
              "Mit Neugier wird die Welt größer.",
              "Merak ettikçe dünya büyür.",
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="audio-toggle"
              onClick={() => {
                setSettings({ audio: !progress.settings.audio });
                stopSpeech();
                stopSounds();
              }}
              aria-label={
                progress.settings.audio
                  ? t("Stimme ausschalten", "Konuşmayı kapat")
                  : t("Stimme einschalten", "Konuşmayı aç")
              }
            >
              {progress.settings.audio ? (
                <Volume2 size={22} />
              ) : (
                <VolumeX size={22} />
              )}
            </button>
            <button
              className="language-switch"
              onClick={() => {
                stopSpeech();
                setSettings({ lang: lang === "de" ? "tr" : "de" });
              }}
              aria-label={t("Zu Türkisch wechseln", "Almancaya geç")}
            >
              <span className={lang === "de" ? "chosen" : ""}>DE</span>
              <span className={lang === "tr" ? "chosen" : ""}>TR</span>
            </button>
            <button
              className="profile-chip"
              onClick={() => go("/profiles")}
              aria-label={t("Profil wechseln", "Profili değiştir")}
            >
              <span>{progress.activeProfile?.avatar || "🐠"}</span>
              <b>{progress.activeProfile?.name || t("Kind", "Çocuk")}</b>
            </button>
            <StarBar
              stars={progress.stars}
              lang={lang}
              onClick={() => go("/aquarium")}
            />
            <button
              className="mobile-parents icon-button"
              onClick={() => go("/parents")}
              aria-label={t("Elternbereich", "Ebeveyn alanı")}
            >
              <Lock size={19} />
            </button>
          </div>
        </header>
        <main className="main-content">
          {updateReady && !playing && (
            <div role="status" className="update-message">
              <span>
                {t(
                  "Eine neue MINIK-Version ist bereit.",
                  "Yeni bir MINIK sürümü hazır.",
                )}
              </span>
              <button
                type="button"
                disabled={updating}
                onClick={async () => {
                  setUpdating(true);
                  const applied = await applyOfflineUpdate().catch(() => false);
                  if (!applied) {
                    setUpdating(false);
                    setUpdateReady(false);
                  }
                }}
              >
                {updating
                  ? t("Aktualisiere …", "Güncelleniyor …")
                  : t("Jetzt aktualisieren", "Şimdi güncelle")}
              </button>
            </div>
          )}
          {!online && (
            <p role="status" className="offline-message">
              {t(
                "Offline-Modus · MINIK läuft mit den gespeicherten Inhalten weiter.",
                "Çevrimdışı mod · MINIK kayıtlı içeriklerle çalışmaya devam ediyor.",
              )}
            </p>
          )}
          {getStorageFailure() && (
            <p role="status" className="storage-message">
              {t(
                "Fortschritt kann auf diesem Gerät gerade nicht gespeichert werden.",
                "İlerleme şu anda bu cihaza kaydedilemiyor.",
              )}
            </p>
          )}
          {getStorageRecovery() && !getStorageFailure() && (
            <p role="status" className="storage-message">
              {t(
                "MINIK hat den letzten sicheren Lernstand automatisch wiederhergestellt.",
                "MINIK son güvenli öğrenme durumunu otomatik olarak geri yükledi.",
              )}
            </p>
          )}
          {!route ? (
            <Home progress={progress} onNavigate={go} />
          ) : route === "worlds" ? (
            <WorldAtlas progress={progress} onOpen={world => go(`/world/${world.id}`)} />
          ) : route === "world" && worldById[arg] ? (
            <WorldScreen
              key={arg}
              world={worldById[arg]}
              progress={progress}
              onNavigate={go}
            />
          ) : route === "games" ? (
            <GamesScreen progress={progress} onNavigate={go} />
          ) : route === "aquarium" ? (
            <Aquarium progress={progress} />
          ) : route === "profiles" ? (
            <Profiles progress={progress} onNavigate={go} />
          ) : route === "parents" ? (
            <Parents progress={progress} />
          ) : (
            <div className="parent-gate">
              <Mino />
              <h1>
                {t(
                  "Hier geht’s zu deinen Welten",
                  "Dünyalarına buradan ulaşabilirsin",
                )}
              </h1>
              <button className="primary" onClick={() => go("/worlds")}>
                <ArrowLeft />
                {t("Lernwelten öffnen", "Dünyaları aç")}
              </button>
            </div>
          )}
        </main>
        <footer className="app-footer">
          <span>MINIK</span>
          <span>
            {t(
              "Mit Mino jeden Tag ein bisschen wachsen.",
              "Mino ile her gün biraz büyü.",
            )}
          </span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label={t("Hauptnavigation", "Ana menü")}>
        {nav.map(([path, Icon, name]) => (
          <button
            key={path}
            aria-label={name}
            className={selected(path) ? "active" : ""}
            onClick={() => go(path)}
            aria-current={selected(path) ? "page" : undefined}
          >
            <Icon size={24} />
            <span>{name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
