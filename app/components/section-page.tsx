"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Check, CircleAlert, Download, LockKeyhole, Search, SlidersHorizontal } from "lucide-react";
import { VEHICLE_PLACEHOLDER_IMAGE, hasVehicleScore, type Vehicle } from "@/lib/vehicles";
import { useAuctionVehicles } from "@/hooks/use-auction-vehicles";
import { SiteFooter, SiteHeader } from "@/app/components/site-header";

type Lang = "fr" | "en" | "zh";

const ui = {
  fr: { selection:"Mes favoris", all:"Toutes les enchères", search:"Rechercher", filters:"Filtres", compare:"Comparer", pricing:"Passez à la vitesse supérieure avec LotRank Pro", payment:"Finaliser l’abonnement", saved:"Véhicules enregistrés", loading:"Chargement des enchères…", noResult:"Aucun véhicule trouvé", noAuctions:"Aucune enchère active pour le moment.", unavailable:"Les enchères sont temporairement indisponibles.", loadMore:"Charger plus" },
  en: { selection:"My favorites", all:"All auctions", search:"Search", filters:"Filters", compare:"Compare", pricing:"Move faster with LotRank Pro", payment:"Complete subscription", saved:"Saved vehicles", loading:"Loading auctions…", noResult:"No vehicle found", noAuctions:"There are no active auctions right now.", unavailable:"Auctions are temporarily unavailable.", loadMore:"Load more" },
  zh: { selection:"我的收藏", all:"全部拍卖", search:"搜索", filters:"筛选", compare:"比较", pricing:"使用 LotRank Pro 加速决策", payment:"完成订阅", saved:"已保存车辆", loading:"正在加载拍卖…", noResult:"未找到车辆", noAuctions:"目前没有进行中的拍卖。", unavailable:"拍卖数据暂时不可用。", loadMore:"加载更多" },
} as const;

const AUCTION_PAGE_SIZE = 24;
const href = (path:string,lang:Lang) => `${path}?lang=${lang}`;

function Nav({lang,active}:{lang:Lang;active?:"auctions"|"selection"|"business"|"how"|"pricing"}){
  return <SiteHeader lang={lang} active={active}/>;
}

function PageHead({title,sub,actions}:{title:string;sub:string;actions?:React.ReactNode}){
  return <header className="pageHead"><div className="innerWrap pageHeadInner"><div><h1>{title}</h1><p>{sub}</p></div>{actions}</div></header>;
}

function AuctionRow({v,lang}:{v:Vehicle;lang:Lang}){
  return <article className="auctionRow">
    <div className="auctionThumb"><img src={v.image} alt={`${v.brand} ${v.model}`} referrerPolicy="no-referrer" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=VEHICLE_PLACEHOLDER_IMAGE}}/><span>En cours</span></div>
    <div className="auctionIdentity"><h2>{v.brand} {v.model}</h2><p>{[v.year,v.km!=="—"?v.km:null,v.fuel,v.transmission].filter(Boolean).join(" · ")||"—"}</p></div>
    <div className="auctionPrice"><b>{v.price}</b><small>{v.place}</small></div>
    <div className="auctionTime"><span>{v.time??"—"}</span><small>Temps restant</small></div>
    <Link href={`/vehicle/${v.id}?lang=${lang}`} aria-label={`Voir ${v.brand} ${v.model}`}><ArrowRight/></Link>
  </article>;
}

