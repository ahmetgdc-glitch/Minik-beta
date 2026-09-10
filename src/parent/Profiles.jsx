import React, {useState} from "react";
import { Plus, Trash2, Check, Pencil, Star, Gamepad2, Sparkles } from "lucide-react";
import { addProfile, deleteProfile, switchProfile, updateProfile } from "../progress/store.js";
import { AGE_GROUPS } from "../learning/age.js";
import { Mino } from "../components/Visual.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useModalSafety } from "../app/useModalSafety.js";

export default function Profiles({progress,onNavigate,onChoose,chooserOnly=false}){
  const lang=progress.settings.lang, t=(de,tr)=>lang==="tr"?tr:de;
  const [creating,setCreating]=useState(false), [name,setName]=useState(""), [deleteTarget,setDeleteTarget]=useState(null);
  const [avatar,setAvatar]=useState("🐠"), [ageGroup,setAgeGroup]=useState("4-5"), [editing,setEditing]=useState(null), [editName,setEditName]=useState(""), [editAvatar,setEditAvatar]=useState("🐠"), [editAgeGroup,setEditAgeGroup]=useState("4-5");
  const full=progress.profiles.length>=progress.maxProfiles;
  useModalSafety(creating, ()=>setCreating(false));
  function choose(id){switchProfile(id);onChoose?.(id);if(!onChoose)onNavigate?.("/")}
  function create(){ const id=addProfile({name,avatar,ageGroup}); if(id){setCreating(false);setName("");onChoose?.(id);if(!onChoose)onNavigate?.("/");} }
  function beginEdit(p){setEditing(p.id);setEditName(p.name);setEditAvatar(p.avatar);setEditAgeGroup(p.ageGroup||"4-5")}
  function saveEdit(e,p){e.preventDefault();updateProfile(p.id,{name:editName,avatar:editAvatar,ageGroup:editAgeGroup});setEditing(null)}
  return <section className={`profiles-screen ${chooserOnly?"chooser-only":""}`}>
    <div className="profiles-hero"><Mino/><div><span className="eyebrow">{t("Für jedes Kind ein eigener Lernweg","Her çocuk için ayrı öğrenme yolu")}</span><h1>{t("Wer spielt heute?","Bugün kim oynuyor?")}</h1><p>{t("Jedes Kind behält seine eigenen Sterne, Lernfortschritte, Belohnungen und Einstellungen.","Her çocuk kendi yıldızlarını, ilerlemesini, ödüllerini ve ayarlarını korur.")}</p></div></div>
    <div className="profile-grid">
      {progress.profiles.map(p=>{
        const active=p.id===progress.activeProfileId;
        return <article className={`profile-card ${active?"active":""}`} key={p.id}>
          <button className="profile-main" onClick={()=>choose(p.id)}>
            <span className="profile-avatar">{p.avatar}</span>
            <b>{p.name}</b>
            <div className="profile-mini-stats" aria-label={t("Profilfortschritt","Profil ilerlemesi")}>
              <span><Star size={15} fill="currentColor"/>{p.stars||0}</span>
              <span><Gamepad2 size={15}/>{p.sessions||0}</span>
              <span><Sparkles size={15}/>{p.learned||0}</span>
            </div>
            <small>{t(`${p.ageGroup||"4-5"} Jahre`, `${p.ageGroup||"4-5"} yaş`)} · {active?t("Zuletzt aktiv","Son aktif"):t("Zum Spielen antippen","Oynamak için dokun")}</small>
            {active&&<span className="profile-check"><Check size={17}/></span>}
          </button>
          {!chooserOnly&&<div className="profile-actions">
            <button onClick={()=>beginEdit(p)} aria-label={t("Profil bearbeiten","Profili düzenle")}><Pencil size={18}/></button>
            {progress.profiles.length>1&&<button onClick={()=>setDeleteTarget(p)} aria-label={t("Profil löschen","Profili sil")}><Trash2 size={18}/></button>}
          </div>}
          {editing===p.id&&<form className="profile-edit profile-edit-rich" onSubmit={e=>saveEdit(e,p)}>
            <input value={editName} maxLength={18} onChange={e=>setEditName(e.target.value)} autoFocus/>
            <div className="avatar-picker compact">{progress.profileAvatars.map(a=><button type="button" key={a} className={editAvatar===a?"chosen":""} onClick={()=>setEditAvatar(a)}>{a}</button>)}</div>
            <div className="age-picker compact" aria-label={t("Altersstufe","Yaş grubu")}>{AGE_GROUPS.map(g=><button type="button" key={g} className={editAgeGroup===g?"chosen":""} onClick={()=>setEditAgeGroup(g)}>{g} {t("J.","yaş")}</button>)}</div>
            <div className="profile-edit-buttons"><button type="button" className="secondary" onClick={()=>setEditing(null)}>{t("Abbrechen","İptal")}</button><button className="primary">{t("Speichern","Kaydet")}</button></div>
          </form>}
        </article>
      })}
      {!chooserOnly&&!full&&<button className="profile-card add-profile" onClick={()=>setCreating(true)}><span className="profile-avatar"><Plus size={45}/></span><b>{t("Kind hinzufügen","Çocuk ekle")}</b><small>{t("Neuer eigener Lernstand","Yeni ayrı ilerleme")}</small></button>}
    </div>
    {!chooserOnly&&creating&&<div className="profile-modal-backdrop" onClick={()=>setCreating(false)}><div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="create-profile-title" onClick={e=>e.stopPropagation()}><h2 id="create-profile-title">{t("Neues Kinderprofil","Yeni çocuk profili")}</h2><label>{t("Name oder Spitzname","Ad veya takma ad")}<input value={name} maxLength={18} onChange={e=>setName(e.target.value)} placeholder={t("z. B. Emir","örn. Emir")} autoFocus/></label><div className="avatar-picker">{progress.profileAvatars.map(a=><button type="button" key={a} className={avatar===a?"chosen":""} onClick={()=>setAvatar(a)}>{a}</button>)}</div><label>{t("Altersstufe","Yaş grubu")}<div className="age-picker">{AGE_GROUPS.map(g=><button type="button" key={g} className={ageGroup===g?"chosen":""} onClick={()=>setAgeGroup(g)}>{g} {t("Jahre","yaş")}</button>)}</div></label><div className="modal-actions"><button className="secondary" onClick={()=>setCreating(false)}>{t("Abbrechen","İptal")}</button><button className="primary" onClick={create}>{t("Profil erstellen","Profil oluştur")}</button></div></div></div>}
    {!chooserOnly&&<ConfirmDialog
      open={Boolean(deleteTarget)}
      title={t("Profil löschen?","Profil silinsin mi?")}
      message={deleteTarget ? t(`${deleteTarget.name} wirklich löschen? Der Lernfortschritt dieses Profils wird dauerhaft gelöscht.`, `${deleteTarget.name} silinsin mi? Bu profilin ilerlemesi kalıcı olarak silinecek.`) : ""}
      confirmLabel={t("Profil löschen","Profili sil")}
      cancelLabel={t("Abbrechen","İptal")}
      danger
      onCancel={()=>setDeleteTarget(null)}
      onConfirm={()=>{ if(deleteTarget){ deleteProfile(deleteTarget.id); setDeleteTarget(null); } }}
    />}
    {!chooserOnly&&<p className="profile-limit">{progress.profiles.length} / {progress.maxProfiles} {t("Profile","profil")}</p>}
  </section>
}
