"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Bell, Check, CheckCircle2, ChevronDown, CircleAlert,
  Crown, Download, Euro, Filter, Globe2, LockKeyhole, MapPin, Search,
  ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, X
} from "lucide-react";
import { VEHICLE_PLACEHOLDER_IMAGE, hasVehicleScore, type Vehicle } from "@/lib/vehicles";
import { useAuctionVehicles } from "@/hooks/use-auction-vehicles";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Lang = "fr" | "en" | "zh";

const ui = {
  fr: { auctions:"Enchères", selection:"Ma sélection", business:"Rapports Business", sources:"Sources", how:"Comment ça marche ?", login:"Connexion", all:"Toutes les enchères", search:"Rechercher", filters:"Filtres", compare:"Comparer", pricing:"Choisissez votre formule", payment:"Finaliser l’abonnement", saved:"Véhicules enregistrés", noResult:"Aucun véhicule trouvé", noAuctions:"Aucune enchère active pour le moment.", unavailable:"Les enchères sont temporairement indisponibles." },
  en: { auctions:"Auctions", selection:"Watchlist", business:"Business reports", sources:"Sources", how:"How it works", login:"Log in", all:"All auctions", search:"Search", filters:"Filters", compare:"Compare", pricing:"Choose your plan", payment:"Complete subscription", saved:"Saved vehicles", noResult:"No vehicle found", noAuctions:"There are no active auctions right now.", unavailable:"Auctions are temporarily unavailable." },
  zh: { auctions:"拍卖", selection:"关注列表", business:"商业报告", sources:"数据源", how:"工作原理", login:"登录", all:"全部拍卖", search:"搜索", filters:"筛选", compare:"比较", pricing:"选择方案", payment:"完成订阅", saved:"已保存车辆", noResult:"未找到车辆", noAuctions:"目前没有进行中的拍卖。", unavailable:"拍卖数据暂时不可用。" },
} as const;

function href(path:string,lang:Lang){ return `${path}?lang=${lang}`; }

function Nav({lang,active}:{lang:Lang;active?:string}){
  const router=useRouter(); const t=ui[lang];
  return <nav className="innerNav"><div className="innerWrap navRow">
    <Link className="logo" href={href("/",lang)}><BarChart3/>LotRank</Link>
    <div className="innerLinks">
      <Link className={active==="auctions"?"active":""} href={href("/auctions",lang)}>{t.auctions}</Link>
      <Link className={active==="selection"?"active":""} href={href("/selection",lang)}>{t.selection}</Link>
      <Link className={active==="business"?"active":""} href={href("/business",lang)}>{t.business}</Link>
      <Link className={active==="sources"?"active":""} href={href("/sources",lang)}>{t.sources}</Link>
      <Link className={active==="how"?"active":""} href={href("/how",lang)}>{t.how}</Link>
    </div>
    <div className="innerActions"><label><Globe2/><select value={lang} onChange={e=>router.push(`${location.pathname}?lang=${e.target.value}`)}><option value="fr">FR</option><option value="en">EN</option><option value="zh">中文</option></select><ChevronDown/></label><Link className="lightBtn" href={href("/login",lang)}>{t.login}</Link></div>
  </div></nav>;
}

function PageHead({title,sub}:{title:string;sub:string}){return <header className="pageHead"><div className="innerWrap"><h1>{title}</h1><p>{sub}</p></div></header>}

function VehicleCard({v,lang,selected,onSelect}:{v:Vehicle;lang:Lang;selected?:boolean;onSelect?:()=>void}){
  return <article className="listCar"><div className="listPhoto"><img src={v.image} alt={`${v.brand} ${v.model}`} onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=VEHICLE_PLACEHOLDER_IMAGE}}/>{hasVehicleScore(v.score)&&<em>LotRank {v.score}</em>}<span>● LIVE</span>{onSelect&&<button aria-label="Select" className={selected?"pick active":"pick"} onClick={onSelect}>{selected?<Check/>:<span/>}</button>}</div><div className="listBody"><h3>{v.brand} {v.model}</h3><p>{[v.year,v.km!=="—"?v.km:null,v.fuel,v.transmission].filter(Boolean).join(" · ")||"—"}</p><footer><span><MapPin/>{v.place}</span><b>{v.price}</b></footer><Link href={`/vehicle/${v.id}?lang=${lang}`}>Voir l’analyse <ArrowRight/></Link></div></article>
}

