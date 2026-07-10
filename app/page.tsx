"use client";

import { useEffect, useMemo, useState } from "react";

type Region = { name: string; value: number };
type LiveData = {
  meta: { generatedAt: string; source: string; sourceUrl: string; live: boolean };
  demography: {
    population: number; populationGrowth: number | null; populationDate: string;
    births: number; birthsDate: string; deaths: number; deathsDate: string;
    naturalIncrease: number; series: { year: number; value: number }[]; regions: Region[];
  };
  telecom: {
    marketVolumeMln: number; mobileSubscribersThousand: number; fixedInternetThousand: number;
    mobileDensity: number; mobileInternetThousand?: number; reportPeriod: string; sourceUrl: string;
  };
};

const number = new Intl.NumberFormat("ru-RU");
const compact = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(2)} млн` : value >= 1_000 ? `${(value / 1_000).toFixed(1)} тыс.` : number.format(value);
const shortRegion = (name: string) => name.replace(/ Облысы/gi, "").replace(/ Қаласы/gi, "").replace(/ Город/gi, "");

function Icon({ children }: { children: string }) { return <span className="nav-icon" aria-hidden="true">{children}</span>; }

export default function Home() {
  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState(false);
  const [region, setRegion] = useState("Все регионы");
  const [tab, setTab] = useState<"overview" | "telecom">("overview");
  const [isCompact, setCompact] = useState(false);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    fetch("./data/statistics.json", { cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error("data"); return response.json(); })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const activeRegion = useMemo(() => region === "Все регионы" ? "Республика Казахстан" : region, [region]);
  const updateTime = data ? new Date(data.meta.generatedAt).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" }) : "загрузка…";

  return <main className={isCompact ? "app compact" : "app"}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">Q</div><div><b>Qazaq Data</b><span>Аналитическая платформа</span></div></div>
      <nav aria-label="Основная навигация">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><Icon>◫</Icon><span>Паспорт регионов</span></button>
        <button onClick={() => document.getElementById("rating")?.scrollIntoView({ behavior: "smooth" })}><Icon>⌁</Icon><span>Сравнение</span></button>
        <button className={tab === "telecom" ? "active" : ""} onClick={() => setTab("telecom")}><Icon>⌁</Icon><span>Телеком-рынок</span></button>
        <button onClick={() => document.getElementById("methodology")?.scrollIntoView({ behavior: "smooth" })}><Icon>▤</Icon><span>Источники данных</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="status-dot" /><span>{data ? "Данные актуальны" : "Подключение…"}</span><small>LIVE</small></div>
    </aside>

    <section className="workspace">
      <header className="topbar">
        <div className="mobile-brand"><b>Qazaq Data</b></div>
        <div className="filters">
          <label>Период<select><option>{data?.demography.populationDate.slice(-4) || "последний"}</option></select></label>
          <label>Регион<select value={region} onChange={event => setRegion(event.target.value)}><option>Все регионы</option>{data?.demography.regions.slice(0, 20).map(item => <option key={item.name}>{item.name}</option>)}</select></label>
          <label>Источник<select><option>stat.gov.kz</option></select></label>
        </div>
        <div className="top-actions"><button aria-label="Статус обновления" onClick={() => setNotice(!notice)}>●</button><div className="avatar">KZ</div></div>
        {notice && <div className="notification">Последнее обновление: {updateTime}</div>}
      </header>

      <div className="content">
        <div className={error ? "demo-banner" : "demo-banner live-banner"}><span>{error ? "OFFLINE" : "LIVE"}</span>{error ? "Не удалось загрузить набор данных. Показатели временно недоступны." : <>Официальные выгрузки Бюро национальной статистики • обновлено {updateTime}</>}<button onClick={() => setCompact(!isCompact)}>{isCompact ? "Обычный вид" : "Компактный вид"}</button></div>
        <div className="title-row"><div><p className="eyebrow">ЦИФРОВОЙ ПАСПОРТ • ЖИВЫЕ ДАННЫЕ</p><h1>{tab === "overview" ? activeRegion : "Телеком-рынок Казахстана"}</h1><p>{tab === "overview" ? "Демография и региональная структура по официальным публикациям" : data?.telecom.reportPeriod || "Последняя официальная публикация"}</p></div><button className="export" onClick={() => window.print()}>↗ Экспорт отчёта</button></div>

        {!data ? <Loading /> : tab === "overview" ? <Overview data={data} setRegion={setRegion} /> : <Telecom data={data} />}

        <section className="method card" id="methodology">
          <div className="section-head"><div><span className="kicker">ПРОЗРАЧНОСТЬ ДАННЫХ</span><h2>Источники и методология</h2></div><a href="https://stat.gov.kz/" target="_blank" rel="noreferrer">Открыть источник ↗</a></div>
          <div className="source-table"><div className="source-row header"><span>Набор данных</span><span>Источник</span><span>Периодичность</span><span>Статус</span></div>
            <Source name="Численность населения" period="Ежегодно" date={data?.demography.populationDate} />
            <Source name="Рождаемость и смертность" period="Ежегодно" date={data?.demography.birthsDate} />
            <Source name="Показатели связи" period="Ежемесячно" date={data?.telecom.reportPeriod} />
          </div>
        </section>
        <footer>Источник: stat.gov.kz <span>•</span> Автообновление ежедневно <span>•</span> Последняя успешная копия сохраняется в публикации</footer>
      </div>
    </section>
  </main>;
}

function Loading() { return <section className="kpis">{[1,2,3,4].map(i => <article className="kpi card" key={i}><div className="kpi-symbol s0">…</div><div><span>Загрузка официальных данных</span><strong>—</strong></div></article>)}</section>; }

function Source({ name, period, date }: { name: string; period: string; date?: string }) {
  return <div className="source-row"><span><i className="file-icon">▤</i>{name}</span><span>Бюро национальной статистики</span><span>{period}</span><span><b className="verified">● LIVE {date ? `• ${date}` : ""}</b></span></div>;
}

function Overview({ data, setRegion }: { data: LiveData; setRegion: (value: string) => void }) {
  const d = data.demography;
  const selected = d.regions.slice(0, 6);
  const max = Math.max(...selected.map(item => item.value));
  const trendMin = Math.min(...d.series.map(item => item.value));
  const trendMax = Math.max(...d.series.map(item => item.value));
  const trendHeight = (value: number) => 34 + ((value - trendMin) / Math.max(1, trendMax - trendMin)) * 60;
  const kpis = [
    ["Население", compact(d.population), `на ${d.populationDate}`, `${d.populationGrowth && d.populationGrowth >= 0 ? "+" : ""}${d.populationGrowth ?? "—"}%`],
    ["Родившиеся", compact(d.births), `за ${d.birthsDate.slice(-4)} год`, "официально"],
    ["Умершие", compact(d.deaths), `за ${d.deathsDate.slice(-4)} год`, "официально"],
    ["Естественный прирост", compact(d.naturalIncrease), "человек", d.naturalIncrease >= 0 ? "положительный" : "отрицательный"],
  ];
  return <>
    <section className="kpis">{kpis.map((item, i) => <article className="kpi card" key={item[0]}><div className={`kpi-symbol s${i}`}>{["◉","↗","◎","+"][i]}</div><div><span>{item[0]}</span><strong>{item[1]} <small>{item[2]}</small></strong><em>{item[3]} <i>• stat.gov.kz</i></em></div></article>)}</section>

    <section className="grid map-grid">
      <article className="map-card card"><div className="section-head"><div><span className="kicker">ТЕРРИТОРИАЛЬНЫЙ СРЕЗ</span><h2>Крупнейшие регионы по населению</h2></div><div className="legend"><span /> меньше <span /> больше</div></div><div className="kaz-map" aria-label="Карта Казахстана">{selected.slice(0,4).map((item,i) => <button className={`map-label ${["astana","almaty","atyrau","karaganda"][i]}`} key={item.name} onClick={() => setRegion(item.name)}>{shortRegion(item.name)}<b>{compact(item.value)}</b></button>)}</div><div className="map-note">Значения на {d.populationDate}; нажмите на регион</div></article>
      <article className="rating card" id="rating"><div className="section-head"><div><span className="kicker">ОФИЦИАЛЬНЫЙ СРЕЗ</span><h2>Рейтинг по населению</h2></div><small>{d.populationDate}</small></div><div className="rating-list">{selected.map((item,i) => <button key={item.name} onClick={() => setRegion(item.name)}><b>{i+1}</b><span>{shortRegion(item.name)}<small>{number.format(item.value)} чел.</small></span><i><em style={{width:`${item.value/max*100}%`,background:["#18a999","#32b9a7","#55c7b4","#78d2c1","#98ddcf","#b9e7dc"][i]}} /><strong>{(item.value/d.population*100).toFixed(1)}%</strong></i></button>)}</div></article>
    </section>

    <section className="grid charts-grid">
      <article className="trend card"><div className="section-head"><div><span className="kicker">ДИНАМИКА</span><h2>Численность населения</h2></div><span className="live-chip">● LIVE</span></div><div className="chart-area"><div className="axis"><span>{(trendMax/1e6).toFixed(1)}м</span><span>динамика</span><span>{(trendMin/1e6).toFixed(1)}м</span></div><div className="bars">{d.series.map(item => <div className="bar-wrap" key={item.year}><div className="bar" style={{height:`${trendHeight(item.value)}%`}} title={`${item.year}: ${number.format(item.value)}`} /><span>{item.year}</span></div>)}</div></div></article>
      <article className="structure card"><div className="section-head"><div><span className="kicker">СТРУКТУРА</span><h2>Доля крупнейших регионов</h2></div></div><div className="donut" style={{background:`conic-gradient(#123a62 0 ${selected[0].value/d.population*100}%, #18a999 ${selected[0].value/d.population*100}% ${(selected[0].value+selected[1].value)/d.population*100}%, #f0b44d ${(selected[0].value+selected[1].value)/d.population*100}% 32%, #d9e2ea 32%)`}}><div><strong>{compact(d.population)}</strong><span>всего</span></div></div><div className="market-legend">{selected.slice(0,3).map((item,i)=><div key={item.name}><span style={{background:["#123a62","#18a999","#f0b44d"][i]}} />{shortRegion(item.name)}<b>{(item.value/d.population*100).toFixed(1)}%</b></div>)}<div><span style={{background:"#d9e2ea"}} />Другие регионы<b>{(100-selected.slice(0,3).reduce((sum,item)=>sum+item.value/d.population*100,0)).toFixed(1)}%</b></div></div></article>
    </section>

    <section className="heat card"><div className="section-head"><div><span className="kicker">СРАВНИТЕЛЬНЫЙ АНАЛИЗ</span><h2>Матрица населения регионов</h2></div><span className="live-chip">на {d.populationDate}</span></div><div className="heat-scroll"><div className="heat-grid"><div className="heat-y"><span>Население</span><span>Доля страны</span><span>Индекс</span><span>Ранг</span></div><div className="heat-cells">{[...selected,...selected,...selected,...selected].map((item,i)=>{const row=Math.floor(i/6); const value=[item.value/max*100,item.value/d.population*500,item.value/max*100,100-(i%6)*12][row]; return <div key={`${row}-${item.name}`} title={number.format(item.value)} style={{background:`color-mix(in srgb, #18a999 ${Math.max(25,value)}%, #e8f0f3)`}}>{row===0?compact(item.value):row===1?`${(item.value/d.population*100).toFixed(1)}%`:row===2?Math.round(item.value/max*100):i%6+1}</div>})}</div></div><div className="heat-x">{selected.map(item=><span key={item.name}>{shortRegion(item.name)}</span>)}</div></div></section>
  </>;
}

