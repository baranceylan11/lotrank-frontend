"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, CarFront, Crown, Database, Filter, Search, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteFooter, SiteHeader } from "@/app/components/site-header";
import { useAuctionVehicles } from "@/hooks/use-auction-vehicles";
import { VEHICLE_PLACEHOLDER_IMAGE, hasVehicleScore } from "@/lib/vehicles";

type Lang = "fr" | "en" | "zh";
const copy = {
  fr:{headlineA:"Avant d’enchérir sur un véhicule,",headlineB:"identifiez la véritable opportunité avec LotRank.",sub:"LotRank analyse indépendamment le coût total, la valeur de marché, le niveau de risque et la marge potentielle de chaque véhicule.",search:"Marque, modèle, VIN, mot-clé…",all:"Voir toutes les enchères",popular:"Populaires :",allBrands:"Tous",vin:"Analyser un numéro de VIN",active:"Enchères actives",market:"Tendance du marché",sources:"Sources de données",pro:"Allez plus loin avec LotRank Pro",try:"Voir LotRank Pro"},
  en:{headlineA:"Before bidding on a vehicle,",headlineB:"identify the real opportunity with LotRank.",sub:"LotRank independently analyses total cost, market value, risk level and potential margin for each vehicle.",search:"Make, model, VIN, keyword…",all:"View all auctions",popular:"Popular:",allBrands:"All",vin:"Analyse a VIN",active:"Active auctions",market:"Market trend",sources:"Data sources",pro:"Go further with LotRank Pro",try:"View LotRank Pro"},
  zh:{headlineA:"竞拍车辆之前，",headlineB:"先用 LotRank 识别真正的机会。",sub:"LotRank 独立分析每辆车的总成本、市场价值、风险水平和潜在利润。",search:"品牌、型号、VIN、关键词…",all:"查看全部拍卖",popular:"热门：",allBrands:"全部",vin:"分析 VIN",active:"进行中的拍卖",market:"市场趋势",sources:"数据来源",pro:"使用 LotRank Pro 获取更多功能",try:"查看 LotRank Pro"},
} as const;
const stateCopy={fr:{loading:"Chargement des enchères…",empty:"Aucune enchère active pour le moment.",error:"Les enchères sont temporairement indisponibles."},en:{loading:"Loading auctions…",empty:"There are no active auctions right now.",error:"Auctions are temporarily unavailable."},zh:{loading:"正在加载拍卖…",empty:"目前没有进行中的拍卖。",error:"拍卖数据暂时不可用。"}} as const;