function Auctions({lang}:{lang:Lang}){
  const {vehicles,mode}=useAuctionVehicles();
  const t=ui[lang]; const [brand,setBrand]=useState("Tous"); const [query,setQuery]=useState("");
  const shown=useMemo(()=>vehicles.filter(v=>(brand==="Tous"||v.brand===brand)&&`${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase())),[brand,query,vehicles]);
  return <><Nav lang={lang} active="auctions"/><PageHead title={t.all} sub="Comparez les lots actifs et repérez les meilleures opportunités."/><main className="pageSurface"><div className="innerWrap auctionLayout"><aside className="filterRail"><h2><SlidersHorizontal/> {t.filters}</h2>{["Marque","Modèle","Prix maximum","Année","Kilométrage","Région","Statut"].map(x=><label key={x}>{x}<select><option>Tous</option></select></label>)}<button>Appliquer</button></aside><section className="results"><div className="resultTools"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Marque, modèle ou ville"/></label><div className="brandChips">{["Tous","BMW","Mercedes","Audi","Peugeot","Renault"].map(x=><button className={brand===x?"active":""} onClick={()=>setBrand(x)} key={x}>{x}</button>)}</div><Sheet><SheetTrigger asChild><button className="outlineBtn"><Filter/>{t.filters}</button></SheetTrigger><SheetContent className="lotSheet"><SheetHeader><SheetTitle>{t.filters}</SheetTitle><SheetDescription>Affinez les véhicules affichés.</SheetDescription></SheetHeader><div className="sheetFields">{["Marque","Prix","Année","Kilométrage","Région","Statut"].map((x,i)=><label key={x}>{x}<input defaultValue={i===0?"BMW":i===1?"€10 000 — €25 000":"Tous"}/></label>)}</div><SheetFooter><button className="primaryBtn">Afficher 214 résultats</button></SheetFooter></SheetContent></Sheet></div><div className="resultCount"><b>{shown.length || 0} véhicules</b><span>BMW × &nbsp; LIVE × &nbsp; &lt; €25k ×</span></div><div className="vehicleGrid">{shown.map(v=><VehicleCard key={v.id} v={v} lang={lang}/>)}</div>{shown.length===0&&<Empty lang={lang} message={mode==="error"?t.unavailable:mode==="empty"?t.noAuctions:undefined}/>}</section></div></main></>;
}

function Selection({lang}:{lang:Lang}){
  const {vehicles}=useAuctionVehicles();
  const t=ui[lang]; const [selected,setSelected]=useState<string[]>([]);
  const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  return <><Nav lang={lang} active="selection"/><PageHead title={t.selection} sub="Suivez vos véhicules, leurs prix et les échéances."/><main className="pageSurface"><div className="innerWrap"><div className="metrics">{[["12",t.saved],["3","Se terminent bientôt"],["2","Baisses de prix"],[String(selected.length),"Prêts à comparer"]].map(([a,b])=><div key={b}><b>{a}</b><span>{b}</span></div>)}</div><div className="sectionLine"><h2>{t.saved}</h2><Link className={selected.length<2?"primaryBtn disabled":"primaryBtn"} href={selected.length<2?"#":href("/compare",lang)}>{t.compare} ({selected.length})</Link></div><div className="vehicleGrid four">{vehicles.slice(0,4).map(v=><VehicleCard key={v.id} v={v} lang={lang} selected={selected.includes(v.id)} onSelect={()=>toggle(v.id)}/>)}</div></div></main></>;
}

function Compare({lang}:{lang:Lang}){const t=ui[lang];const {vehicles,mode}=useAuctionVehicles();const list=vehicles.slice(0,3);return <><Nav lang={lang} active="selection"/><PageHead title={t.compare} sub="Les différences importantes en un coup d’œil."/><main className="pageSurface">{list.length?<div className="innerWrap compareTable"><div className="compareLabels">{["Prix actuel","Score LotRank","Risque","Avantage prix","Coût total estimé","Fin de l’enchère"].map(x=><b key={x}>{x}</b>)}</div>{list.map(v=><article key={v.id}><h2>{v.brand} {v.model}</h2><strong>{v.price}</strong><strong>{hasVehicleScore(v.score)?`${v.score}/100`:"—"}</strong><strong>{hasVehicleScore(v.score)?v.score>85?"Faible":"Moyen":"—"}</strong><strong>{v.gain===null?"—":`${v.gain>0?"+":""}${v.gain}%`}</strong><strong>—</strong><strong>{v.time?.slice(0,5)??"—"}</strong><Link className="primaryBtn" href={`/vehicle/${v.id}?lang=${lang}`}>Voir le véhicule</Link></article>)}</div>:<div className="innerWrap"><Empty lang={lang} message={mode==="error"?t.unavailable:t.noAuctions}/></div>}</main></>}

function Auth({lang,register}:{lang:Lang;register:boolean}){const router=useRouter();return <main className="authPage"><section className="authBrand"><Link className="logo" href={href("/",lang)}><BarChart3/>LotRank</Link><div><small>ACCÈS PERSONNEL</small><h1>Repérez les bonnes enchères.<br/>Suivez les prix.<br/>Décidez plus vite.</h1><p>Votre sélection, vos alertes et vos analyses réunies au même endroit.</p></div></section><form className="authCard" onSubmit={e=>{e.preventDefault();router.push(href("/selection",lang))}}><h1>{register?"Créer un compte":"Bon retour"}</h1><p>{register?"Commencez à suivre vos opportunités.":"Connectez-vous à votre espace LotRank."}</p>{register&&<label>Nom complet<input required defaultValue="Jean Dupont"/></label>}<label>Adresse e-mail<input type="email" required placeholder="nom@exemple.fr"/></label><label>Mot de passe<input type="password" required minLength={6} placeholder="••••••••"/></label><button className="primaryBtn" type="submit">{register?"Créer mon compte":"Se connecter"}</button><Link href={href(register?"/login":"/register",lang)}>{register?"Déjà membre ? Se connecter":"Nouveau ? Créer un compte"}</Link></form></main>}

function Pricing({lang}:{lang:Lang}){const t=ui[lang];const plans=[{n:"GRATUIT",p:"0 €",f:["Score LotRank","Résumé du marché","Suivi de 5 véhicules"]},{n:"PRO",p:"14,99 € / mois",f:["Coût total","Historique 90 jours","Alertes prioritaires"]},{n:"BUSINESS",p:"49 € / mois",f:["Rapports complets","Exports","Filtres professionnels"]}];return <><Nav lang={lang} active="business"/><PageHead title={t.pricing} sub="Débloquez les outils adaptés à votre usage."/><main className="pageSurface"><div className="innerWrap pricingGrid">{plans.map((p,i)=><article className={i===1?"featured":""} key={p.n}><span>{p.n}</span><h2>{p.p}</h2><ul>{p.f.map(x=><li key={x}><Check/>{x}</li>)}</ul><Link className={i===2?"businessBtn":i===1?"primaryBtn":"outlineBtn"} href={i===0?href("/selection",lang):href("/checkout",lang)}>{i===0?"Continuer gratuitement":`Choisir ${p.n}`}</Link></article>)}</div></main></>}

function Checkout({lang}:{lang:Lang}){const t=ui[lang];const router=useRouter();return <><Nav lang={lang} active="business"/><PageHead title={t.payment} sub="Paiement sécurisé · LotRank PRO"/><main className="pageSurface"><div className="innerWrap checkout"><form onSubmit={e=>{e.preventDefault();router.push(href("/business",lang))}}><h2>Informations de paiement</h2><label>Nom sur la carte<input required defaultValue="Jean Dupont"/></label><label>Numéro de carte<input inputMode="numeric" required defaultValue="4242 4242 4242 4242"/></label><div><label>Expiration<input required defaultValue="09 / 29"/></label><label>CVC<input required defaultValue="123"/></label></div><button className="primaryBtn">Payer et activer PRO</button></form><aside><ShieldCheck/><h2>Votre commande</h2><b>LotRank PRO</b><strong>14,99 € / mois</strong><p>✓ Sans engagement<br/>✓ Annulation à tout moment<br/>✓ Accès immédiat</p></aside></div></main></>}

function Business({lang}:{lang:Lang}){const [unlocked,setUnlocked]=useState(false);return <><Nav lang={lang} active="business"/><PageHead title="Rapports du marché" sub="Analyses décisionnelles pour les professionnels."/><main className="pageSurface"><div className="innerWrap businessDash"><aside><b>BIBLIOTHÈQUE</b>{["Vue du marché","Analyse des enchères","Précision","Analyse régionale","Exports"].map(x=><button key={x}>{x}</button>)}</aside><section><div className="businessMetrics">{[["€22,4k","Prix médian"],["+8,7%","Marge moyenne"],["91%","Précision"]].map(([a,b])=><div key={b}><b>{a}</b><span>{b}</span></div>)}</div><article className="marketChart"><h2>Tendance du marché</h2><div>{[24,31,35,42,51,47,61,69,65,78].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div></article><footer className={unlocked?"unlocked":"lockedReport"}>{unlocked?<><span>Segments en hausse : SUV +12,4%</span><button className="outlineBtn"><Download/>Exporter le rapport</button></>:<><LockKeyhole/><span>Rapports détaillés réservés à Business</span><button className="businessBtn" onClick={()=>setUnlocked(true)}>Découvrir Business</button></>}</footer></section></div></main></>}

function Sources({lang}:{lang:Lang}){const rows=[["Enchères France","Active","Il y a 2 min","96%"],["AutoBid Europe","Active","Il y a 6 min","88%"],["Fleet Market","Retardée","Il y a 47 min","74%"],["Nord Auto","Maintenance","Hier, 23:40","61%"]];return <><Nav lang={lang} active="sources"/><PageHead title="Sources de données" sub="Couverture et fraîcheur des sources analysées par LotRank."/><main className="pageSurface"><div className="innerWrap"><div className="metrics threeMetrics"><div><b>18</b><span>Sources actives</span></div><div><b>2 min</b><span>Dernière synchro</span></div><div><b>94%</b><span>Couverture moyenne</span></div></div><div className="sourceTable">{rows.map(r=><div key={r[0]}><b>{r[0]}</b><span className={r[1]}>{r[1]}</span><span>{r[2]}</span><strong>{r[3]}</strong></div>)}</div></div></main></>}

function How({lang}:{lang:Lang}){return <><Nav lang={lang} active="how"/><PageHead title="Comment fonctionne LotRank ?" sub="De la donnée brute à une décision plus claire."/><main className="pageSurface"><div className="innerWrap"><div className="steps">{[["01","Collecte","Enchères et annonces"],["02","Nettoyage","Doublons et qualité"],["03","Analyse","Prix, risque, demande"],["04","Score LotRank","Décision lisible"]].map((x,i)=><article className={i===0||i===3?"dark":""} key={x[0]}><b>{x[0]}</b><h2>{x[1]}</h2><p>{x[2]}</p></article>)}</div><div className="howNotes"><article><h2>Une méthode transparente</h2><p>✓ Sources visibles<br/>✓ Mise à jour indiquée<br/>✓ Risques expliqués</p></article><article><h2>Un score, pas une promesse</h2><p>Le score facilite la comparaison. Le résultat final d’une enchère reste variable.</p></article></div></div></main></>}

function Empty({lang,message}:{lang:Lang;message?:string}){return <div className="emptyState"><CircleAlert/><h2>{message??ui[lang].noResult}</h2>{!message&&<p>Vérifiez l’orthographe ou supprimez un filtre.</p>}<Link className="primaryBtn" href={href("/auctions",lang)}>Voir toutes les enchères</Link></div>}

function SearchPage({lang,initialQuery}:{lang:Lang;initialQuery:string}){const router=useRouter();const {vehicles,mode}=useAuctionVehicles();const [q,setQ]=useState(initialQuery);const results=vehicles.filter(v=>`${v.brand} ${v.model}`.toLowerCase().includes(q.trim().toLowerCase()));return <><Nav lang={lang} active="auctions"/><PageHead title="Résultats de recherche" sub="La recherche reste visible et modifiable."/><main className="pageSurface"><div className="innerWrap"><form className="searchBar" onSubmit={e=>{e.preventDefault();router.push(`/search?lang=${lang}&q=${encodeURIComponent(q)}`)}}><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Marque ou modèle"/><button className="primaryBtn">Rechercher</button></form><div className="sectionLine"><h2>{results.length} résultat{results.length!==1?"s":""}</h2></div>{results.length?<div className="vehicleGrid">{results.map(v=><VehicleCard v={v} lang={lang} key={v.id}/>)}</div>:<Empty lang={lang} message={mode==="error"?ui[lang].unavailable:mode==="empty"?ui[lang].noAuctions:undefined}/>}</div></main></>}

export function SectionPage({section,lang,initialQuery}:{section:string;lang:Lang;initialQuery:string}){
  if(section==="auctions")return <Auctions lang={lang}/>;
  if(section==="selection")return <Selection lang={lang}/>;
  if(section==="compare")return <Compare lang={lang}/>;
  if(section==="login"||section==="register")return <Auth lang={lang} register={section==="register"}/>;
  if(section==="pricing")return <Pricing lang={lang}/>;
  if(section==="checkout")return <Checkout lang={lang}/>;
  if(section==="business")return <Business lang={lang}/>;
  if(section==="sources")return <Sources lang={lang}/>;
  if(section==="how")return <How lang={lang}/>;
  return <SearchPage lang={lang} initialQuery={initialQuery}/>;
}
