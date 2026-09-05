"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BarChart3, ChevronDown, Globe2, Menu, X } from "lucide-react";

export type SiteLang = "fr" | "en" | "zh";

const labels = {
  fr: { home:"Accueil", auctions:"Toutes les enchères", business:"Analyses", selection:"Favoris", login:"Se connecter", signup:"S’inscrire" },
  en: { home:"Home", auctions:"All auctions", business:"Analysis", selection:"Favorites", login:"Log in", signup:"Sign up" },
  zh: { home:"首页", auctions:"全部拍卖", business:"分析", selection:"收藏", login:"登录", signup:"注册" },
} as const;

const route = (path:string,lang:SiteLang) => `${path}?lang=${lang}`;

export function SiteHeader({lang,active,onLanguageChange}:{lang:SiteLang;active?:"home"|"auctions"|"selection"|"business";onLanguageChange?:(lang:SiteLang)=>void}){
  const router=useRouter();
  const t=labels[lang];
  const [menuOpen,setMenuOpen]=useState(false);
  const menuButton=useRef<HTMLButtonElement>(null);
  const changeLanguage=(next:SiteLang)=>{
    setMenuOpen(false);
    if(onLanguageChange)onLanguageChange(next);
    const params=new URLSearchParams(location.search);
    params.set("lang",next);
    router.push(`${location.pathname}?${params.toString()}`);
  };
  useEffect(()=>{document.documentElement.lang=lang},[lang]);
  useEffect(()=>{
    if(!menuOpen)return;
    const closeOnEscape=(event:KeyboardEvent)=>{
      if(event.key!=="Escape")return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown",closeOnEscape);
    return ()=>document.removeEventListener("keydown",closeOnEscape);
  },[menuOpen]);

  const navLinks=(className:string)=><nav className={className} aria-label={className==="siteNav"?"Navigation principale":"Navigation mobile"}>
    <Link onClick={()=>setMenuOpen(false)} className={active==="home"?"active":""} aria-current={active==="home"?"page":undefined} href={route("/",lang)}>{t.home}</Link>
    <Link onClick={()=>setMenuOpen(false)} className={active==="auctions"?"active":""} aria-current={active==="auctions"?"page":undefined} href={route("/auctions",lang)}>{t.auctions}</Link>
    <Link onClick={()=>setMenuOpen(false)} className={active==="business"?"active":""} aria-current={active==="business"?"page":undefined} href={route("/business",lang)}>{t.business}</Link>
    <Link onClick={()=>setMenuOpen(false)} className={active==="selection"?"active":""} aria-current={active==="selection"?"page":undefined} href={route("/selection",lang)}>{t.selection}</Link>
  </nav>;

  return <header className="siteHeader"><div className="siteHeaderInner">
    <Link className="logo" href={route("/",lang)}><BarChart3/><span>LotRank</span></Link>
    {navLinks("siteNav")}
    <div className="siteActions">
      <label className="siteLanguage"><Globe2/><select aria-label="Language" value={lang} onChange={event=>changeLanguage(event.target.value as SiteLang)}><option value="fr">FR</option><option value="en">EN</option><option value="zh">中文</option></select><ChevronDown/></label>
      <Link className="siteLogin" href={route("/login",lang)}>{t.login}</Link>
      <Link className="siteSignup" href={route("/register",lang)}>{t.signup}</Link>
      <button ref={menuButton} className="mobileNavToggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen?"Fermer le menu":"Ouvrir le menu"} onClick={()=>setMenuOpen(open=>!open)}>{menuOpen?<X/>:<Menu/>}</button>
    </div>
    {menuOpen&&<div id="mobile-navigation" className="mobileNavPanel">{navLinks("mobileNavLinks")}<div className="mobileAccountLinks"><Link onClick={()=>setMenuOpen(false)} href={route("/login",lang)}>{t.login}</Link><Link onClick={()=>setMenuOpen(false)} className="siteSignup" href={route("/register",lang)}>{t.signup}</Link></div></div>}
  </div></header>;
}

export function SiteFooter({lang}:{lang?:SiteLang}){
  const searchParams=useSearchParams();
  const requestedLang=searchParams.get("lang");
  const footerLang=lang??(requestedLang==="en"||requestedLang==="zh"?requestedLang:"fr");
  return <footer className="siteFooter"><div className="siteFooterInner">
    <section className="footerBrand"><Link className="logo" href={route("/",footerLang)}><BarChart3/><span>LotRank</span><small>PRO</small></Link><p>La plateforme d’analyse des enchères auto la plus avancée.</p><span className="socialLinks">𝕏&nbsp;&nbsp; in&nbsp;&nbsp; ▶&nbsp;&nbsp; ✉</span><small>© 2026 LotRank. Tous droits réservés.</small></section>
    <section><b>Plateforme</b><Link href={route("/auctions",footerLang)}>Toutes les enchères</Link><Link href={route("/business",footerLang)}>Analyse du marché</Link><Link href={route("/selection",footerLang)}>Favoris</Link><Link href={route("/how",footerLang)}>Méthodologie</Link></section>
    <section><b>Ressources</b><span aria-disabled="true">FAQ</span><Link href={route("/sources",footerLang)}>Guides</Link><span aria-disabled="true">Blog</span><span aria-disabled="true">Contact</span></section>
    <section><b>Légal</b><span>Conditions d’utilisation</span><span>Politique de confidentialité</span><span>Mentions légales</span></section>
    <section className="footerTrust"><b>Sources et partenaires</b><p>Les sources disponibles sont indiquées sur chaque annonce active.</p></section>
  </div></footer>;
}