export default function Home(){
  const router=useRouter();
  const searchParams=useSearchParams();
  const {vehicles,mode}=useAuctionVehicles();
  const requestedLang=searchParams.get("lang");
  const lang:Lang=requestedLang==="en"||requestedLang==="zh"?requestedLang:"fr";
  const [brand,setBrand]=useState("Tous");
  const [query,setQuery]=useState("");
  const t=copy[lang];
  const shown=useMemo(()=>vehicles.filter(vehicle=>(brand==="Tous"||vehicle.brand===brand)&&(vehicle.brand+" "+vehicle.model).toLowerCase().includes(query.toLowerCase())),[brand,query,vehicles]);
  const featured=shown.slice(0,5);
  const scored=vehicles.filter(vehicle=>hasVehicleScore(vehicle.score));
  const average=scored.length?Math.round(scored.reduce((sum,vehicle)=>sum+(vehicle.score??0),0)/scored.length):null;
  const state=mode==="loading"?stateCopy[lang].loading:mode==="error"?stateCopy[lang].error:stateCopy[lang].empty;
  const search=()=>router.push("/search?lang="+lang+"&q="+encodeURIComponent(query));

  return <main className="lockedHome">
    <section className="hero"><SiteHeader lang={lang} active="home"/><div className="wrap heroShell">
      <div className="heroIntro">
        <h1><span>{t.headlineA}</span><b>{t.headlineB}</b></h1>
        <p>{t.sub}</p>
        <form className="heroSearch" onSubmit={event=>{event.preventDefault();search()}}><Search/><input aria-label={t.search} value={query} onChange={event=>setQuery(event.target.value)} placeholder={t.search}/><span className="heroFilterIcon" aria-hidden="true"><Filter/></span></form>
        <div className="heroCtas"><button className="primaryBtn" onClick={()=>router.push(`/auctions?lang=${lang}`)}>{t.all}<ArrowRight/></button><button className="outlineBtn" disabled aria-disabled="true"><CarFront/>{t.vin}</button></div>
        <div className="heroPopular"><span>{t.popular}</span>{["Tous","BMW","Mercedes","Audi","Peugeot"].map(value=><button className={brand===value?"active":""} aria-pressed={brand===value} onClick={()=>setBrand(value)} key={value}>{value==="Tous"?t.allBrands:value}</button>)}</div>
      </div>
      <div className="heroVisual">
        <Image className="matrixGraph" src="/market-graph-matrix.png" alt="" fill sizes="(max-width: 760px) 94vw, 50vw" aria-hidden="true"/>
        <Image className="heroCar" src="/hero-luxury-sedan.png" alt="" fill sizes="(max-width: 760px) 94vw, 48vw" aria-hidden="true"/>
        <div className="heroMetrics">
          <article className="metric median"><span>Prix médian</span><b>—</b><small>Données en attente</small></article>
          <article className="metric score"><span>Score moyen</span><b>{average??"—"}</b><small>{scored.length?scored.length+" analysés":"Données en attente"}</small></article>
          <article className="metric precision"><span>Précision</span><b>—</b><small>Données en attente</small></article>
          <article className="metric active"><span>{t.active}</span><b>{vehicles.length||"—"}</b><small>{mode==="live"?"Données en direct":"Données en attente"}</small></article>
        </div>
      </div>
    </div></section>

    <section className="homeAuctions"><div className="wrap"><div className="sectionTitle"><h2>{t.active}</h2><Link href={`/auctions?lang=${lang}`}>{t.all}<ArrowRight/></Link></div>
      {featured.length?<div className="homeVehicleGrid">{featured.map(vehicle=><Link className="homeVehicleCard" href={"/vehicle/"+vehicle.id+"?lang="+lang} key={vehicle.id}><div className="homeVehicleImage"><img src={vehicle.image} alt={vehicle.brand+" "+vehicle.model} referrerPolicy="no-referrer" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=VEHICLE_PLACEHOLDER_IMAGE}}/><span>En cours</span>{vehicle.time&&<small>{vehicle.time}</small>}</div><div><h3>{vehicle.brand} {vehicle.model}</h3><p>{[vehicle.year,vehicle.km!=="—"?vehicle.km:null,vehicle.fuel,vehicle.transmission].filter(Boolean).join(" · ")||"—"}</p><b>{vehicle.price}</b></div></Link>)}</div>:<div className="emptyState"><CarFront/><h2>{state}</h2></div>}
    </div></section>

    <section className="homeInsights"><div className="wrap insightGrid">
      <article className="trendPanel"><header><h2><TrendingUp/>{t.market}</h2><span>Prix médian</span></header>{scored.length?<><p className="sr-only">{scored.length} scores disponibles. Score moyen : {average??"—"} sur 100.</p><div className="trendPlot" aria-hidden="true"><svg viewBox="0 0 420 110" preserveAspectRatio="none"><path className="trendArea" d="M0,86 C38,82 52,88 84,72 C118,56 142,58 168,64 C198,72 220,47 250,50 C280,53 306,32 336,38 C366,42 390,20 420,24 L420,110 L0,110 Z"/><path className="trendLine" d="M0,86 C38,82 52,88 84,72 C118,56 142,58 168,64 C198,72 220,47 250,50 C280,53 306,32 336,38 C366,42 390,20 420,24"/></svg></div></>:<div className="chartEmpty">Aucune donnée de tendance disponible.</div>}</article>
      <article className="sourcesPanel"><header><h2><Database/>{t.sources}</h2></header><div><span>Source active</span><b>{mode==="live"?"Données officielles":"En attente"}</b></div><div><span>Enchères analysées</span><b>{vehicles.length||"—"}</b></div><div><span>Scores disponibles</span><b>{scored.length||"—"}</b></div></article>
      <article className="proPanel"><header><h2><Crown/>LotRank Pro</h2></header><p>{t.pro}</p><ul><li><ShieldCheck/>Données historiques approfondies</li><li><BarChart3/>Filtres avancés</li><li><Star/>Rapports détaillés</li></ul><strong>14,99 € / mois</strong><Link className="primaryBtn" href={"/pricing?lang="+lang}>{t.try}</Link></article>
    </div></section>
    <SiteFooter lang={lang}/>
  </main>;
}
