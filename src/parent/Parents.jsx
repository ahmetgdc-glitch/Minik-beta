import React, { useState, useEffect } from "react";
import { Lock, Volume2, Settings2, Star, Check, Trash2, Download, Upload, Smartphone, Share2 } from "lucide-react";
import { worlds, allItems, itemById } from "../data/content.js";
import { dispatch, setSettings, getStorageFailure, createFamilyBackup, restoreFamilyBackup } from "../progress/store.js";
import { difficultyFor } from "../progress/model.js";
import { gameCatalog } from "../games/registry.js";
import { APP_VERSION_LABEL } from "../app/meta.js";
import { dueCount } from "../learning/schedule.js";
import { PARENT_GATE_STORAGE_KEY, nextParentGate, parentGateRemaining, persistParentGate, readParentGate } from "./gateGuard.js";
import { weeklyActivity, strongestLearningWorld } from "../learning/analytics.js";
import { BACKUP_MAX_BYTES, parseBackupPayload } from "../progress/backup.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { getInstallState, requestInstall, subscribeInstallState } from "../app/install.js";
import { useModalSafety } from "../app/useModalSafety.js";
import {
  refreshVoices,
  getVoices,
  subscribeVoices,
  speak,
} from "../audio/voice.js";
export default function Parents({ progress }) {
  const s = progress.settings,
    lang = s.lang,
    t = (de, tr) => (lang === "tr" ? tr : de);
  const [unlocked, setUnlocked] = useState(false),
    [code, setCode] = useState(""),
    [error, setError] = useState(false),
    [question] = useState(() => [
      7 + Math.floor(Math.random() * 5),
      4 + Math.floor(Math.random() * 5),
    ]),
    [voiceVersion, setVoiceVersion] = useState(0),
    [reset, setReset] = useState(false),
    [pin, setPin] = useState(s.pin),
    [backupStatus, setBackupStatus] = useState(null),
    [pendingBackup, setPendingBackup] = useState(null),
    [gate, setGate] = useState(() => readParentGate(typeof window !== "undefined" ? window.localStorage : null)),
    [gateNow, setGateNow] = useState(Date.now()),
    [installState, setInstallState] = useState(() => getInstallState()),
    [installStatus, setInstallStatus] = useState(null);
  useModalSafety(reset, () => setReset(false));
  useEffect(() => {
    refreshVoices();
    return subscribeVoices(() => setVoiceVersion((v) => v + 1));
  }, []);
  useEffect(() => subscribeInstallState(setInstallState), []);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncGate = (event) => {
      if (event.key !== PARENT_GATE_STORAGE_KEY) return;
      const now = Date.now();
      setGate(readParentGate(window.localStorage, now));
      setGateNow(now);
    };
    window.addEventListener("storage", syncGate);
    return () => window.removeEventListener("storage", syncGate);
  }, []);
  // Never leave adult controls open indefinitely on a shared child device.
  useEffect(() => {
    if (!unlocked) return;
    let timer;
    const lock = () => {
      setUnlocked(false);
      setCode("");
      setError(false);
    };
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(lock, 5 * 60 * 1000);
    };
    const visibility = () => {
      if (document.hidden) lock();
      else arm();
    };
    const events = ["pointerdown", "keydown", "change"];
    events.forEach((name) => document.addEventListener(name, arm, { passive: true }));
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", lock);
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach((name) => document.removeEventListener(name, arm));
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", lock);
    };
  }, [unlocked]);

  useEffect(() => {
    const remaining = parentGateRemaining(gate, gateNow);
    if (!remaining) return;
    const timer = setInterval(() => setGateNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [gate, gateNow]);
  function open(e) {
    e.preventDefault();
    const now = Date.now();
    if (parentGateRemaining(gate, now) > 0) {
      setGateNow(now);
      return;
    }
    const correct = code === (s.pin || String(question[0] + question[1]));
    const next = nextParentGate(gate, correct, now);
    setGate(next);
    persistParentGate(typeof window !== "undefined" ? window.localStorage : null, next, now);
    setGateNow(now);
    if (correct) {
      setUnlocked(true);
      setError(false);
      setCode("");
    } else {
      setError(true);
      setCode("");
    }
  }
  const gateRemaining = parentGateRemaining(gate, gateNow);
  if (!unlocked)
    return (
      <section className="parent-gate">
        <div className="gate-icon">
          <Lock size={38} />
        </div>
        <h1>{t("Für die Großen", "Büyükler için")}</h1>
        <p>
          {s.pin
            ? t("Gib deine vierstellige PIN ein.", "Dört haneli PIN’ini gir.")
            : t(
                "Bitte einen Erwachsenen um Hilfe.",
                "Bir yetişkinden yardım iste.",
              )}
        </p>
        <form onSubmit={open}>
          <label htmlFor="parent-code">
            {s.pin ? "PIN" : `${question[0]} + ${question[1]} = ?`}
          </label>
          <input
            id="parent-code"
            autoComplete="off"
            type={s.pin ? "password" : "text"}
            inputMode="numeric"
            maxLength={4}
            value={code}
            disabled={gateRemaining > 0}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          {gateRemaining > 0 ? (
            <p className="form-error" role="alert">
              {t(`Zu viele Versuche. Bitte ${gateRemaining} Sekunden warten.`, `Çok fazla deneme. Lütfen ${gateRemaining} saniye bekle.`)}
            </p>
          ) : error ? (
            <p className="form-error" role="alert">
              {t("Das stimmt noch nicht.", "Henüz doğru değil.")}
            </p>
          ) : null}
          <button className="primary" type="submit" disabled={gateRemaining > 0}>
            {t("Elternbereich öffnen", "Ebeveyn alanını aç")}
          </button>
        </form>
      </section>
    );
  const accuracy = progress.answers
    ? Math.round((progress.correct / progress.answers) * 100)
    : 0;
  const dueToday = dueCount(progress, allItems, lang);
  const week = weeklyActivity(progress);
  const strongest = strongestLearningWorld(progress, worlds, lang);
  const maxDayAnswers = Math.max(1, ...week.days.map((d) => d.answers));
  const difficult = Object.entries(progress.mastery)
    .filter(([key, v]) => key.startsWith(lang + ":") && v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 8);
  function downloadBackup() {
    try {
      const payload = createFamilyBackup();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `MINIK-Backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupStatus({ ok: true, text: t("Backup gespeichert.", "Yedek kaydedildi.") });
    } catch {
      setBackupStatus({ ok: false, text: t("Backup konnte nicht erstellt werden.", "Yedek oluşturulamadı.") });
    }
  }
  async function importBackup(file) {
    if (!file) return;
    if (Number(file.size) > BACKUP_MAX_BYTES) {
      setBackupStatus({
        ok: false,
        text: t(
          "Diese Backup-Datei ist ungewöhnlich groß und wurde aus Sicherheitsgründen nicht geöffnet.",
          "Bu yedek dosyası olağandışı büyük olduğu için güvenlik amacıyla açılmadı.",
        ),
      });
      return;
    }
    try {
      const text = await file.text();
      parseBackupPayload(text);
      setPendingBackup(text);
    } catch {
      setBackupStatus({ ok: false, text: t("Diese Datei konnte nicht gelesen werden.", "Bu dosya okunamadı.") });
    }
  }
  function confirmBackupRestore() {
    if (!pendingBackup) return;
    try {
      restoreFamilyBackup(pendingBackup);
      setPin("");
      setBackupStatus({ ok: true, text: t("Backup erfolgreich wiederhergestellt.", "Yedek başarıyla geri yüklendi.") });
    } catch {
      setBackupStatus({ ok: false, text: t("Diese Datei ist kein gültiges MINIK-Backup.", "Bu dosya geçerli bir MINIK yedeği değil.") });
    } finally {
      setPendingBackup(null);
    }
  }

  function toggle(key, title, desc) {
    return (
      <label className="setting-toggle">
        <span>
          <b>{title}</b>
          <small>{desc}</small>
        </span>
        <input
          type="checkbox"
          checked={s[key]}
          onChange={(e) => setSettings({ [key]: e.target.checked })}
        />
      </label>
    );
  }
  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingBackup)}
        title={t("Backup wiederherstellen?", "Yedek geri yüklensin mi?")}
        message={t("Dieses Backup ersetzt alle aktuellen Kinderprofile und Lernstände auf diesem Gerät.", "Bu yedek, bu cihazdaki tüm çocuk profillerini ve ilerlemeyi değiştirecek.")}
        confirmLabel={t("Backup wiederherstellen", "Yedeği geri yükle")}
        cancelLabel={t("Abbrechen", "İptal")}
        danger
        onCancel={() => setPendingBackup(null)}
        onConfirm={confirmBackupRestore}
      />
      <div className="section-heading">
        <div>
          <span className="eyebrow">{APP_VERSION_LABEL}</span>
          <h1>{t("Elternbereich", "Ebeveyn alanı")}</h1>
        </div>
        <Settings2 size={30} />
      </div>
      <div className="parent-stats">
        <div>
          <Star />
          <b>{progress.stars}</b>
          <span>{t("Sterne", "Yıldız")}</span>
        </div>
        <div>
          <Check />
          <b>{accuracy}%</b>
          <span>{t("Richtige Versuche", "Doğru denemeler")}</span>
        </div>
        <div>
          <b>{progress.sessions.filter((x) => x.completed).length}</b>
          <span>{t("Spielrunden beendet", "Tamamlanan oyun")}</span>
        </div>
        <div>
          <b>{dueToday}</b>
          <span>{t("Heute zu wiederholen", "Bugün tekrar edilecek")}</span>
        </div>
        <div>
          <b>
            {
              Object.values(progress.mastery).filter((x) => x.independent >= 3)
                .length
            }
          </b>
          <span>{t("Sicher gelernt (DE/TR)", "Öğrenilen (DE/TR)")}</span>
        </div>
      </div>
      <section className="settings-panel weekly-learning-panel">
        <div className="weekly-learning-head">
          <div>
            <span className="eyebrow">{t("Letzte 7 Tage", "Son 7 gün")}</span>
            <h2>{t("Lernwoche", "Öğrenme haftası")}</h2>
          </div>
          <b>{week.activeDays}/7 {t("aktive Tage", "aktif gün")}</b>
        </div>
        <div className="weekly-summary-grid">
          <div><b>{week.minutes}</b><span>{t("aktive Minuten", "aktif dakika")}</span></div>
          <div><b>{week.completed}</b><span>{t("beendete Runden", "tamamlanan oyun")}</span></div>
          <div><b>{week.accuracy}%</b><span>{t("Trefferquote", "doğruluk")}</span></div>
          <div><b>{strongest ? strongest.world.labels[lang] : "–"}</b><span>{t("stärkste Welt", "en güçlü dünya")}</span></div>
        </div>
        <div className="weekly-bars" aria-label={t("Aktivität der letzten sieben Tage", "Son yedi günün etkinliği")}>
          {week.days.map((day) => (
            <div className="weekly-day" key={day.key}>
              <span className="weekly-bar-track"><i style={{ height: `${Math.max(day.answers ? 18 : 4, (day.answers / maxDayAnswers) * 100)}%` }} /></span>
              <b>{new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "de-DE", { weekday: "short" }).format(day.date).replace(".", "")}</b>
              <small>{day.answers}</small>
            </div>
          ))}
        </div>
        <p className="fine-print">{t("Die Lernzeit zählt nur, solange ein Spiel wirklich aktiv ist. Pausen und ein ausgeblendeter Browser werden nicht mitgezählt.", "Öğrenme süresi yalnızca oyun gerçekten aktifken sayılır. Molalar ve arka plandaki tarayıcı sayılmaz.")}</p>
      </section>
      <section className="settings-panel">
        <h2>{t("Lernen & Spielen", "Öğrenme ve oyun")}</h2>
        <div className="settings-grid">
          <label>
            {t("Sprache", "Dil")}
            <select
              value={lang}
              onChange={(e) => setSettings({ lang: e.target.value })}
            >
              <option value="de">Deutsch</option>
              <option value="tr">Türkçe</option>
            </select>
          </label>
          <label>
            {t("Antwortmöglichkeiten", "Cevap seçenekleri")}
            <select
              value={s.options}
              disabled={s.adaptive}
              onChange={(e) => setSettings({ options: Number(e.target.value) })}
            >
              {[2, 4, 6].map((x) => (
                <option key={x} value={x}>
                  {x} {t("Bilder", "resim")}
                </option>
              ))}
            </select>
          </label>
        </div>
        {toggle(
          "adaptive",
          t("Schwierigkeit automatisch anpassen", "Zorluk otomatik ayarlansın"),
          t(
            "Beginnt mit 2 Bildern. Sichere Antworten führen zu 4 oder 6 Bildern.",
            "2 resimle başlar. Başarıya göre 4 veya 6 resme çıkar.",
          ),
        )}
        {toggle(
          "autoHelp",
          t("Mino hilft von selbst", "Mino kendiliğinden yardım etsin"),
          t(
            "Mino meldet sich nach Wartezeit. Bei Fehlern hilft er weiterhin.",
            "Bekleyince seslenir. Hatalarda yardım etmeye devam eder.",
          ),
        )}
        {toggle(
          "photos",
          t("Fotomotive bei Gefühlen", "Duygularda fotoğraf"),
          t(
            "Sechs KI-erzeugte Fotomotive erwachsener Personen.",
            "Yapay zekâyla üretilmiş altı yetişkin fotoğrafı.",
          ),
        )}
        {toggle(
          "reducedMotion",
          t("Ruhige Animationen", "Az hareket"),
          t(
            "Verringert schwebende und hüpfende Bewegungen.",
            "Süzülme ve zıplama hareketlerini azaltır.",
          ),
        )}
      </section>
      <section className="settings-panel">
        <h2>{t("Stimme & Töne", "Konuşma ve ses")}</h2>
        <p>
          {t(
            "MINIK nutzt die Stimmen deines Geräts ohne API-Schlüssel. Wie natürlich sie klingen und ob sie offline funktionieren, hängt von den installierten Stimmen ab.",
            "MINIK, API anahtarı olmadan cihazındaki sesleri kullanır. Doğallık ve çevrimdışı kullanım, yüklü seslere bağlıdır.",
          )}
        </p>
        {toggle(
          "audio",
          t("Sprachausgabe", "Sesli anlatım"),
          t(
            "Aufgaben und Wörter vorlesen.",
            "Görevleri ve kelimeleri seslendir.",
          ),
        )}
        {toggle(
          "sfx",
          t("Belohnungstöne", "Ödül sesleri"),
          t(
            "Kurze Töne für gelöste Aufgaben. Lern-Geräusche bleiben antippbar.",
            "Doğru görevlerde kısa sesler. Öğrenme sesleri dokunarak çalınabilir.",
          ),
        )}
        <div className="settings-grid">
          {["de", "tr"].map((l) => (
            <label key={l}>
              {l === "de"
                ? t("Deutsche Stimme", "Almanca ses")
                : t("Türkische Stimme", "Türkçe ses")}
              <select
                value={s.voices[l]}
                onChange={(e) =>
                  setSettings({ voices: { [l]: e.target.value } })
                }
              >
                <option value="">
                  {t("Beste verfügbare Stimme", "Mevcut en iyi ses")}
                </option>
                {getVoices(l).map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                    {v.localService ? ` · ${t("lokal", "yerel")}` : ""}
                  </option>
                ))}
              </select>
              {!getVoices(l).length && (
                <small>
                  {t(
                    "Der Browser meldet noch keine passende Stimme.",
                    "Tarayıcı henüz uygun bir ses bildirmedi.",
                  )}
                </small>
              )}
            </label>
          ))}
          <label>
            {t("Sprechtempo", "Konuşma hızı")} · {s.rate.toFixed(2)}
            <input
              type="range"
              min="0.65"
              max="1.15"
              step="0.05"
              value={s.rate}
              onChange={(e) => setSettings({ rate: Number(e.target.value) })}
            />
          </label>
          <label>
            {t("Tonhöhe", "Ses perdesi")} · {s.pitch.toFixed(2)}
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={s.pitch}
              onChange={(e) => setSettings({ pitch: Number(e.target.value) })}
            />
          </label>
        </div>
        <button
          className="secondary"
          onClick={() =>
            speak(
              t(
                "Hallo! Ich bin Mino. Wir entdecken heute die Tiere.",
                "Merhaba! Ben Mino. Bugün hayvanları keşfediyoruz.",
              ),
              lang,
              { ...s, audio: true },
            )
          }
        >
          <Volume2 size={20} />
          {t("Stimme anhören", "Sesi dinle")}
        </button>
      </section>
      <section className="settings-panel">
        <h2>{t("Fortschritt nach Lernwelt", "Dünyalara göre ilerleme")}</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("Lernwelt", "Dünya")}</th>
                <th>{t("Geübt", "Deneme")}</th>
                <th>{t("Richtig", "Doğru")}</th>
                <th>{t("Auswahl", "Seçenek")}</th>
              </tr>
            </thead>
            <tbody>
              {worlds.map((w) => {
                const p = progress.worlds[`${lang}:${w.id}`];
                return (
                  <tr key={w.id}>
                    <td>{w.labels[lang]}</td>
                    <td>{p?.answers || 0}</td>
                    <td>
                      {p?.answers
                        ? `${Math.round((p.correct / p.answers) * 100)}%`
                        : "–"}
                    </td>
                    <td>{difficultyFor(progress, w.id, lang)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          {t(
            "Sicher gelernt: mindestens drei selbstständig gelöste Aufgaben pro Begriff und Sprache. Hilfe zählt als Übung. Die Trefferquote zählt auch Wiederholungsversuche.",
            "Öğrenildi: kavram ve dil başına en az üç bağımsız doğru görev. İpuçları alıştırma sayılır. Doğruluk oranına tekrar denemeleri de dâhildir.",
          )}
        </p>
      </section>
      <section className="settings-panel">
        <h2>{t("Noch einmal gemeinsam üben", "Birlikte tekrar çalışalım")}</h2>
        {difficult.length ? (
          <div className="difficult-words">
            {difficult.map(([key, v]) => {
              const item = itemById[key.slice(3)];
              return item ? (
                <button
                  key={key}
                  className="word-chip"
                  onClick={() => speak(item.labels[lang], lang, s)}
                >
                  <Volume2 size={16} />
                  {item.labels[lang]}
                  <small>
                    {v.wrong} {t("Fehlversuche", "hatalı deneme")}
                  </small>
                </button>
              ) : null;
            })}
          </div>
        ) : (
          <p>
            {t(
              "Hier erscheinen Begriffe, die noch Übung brauchen.",
              "Çalışılması gereken kavramlar burada görünür.",
            )}
          </p>
        )}
      </section>
      <section className="settings-panel">
        <h2>{t("Letzte Spielrunden", "Son oyunlar")}</h2>
        {progress.sessions.length ? (
          <ul className="session-list">
            {progress.sessions
              .slice(-8)
              .reverse()
              .map((x) => (
                <li key={x.id}>
                  <span>
                    {worlds.find((w) => w.id === x.worldId)?.labels[lang]} ·{" "}
                    {x.lang.toUpperCase()}
                    <small>
                      {new Date(x.started).toLocaleString(
                        lang === "de" ? "de-DE" : "tr-TR",
                      )}
                    </small>
                  </span>
                  <span>
                    {x.rounds}
                    <Star size={16} />
                    <small>
                      {x.completed
                        ? t("Beendet", "Tamamlandı")
                        : t("Unterbrochen", "Ara verildi")}{" "}
                      · {Math.max(1, Math.round(x.seconds / 60))} min
                    </small>
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p>
            {t(
              "Noch keine Spielrunden gespeichert.",
              "Henüz kayıtlı oyun yok.",
            )}
          </p>
        )}
      </section>
      <section className="settings-panel install-panel">
        <div className="install-panel-head">
          <span className="install-device-icon"><Smartphone size={28} /></span>
          <div>
            <h2>{t("MINIK als App installieren", "MINIK’i uygulama olarak yükle")}</h2>
            <p>{installState.standalone
              ? t("MINIK läuft bereits wie eine App auf diesem Gerät.", "MINIK bu cihazda zaten uygulama gibi çalışıyor.")
              : t("Installiert startet MINIK bildschirmfüllend und ist für Kinder leichter zu öffnen.", "Yüklendiğinde MINIK tam ekran açılır ve çocukların başlatması daha kolay olur.")}</p>
          </div>
        </div>
        {installState.standalone ? (
          <p className="backup-status" role="status">✓ {t("Auf diesem Gerät installiert", "Bu cihaza yüklendi")}</p>
        ) : installState.promptAvailable ? (
          <button className="primary" type="button" onClick={async () => {
            const result = await requestInstall();
            setInstallState(getInstallState());
            setInstallStatus(result.outcome);
          }}>
            <Download size={19} />
            {t("MINIK installieren", "MINIK’i yükle")}
          </button>
        ) : installState.ios ? (
          <div className="ios-install-steps">
            <Share2 size={22} />
            <p>{t("Auf iPhone/iPad: In Safari auf Teilen tippen und dann „Zum Home-Bildschirm“ wählen.", "iPhone/iPad’de: Safari’de Paylaş’a dokun, sonra ‘Ana Ekrana Ekle’yi seç.")}</p>
          </div>
        ) : (
          <p className="fine-print">{t("Öffne MINIK in einem Browser, der Web-App-Installation anbietet. Wenn Installieren verfügbar wird, erscheint hier automatisch die Schaltfläche.", "MINIK’i web uygulaması yüklemeyi destekleyen bir tarayıcıda aç. Yükleme kullanılabilir olduğunda düğme burada otomatik görünür.")}</p>
        )}
        {installStatus === "dismissed" && <p className="fine-print" role="status">{t("Installation abgebrochen. Du kannst es später erneut versuchen.", "Yükleme iptal edildi. Daha sonra tekrar deneyebilirsin.")}</p>}
        {installStatus === "failed" && <p className="form-error" role="alert">{t("Die Installation konnte nicht gestartet werden.", "Yükleme başlatılamadı.")}</p>}
      </section>
      <section className="settings-panel">
        <h2>{t("Gerät & Schutz", "Cihaz ve koruma")}</h2>
        <p>
          {t(
            "Fortschritt bleibt in diesem Browser auf diesem Gerät. Es gibt keine Konten, Werbung oder Käufe. Beim Löschen der Browserdaten geht der Fortschritt verloren.",
            "İlerleme bu cihazın tarayıcısında saklanır. Hesap, reklam ve satın alma yoktur. Tarayıcı verileri silinirse ilerleme kaybolur.",
          )}
        </p>
        {getStorageFailure() && (
          <p role="alert" className="form-error">
            {t(
              "Speichern ist in diesem Browser nicht möglich. Fortschritt bleibt nur bis zum Schließen der App erhalten.",
              "Bu tarayıcıda kayıt yapılamıyor. İlerleme yalnızca uygulama açıkken korunur.",
            )}
          </p>
        )}
        <form
          className="pin-settings"
          onSubmit={(e) => {
            e.preventDefault();
            if (pin.length === 4 || pin === "") setSettings({ pin });
          }}
        >
          <label>
            {t(
              "Eigene vierstellige PIN (optional)",
              "Dört haneli PIN (isteğe bağlı)",
            )}
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              maxLength={4}
              pattern="[0-9]{4}|"
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          </label>
          <button className="secondary" type="submit">
            {t("PIN speichern", "PIN’i kaydet")}
          </button>
          {pin === s.pin && pin && <Check size={20} />}
        </form>
        <div className="backup-actions">
          <button className="secondary" type="button" onClick={downloadBackup}>
            <Download size={18} />
            {t("Alle Profile sichern", "Tüm profilleri yedekle")}
          </button>
          <label className="secondary">
            <Upload size={18} />
            {t("Backup wiederherstellen", "Yedeği geri yükle")}
            <input type="file" accept="application/json,.json" onChange={(e) => { importBackup(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
        {backupStatus && <p className={`backup-status ${backupStatus.ok ? "" : "error"}`} role="status">{backupStatus.text}</p>}
        <button className="danger-button" onClick={() => setReset(true)}>
          <Trash2 size={18} />
          {t("Lernfortschritt zurücksetzen", "İlerlemeyi sıfırla")}
        </button>
        <p className="fine-print">
          {worlds.length} {t("Welten", "dünya")} · {allItems.length}{" "}
          {t("Lernobjekte", "kavram")} · {gameCatalog.length} {t("Spieltypen", "oyun türü")} · {APP_VERSION_LABEL}
        </p>
      </section>
      {reset && (
        <div className="modal-scrim">
          <div className="pause-dialog" role="alertdialog" aria-modal="true">
            <h2>
              {t("Fortschritt zurücksetzen?", "İlerleme sıfırlansın mı?")}
            </h2>
            <p>
              {t(
                "Sterne, Schätze und Lernstatistik werden auf diesem Gerät gelöscht. Einstellungen bleiben erhalten.",
                "Bu cihazdaki yıldızlar, hazineler ve istatistikler silinir. Ayarlar korunur.",
              )}
            </p>
            <button
              className="primary"
              autoFocus
              onClick={() => setReset(false)}
            >
              {t("Behalten", "Koru")}
            </button>
            <button
              className="danger-button"
              onClick={() => {
                dispatch({ type: "reset" });
                setReset(false);
              }}
            >
              {t("Jetzt zurücksetzen", "Şimdi sıfırla")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