function Auctions({lang}:{lang:Lang}){
  const {vehicles,mode,hasMore,loadingMore,loadMore}=useAuctionVehicles();
  const t=ui[lang];
  const [brand,setBrand]=useState("Tous");
  const [query,setQuery]=useState("");
  const [visibleCount,setVisibleCount]=useState(AUCTION_PAGE_SIZE);
  const shown=useMemo(()=>vehicles.filter(v=>(brand==="Tous"||v.brand===brand)&&`${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase())),[brand,query,vehicles]);
  const visible=shown.slice(0,visibleCount);
  return <><Nav lang={lang} active="auctions"/><PageHead title={t.all} sub="Découvrez toutes les enchères en cours mises à jour en temps réel."/><main className="pageSurface auctionsPage"><div className="innerWrap auctionLayout">
    <aside className="filterRail"><h2><SlidersHorizontal/> {t.filters}</h2><label>Marque<select value={brand} onChange={event=>{setBrand(event.target.value);setVisibleCount(AUCTION_PAGE_SIZE)}}>{["Tous","BMW","Mercedes","Audi","Peugeot","Renault"].map(value=><option key={value}>{value}</option>)}</select></label><p className="filterNote">Les annonces affichées sont les enchères actives disponibles.</p></aside>
    <section className="results"><div className="resultTools"><label><Search/><input aria-label="Rechercher une marque ou un modèle" value={query} onChange={e=>{setQuery(e.target.value);setVisibleCount(AUCTION_PAGE_SIZE)}} placeholder="Rechercher une marque, un modèle…"/></label><div className="brandChips">{["Tous","BMW","Mercedes","Audi","Peugeot","Renault"].map(value=><button className={brand===value?"active":""} aria-pressed={brand===value} onClick={()=>{setBrand(value);setVisibleCount(AUCTION_PAGE_SIZE)}} key={value}>{value}</button>)}</div></div>
      {mode==="loading"?<Loading message={t.loading}/>:<div className="auctionList">{visible.map(v=><AuctionRow key={v.id} v={v} lang={lang}/>)}</div>}
      {(visible.length<shown.length||hasMore)&&<div className="sectionLine"><span>{visible.length} / {shown.length}{hasMore?"+":""}</span><button className="primaryBtn" disabled={loadingMore} onClick={()=>visible.length<shown.length?setVisibleCount(count=>count+AUCTION_PAGE_SIZE):loadMore()}>{loadingMore?t.loading:t.loadMore}</button></div>}
      {mode!=="loading"&&shown.length===0&&!hasMore&&<Empty lang={lang} message={mode==="error"?t.unavailable:mode==="empty"?t.noAuctions:undefined}/>}</section>
  </div></main></>;
}

function Selection({lang}:{lang:Lang}){
  const t=ui[lang];
  return <><Nav lang={lang} active="selection"/><PageHead title={t.selection} sub="Retrouvez ici tous vos véhicules favoris."/><main className="pageSurface selectionPage"><div className="innerWrap">
    <div className="selectionTabs" aria-label="Favoris"><button className="active" type="button">{t.selection}</button><button type="button" disabled>Historique</button></div>
    <div className="sectionLine"><h2>{t.saved}</h2></div><Empty lang={lang} message="Aucun véhicule enregistré pour le moment."/>
  </div></main></>;
}

function Compare({lang}:{lang:Lang}){const t=ui[lang];const {vehicles,mode}=useAuctionVehicles();const list=vehicles.slice(0,3);return <><Nav lang={lang} active="selection"/><PageHead title={t.compare} sub="Les différences importantes en un coup d’œil."/><main className="pageSurface">{list.length?<div className="innerWrap compareTable"><div className="compareLabels">{["Prix actuel","Score LotRank","Risque","Avantage prix","Coût total estimé","Fin de l’enchère"].map(x=><b key={x}>{x}</b>)}</div>{list.map(v=><article key={v.id}><h2>{v.brand} {v.model}</h2><strong>{v.price}</strong><strong>{hasVehicleScore(v.score)?`${v.score}/100`:"—"}</strong><strong aria-label="Risque indisponible">—</strong><strong>{v.gain===null?"—":`${v.gain>0?"+":""}${v.gain}%`}</strong><strong>—</strong><strong>{v.time?.slice(0,5)??"—"}</strong><Link className="primaryBtn" href={`/vehicle/${v.id}?lang=${lang}`}>Voir le véhicule</Link></article>)}</div>:<div className="innerWrap"><Empty lang={lang} message={mode==="error"?t.unavailable:t.noAuctions}/></div>}</main></>;}

function Auth({lang,register}:{lang:Lang;register:boolean}){
  const [status,setStatus]=useState("");
  return <><Nav lang={lang}/><main className="authPage"><form className="authCard" onSubmit={event=>{event.preventDefault();setStatus(register?"L’inscription n’est pas encore disponible.":"La connexion n’est pas encore disponible.")}}>
    <h1>{register?"Inscription":"Connexion"}</h1><p>{register?"Créer votre compte LotRank":"Accédez à votre compte LotRank"}</p>
    {register&&<label>Nom complet<input required autoComplete="name" placeholder="Jean Dupont"/></label>}
    <label>Email<input type="email" required autoComplete="email" placeholder="votre@email.com"/></label><label>Mot de passe<input type="password" required minLength={6} autoComplete={register?"new-password":"current-password"} placeholder="••••••••"/></label>
    <label className="authCheck"><input type="checkbox" required={register}/>{register?"J’accepte les CGU et la Politique de confidentialité":"Se souvenir de moi"}</label><button className="primaryBtn" type="submit">{register?"S’inscrire":"Se connecter"}</button>
    {status&&<p className="formStatus" role="status">{status}</p>}<span>{register?"Déjà un compte ?":"Pas encore de compte ?"} <Link href={href(register?"/login":"/register",lang)}>{register?"Se connecter":"S’inscrire"}</Link></span>
  </form></main></>;
}

function Pricing({lang}:{lang:Lang}){
  const t=ui[lang];
  const plans=[{n:"GRATUIT",p:"0 €",f:["Score LotRank","Résumé du marché","Suivi de 5 véhicules"]},{n:"PRO",p:"14,99 € / mois",f:["Coût total","Historique 90 jours","Alertes prioritaires"]},{n:"BUSINESS",p:"49 € / mois",f:["Rapports complets","Exports","Filtres professionnels"]}];
  return <><Nav lang={lang} active="pricing"/><PageHead title={t.pricing} sub="Plus d’outils, plus de données, plus de succès."/><main className="pageSurface pricingPage"><div className="innerWrap pricingShell">
    <div className="billingToggle" aria-label="Période de facturation"><button className="active" type="button">Mensuel</button><button type="button" disabled>Annuel</button></div>
    <div className="pricingGrid">{plans.map((plan,index)=><article className={index===1?"featured":""} key={plan.n}><span>{plan.n}</span><h2>{plan.p}</h2><ul>{plan.f.map(item=><li key={item}><Check/>{item}</li>)}</ul>{index===0?<Link className="outlineBtn" href={href("/selection",lang)}>Continuer gratuitement</Link>:<button className={index===2?"businessBtn":"primaryBtn"} type="button" disabled>Choisir {plan.n} · bientôt disponible</button>}</article>)}</div>
  </div></main></>;
}

function Checkout({lang}:{lang:Lang}){const t=ui[lang];return <><Nav lang={lang} active="pricing"/><PageHead title={t.payment} sub="Souscription LotRank"/><main className="pageSurface"><div className="innerWrap"><div className="emptyState"><LockKeyhole/><h2>La souscription en ligne n’est pas encore disponible.</h2><p>Aucun paiement ne sera demandé et aucun abonnement ne sera activé.</p><Link className="outlineBtn" href={href("/pricing",lang)}>Retour aux offres</Link></div></div></main></>;}

function Business({lang}:{lang:Lang}){
  const {vehicles,mode}=useAuctionVehicles(); const scored=vehicles.filter(vehicle=>hasVehicleScore(vehicle.score)); const average=scored.length?Math.round(scored.reduce((sum,vehicle)=>sum+(vehicle.score??0),0)/scored.length):null;
  return <><Nav lang={lang} active="business"/><PageHead title="Analyses du marché" sub="Découvrez les tendances et statistiques du marché des enchères automobiles." actions={<div className="pageHeadActions"><button className="outlineBtn" type="button" disabled>12 derniers mois</button><button className="outlineBtn" type="button" disabled><Download/>Exporter</button></div>}/><main className="pageSurface businessPage"><div className="innerWrap businessAnalysis">
    <div className="businessMetrics"><div><span>Véhicules actifs</span><b>{vehicles.length||"—"}</b></div><div><span>Véhicules analysés</span><b>{scored.length||"—"}</b></div><div><span>Score moyen</span><b>{average??"—"}</b></div><div><span>Données</span><b>{mode==="live"?"À jour":"—"}</b></div></div>
    <article className="marketChart"><h2>Répartition des scores LotRank</h2>{scored.length?<><p className="sr-only">{scored.length} véhicules analysés. Score moyen : {average??"—"} sur 100.</p><div aria-hidden="true">{scored.slice(0,20).map((vehicle,index)=><i style={{height:`${Math.max(12,vehicle.score??0)}%`}} key={`${vehicle.id}-${index}`}/>)}</div></>:<p>Aucune donnée d’analyse disponible pour le moment.</p>}</article>
    <footer className="lockedReport"><LockKeyhole/><span>Rapports détaillés réservés à Business · souscription bientôt disponible</span><Link className="primaryBtn" href={href("/pricing",lang)}>Voir les offres</Link></footer>
  </div></main></>;
}

function Sources({lang}:{lang:Lang}){return <><Nav lang={lang}/><PageHead title="Sources de données" sub="Couverture des données analysées par LotRank."/><main className="pageSurface"><div className="innerWrap"><Empty lang={lang} message="Les informations de source sont disponibles avec les annonces actives."/></div></main></>;}
function How({lang}:{lang:Lang}){return <><Nav lang={lang} active="how"/><PageHead title="Comment fonctionne LotRank ?" sub="De la donnée brute à une décision plus claire."/><main className="pageSurface"><div className="innerWrap"><div className="steps">{[["01","Collecte","Enchères et annonces"],["02","Nettoyage","Doublons et qualité"],["03","Analyse","Prix, risque, demande"],["04","Score LotRank","Décision lisible"]].map(item=><article key={item[0]}><b>{item[0]}</b><h2>{item[1]}</h2><p>{item[2]}</p></article>)}</div></div></main></>;}

function Empty({lang,message}:{lang:Lang;message?:string}){return <div className="emptyState"><CircleAlert/><h2>{message??ui[lang].noResult}</h2>{!message&&<p>Vérifiez l’orthographe ou supprimez un filtre.</p>}<Link className="primaryBtn" href={href("/auctions",lang)}>Voir toutes les enchères</Link></div>;}
function Loading({message}:{message:string}){return <div className="emptyState" role="status" aria-live="polite"><h2>{message}</h2></div>;}

function SearchPage({lang,initialQuery}:{lang:Lang;initialQuery:string}){const router=useRouter();const {vehicles,mode,hasMore,loadingMore,loadMore}=useAuctionVehicles();const [q,setQ]=useState(initialQuery);const results=vehicles.filter(v=>`${v.brand} ${v.model}`.toLowerCase().includes(q.trim().toLowerCase()));return <><Nav lang={lang} active="auctions"/><PageHead title="Résultats de recherche" sub="La recherche reste visible et modifiable."/><main className="pageSurface"><div className="innerWrap"><form className="searchBar" onSubmit={e=>{e.preventDefault();router.push(`/search?lang=${lang}&q=${encodeURIComponent(q)}`)}}><Search/><input aria-label="Rechercher une marque ou un modèle" value={q} onChange={e=>setQ(e.target.value)} placeholder="Marque ou modèle"/><button className="primaryBtn">{ui[lang].search}</button></form>{mode==="loading"?<Loading message={ui[lang].loading}/>:results.length?<div className="auctionList">{results.map(v=><AuctionRow v={v} lang={lang} key={v.id}/>)}</div>:!hasMore&&<Empty lang={lang} message={mode==="error"?ui[lang].unavailable:mode==="empty"?ui[lang].noAuctions:undefined}/>} {hasMore&&<div className="sectionLine"><span>{results.length} résultat(s)</span><button className="primaryBtn" disabled={loadingMore} onClick={loadMore}>{loadingMore?ui[lang].loading:ui[lang].loadMore}</button></div>}</div></main></>;}

export function SectionPage({section,lang,initialQuery}:{section:string;lang:Lang;initialQuery:string}){
  let page; if(section==="auctions")page=<Auctions lang={lang}/>; else if(section==="selection")page=<Selection lang={lang}/>; else if(section==="compare")page=<Compare lang={lang}/>; else if(section==="login"||section==="register")page=<Auth lang={lang} register={section==="register"}/>; else if(section==="pricing")page=<Pricing lang={lang}/>; else if(section==="checkout")page=<Checkout lang={lang}/>; else if(section==="business")page=<Business lang={lang}/>; else if(section==="sources")page=<Sources lang={lang}/>; else if(section==="how")page=<How lang={lang}/>; else page=<SearchPage lang={lang} initialQuery={initialQuery}/>; return <>{page}<SiteFooter lang={lang}/></>;
}