function Telecom({ data }: { data: LiveData }) {
  const t = data.telecom;
  const kpis = [
    ["Объём услуг связи", `${(t.marketVolumeMln/1000).toFixed(1)}`, "млрд ₸", "за период"],
    ["Абоненты мобильной связи", `${(t.mobileSubscribersThousand/1000).toFixed(2)}`, "млн", "официально"],
    ["Фиксированный интернет", `${(t.fixedInternetThousand/1000).toFixed(2)}`, "млн", "абонентов"],
    ["Мобильная плотность", number.format(t.mobileDensity), "на 100 чел.", "официально"],
  ];
  const internetShare = t.mobileInternetThousand ? t.mobileInternetThousand / t.mobileSubscribersThousand * 100 : 0;
  return <>
    <section className="kpis telecom-kpis">{kpis.map((item,i)=><article className="kpi card" key={item[0]}><div className={`kpi-symbol s${i}`}>{["₸","◉","⌁","↗"][i]}</div><div><span>{item[0]}</span><strong>{item[1]} <small>{item[2]}</small></strong><em>{item[3]} <i>• LIVE</i></em></div></article>)}</section>
    <section className="grid telecom-grid"><article className="card operator"><div className="section-head"><div><span className="kicker">АБОНЕНТСКАЯ БАЗА</span><h2>Доступ к услугам связи</h2></div></div>{[["Мобильная связь",100,"#123a62"],["Мобильный интернет",internetShare,"#18a999"],["Фиксированный интернет",t.fixedInternetThousand/t.mobileSubscribersThousand*100,"#f0b44d"]].map(item=><div className="operator-row" key={item[0] as string}><span>{item[0]}</span><div><i style={{width:`${item[1]}%`,background:item[2]}} /></div><b>{Number(item[1]).toFixed(1)}%</b></div>)}</article><article className="card coverage"><div className="section-head"><div><span className="kicker">ПЛОТНОСТЬ СВЯЗИ</span><h2>На 100 жителей</h2></div></div><div className="coverage-ring"><strong>{number.format(t.mobileDensity)}</strong><span>SIM-карт</span></div><div className="coverage-stats"><p><b>{compact(t.mobileSubscribersThousand*1000)}</b><span>мобильных абонентов</span></p><p><b>{compact(t.fixedInternetThousand*1000)}</b><span>фиксированный интернет</span></p><p><b>{data.demography.populationDate}</b><span>демографический срез</span></p></div></article></section>
    <section className="card telecom-story"><span className="kicker">ОФИЦИАЛЬНАЯ ПУБЛИКАЦИЯ</span><h2>{t.reportPeriod}</h2><div className="telecom-bars">{[["Объём связи",t.marketVolumeMln/1000,92],["Мобильные абоненты",t.mobileSubscribersThousand/1000,78],["Фикс. интернет",t.fixedInternetThousand/1000,48],["Плотность",t.mobileDensity,65]].map(item=><div key={item[0] as string}><b>{Number(item[1]).toFixed(1)}</b><i style={{height:`${item[2]}%`}} /><span>{item[0]}</span></div>)}</div></section>
  </>;
}
