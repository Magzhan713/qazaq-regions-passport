"use client";

import { useMemo, useState } from "react";

const regions = [
  { name: "Астана", score: 91.2, value: "1,24 трлн ₸", growth: "+14,8%", tone: "#18a999" },
  { name: "Алматы", score: 88.7, value: "2,91 трлн ₸", growth: "+12,1%", tone: "#32b9a7" },
  { name: "Атырауская", score: 84.3, value: "1,87 трлн ₸", growth: "+9,4%", tone: "#55c7b4" },
  { name: "Карагандинская", score: 78.9, value: "1,15 трлн ₸", growth: "+7,8%", tone: "#78d2c1" },
  { name: "Мангистауская", score: 76.4, value: "982 млрд ₸", growth: "+6,9%", tone: "#98ddcf" },
];

const trend = [42, 47, 45, 55, 58, 64, 61, 69, 72, 78, 82, 88];
const market = [
  ["Мобильная связь", 38, "#123a62"],
  ["Фиксированный интернет", 27, "#18a999"],
  ["Передача данных", 21, "#f0b44d"],
  ["Прочее", 14, "#d9e2ea"],
] as const;
const heat = [64, 78, 45, 88, 72, 52, 93, 61, 84, 69, 38, 74, 57, 81, 66, 49, 76, 90, 55, 71, 43, 82, 68, 59];

function Icon({ children }: { children: string }) {
  return <span className="nav-icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  const [period, setPeriod] = useState("2025");
  const [region, setRegion] = useState("Все регионы");
  const [tab, setTab] = useState<"overview" | "telecom">("overview");
  const [compact, setCompact] = useState(false);
  const [notice, setNotice] = useState(false);
  const activeRegion = useMemo(() => region === "Все регионы" ? "Республика Казахстан" : region, [region]);

  return (
    <main className={compact ? "app compact" : "app"}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">Q</div><div><b>Qazaq Data</b><span>Аналитическая платформа</span></div></div>
        <nav aria-label="Основная навигация">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><Icon>◫</Icon><span>Паспорт регионов</span></button>
          <button onClick={() => setTab("overview")}><Icon>⌁</Icon><span>Сравнение</span></button>
          <button className={tab === "telecom" ? "active" : ""} onClick={() => setTab("telecom")}><Icon>⌁</Icon><span>Телеком-рынок</span></button>
          <button onClick={() => document.getElementById("methodology")?.scrollIntoView({ behavior: "smooth" })}><Icon>▤</Icon><span>Источники данных</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="status-dot" /> <span>Демо-режим</span><small>v 0.9</small></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><b>Qazaq Data</b></div>
          <div className="filters">
            <label>Период<select value={period} onChange={e => setPeriod(e.target.value)}><option>2025</option><option>2024</option><option>2023</option></select></label>
            <label>Регион<select value={region} onChange={e => setRegion(e.target.value)}><option>Все регионы</option><option>Астана</option><option>Алматы</option><option>Атырауская область</option></select></label>
            <label>Показатель<select><option>Комплексный индекс</option><option>ВРП</option><option>Инвестиции</option></select></label>
          </div>
          <div className="top-actions"><button aria-label="Уведомления" onClick={() => setNotice(!notice)}>●</button><div className="avatar">AK</div></div>
          {notice && <div className="notification">Обновлений пока нет</div>}
        </header>

        <div className="content">
          <div className="demo-banner"><span>DEMO</span> Все показатели в прототипе — демонстрационные и не являются официальной статистикой.<button onClick={() => setCompact(!compact)}>{compact ? "Обычный вид" : "Компактный вид"}</button></div>
          <div className="title-row"><div><p className="eyebrow">ЦИФРОВОЙ ПАСПОРТ • {period}</p><h1>{tab === "overview" ? activeRegion : "Телеком-рынок Казахстана"}</h1><p>{tab === "overview" ? "Экономика, инфраструктура и качество жизни — в одном окне" : "Ключевые показатели отрасли связи и цифровой инфраструктуры"}</p></div><button className="export" onClick={() => window.print()}>↗ Экспорт отчёта</button></div>

          {tab === "overview" ? <Overview period={period} setRegion={setRegion} /> : <Telecom />}

          <section className="method card" id="methodology">
            <div className="section-head"><div><span className="kicker">ПРОЗРАЧНОСТЬ ДАННЫХ</span><h2>Источники и методология</h2></div><button onClick={() => alert("Методология в демо-версии")}>Открыть методологию ↗</button></div>
            <div className="source-table"><div className="source-row header"><span>Набор данных</span><span>Источник</span><span>Периодичность</span><span>Статус</span></div>{[
              ["Региональные показатели", "Демонстрационный набор", "Ежеквартально"],
              ["Телеком-показатели", "Демонстрационный набор", "Ежегодно"],
              ["Инфраструктура и рынок", "Демонстрационный набор", "Ежемесячно"],
            ].map((x, i) => <div className="source-row" key={i}><span><i className="file-icon">▤</i>{x[0]}</span><span>{x[1]}</span><span>{x[2]}</span><span><b className="verified">● ДЕМО</b></span></div>)}</div>
          </section>
          <footer>Прототип аналитической платформы <span>•</span> Данные не предназначены для принятия решений</footer>
        </div>
      </section>
    </main>
  );
}

function Overview({ period, setRegion }: { period: string; setRegion: (v: string) => void }) {
  return <>
    <section className="kpis">
      {[['Комплексный индекс','76,4','из 100','+3,8 п.'],['Валовой региональный продукт','42,9','трлн ₸','+6,1%'],['Инвестиции','18,2','трлн ₸','+9,7%'],['Население','20,3','млн чел.','+1,2%']].map((k, i) => <article className="kpi card" key={k[0]}><div className={`kpi-symbol s${i}`}>{['◎','₸','↗','◉'][i]}</div><div><span>{k[0]}</span><strong>{k[1]} <small>{k[2]}</small></strong><em>{k[3]} <i>к {Number(period)-1}</i></em></div></article>)}
    </section>

    <section className="grid map-grid">
      <article className="map-card card"><div className="section-head"><div><span className="kicker">ТЕРРИТОРИАЛЬНЫЙ СРЕЗ</span><h2>Индекс развития регионов</h2></div><div className="legend"><span /> низкий <span /> высокий</div></div><div className="kaz-map" aria-label="Стилизованная карта Казахстана"><div className="map-label astana">Астана<b>91,2</b></div><div className="map-label almaty">Алматы<b>88,7</b></div><div className="map-label atyrau">Атырау<b>84,3</b></div><div className="map-label karaganda">Караганда<b>78,9</b></div></div><div className="map-note">Наведите на регион для просмотра показателей</div></article>
      <article className="rating card"><div className="section-head"><div><span className="kicker">ТОП РЕГИОНОВ</span><h2>Рейтинг развития</h2></div><button onClick={() => alert("Показан полный демо-рейтинг")}>Все 20 ↗</button></div><div className="rating-list">{regions.map((r, i) => <button key={r.name} onClick={() => setRegion(r.name)}><b>{i+1}</b><span>{r.name}<small>{r.value} • {r.growth}</small></span><i><em style={{width: `${r.score}%`, background:r.tone}} /><strong>{r.score}</strong></i></button>)}</div></article>
    </section>

    <section className="grid charts-grid">
      <article className="trend card"><div className="section-head"><div><span className="kicker">ДИНАМИКА</span><h2>Индекс деловой активности</h2></div><select aria-label="Период графика"><option>12 месяцев</option><option>6 месяцев</option></select></div><div className="chart-area"><div className="axis"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="bars">{trend.map((v,i)=><div className="bar-wrap" key={i}><div className="bar" style={{height:`${v}%`}} title={`${v} пунктов`} /><span>{['Янв','','Мар','','Май','','Июл','','Сен','','Ноя','Дек'][i]}</span></div>)}</div></div></article>
      <article className="structure card"><div className="section-head"><div><span className="kicker">СТРУКТУРА РЫНКА</span><h2>Отрасли экономики</h2></div></div><div className="donut" style={{background:`conic-gradient(#123a62 0 38%, #18a999 38% 65%, #f0b44d 65% 86%, #d9e2ea 86%)`}}><div><strong>42,9</strong><span>трлн ₸</span></div></div><div className="market-legend">{market.map(m => <div key={m[0]}><span style={{background:m[2]}} />{m[0]}<b>{m[1]}%</b></div>)}</div></article>
    </section>

    <section className="heat card"><div className="section-head"><div><span className="kicker">СРАВНИТЕЛЬНЫЙ АНАЛИЗ</span><h2>Матрица показателей по регионам</h2></div><select><option>Нормализованный индекс</option></select></div><div className="heat-scroll"><div className="heat-grid"><div className="heat-y"><span>ВРП</span><span>Инвестиции</span><span>Доходы</span><span>Интернет</span></div><div className="heat-cells">{heat.map((v,i)=><div key={i} title={`${v} пунктов`} style={{background:`color-mix(in srgb, #18a999 ${v}%, #e8f0f3)`}}>{v}</div>)}</div></div><div className="heat-x"><span>Астана</span><span>Алматы</span><span>Атырау</span><span>Караганда</span><span>Шымкент</span><span>Актау</span></div></div></section>
  </>;
}

function Telecom() {
  return <>
    <section className="kpis telecom-kpis">{[['Объём рынка','1,18','трлн ₸','+11,4%'],['Абоненты мобильной связи','26,7','млн','+4,2%'],['Покрытие 4G','94,1','% населения','+2,7 п.'],['Средняя скорость','48,6','Мбит/с','+18,9%']].map((k,i)=><article className="kpi card" key={k[0]}><div className={`kpi-symbol s${i}`}>{['₸','◉','⌁','↗'][i]}</div><div><span>{k[0]}</span><strong>{k[1]} <small>{k[2]}</small></strong><em>{k[3]} <i>г/г</i></em></div></article>)}</section>
    <section className="grid telecom-grid"><article className="card operator"><div className="section-head"><div><span className="kicker">КОНКУРЕНТНАЯ СРЕДА</span><h2>Структура абонентской базы</h2></div></div>{[['Оператор A',37,'#123a62'],['Оператор B',29,'#18a999'],['Оператор C',21,'#f0b44d'],['Другие',13,'#b8c7d2']].map(x=><div className="operator-row" key={x[0]}><span>{x[0]}</span><div><i style={{width:`${x[1]}%`,background:x[2]}} /></div><b>{x[1]}%</b></div>)}</article><article className="card coverage"><div className="section-head"><div><span className="kicker">ИНФРАСТРУКТУРА</span><h2>Цифровое покрытие</h2></div></div><div className="coverage-ring"><strong>94,1%</strong><span>4G</span></div><div className="coverage-stats"><p><b>7 420</b><span>базовых станций</span></p><p><b>128 тыс. км</b><span>волоконных линий</span></p><p><b>82,4%</b><span>домохозяйств онлайн</span></p></div></article></section>
    <section className="card telecom-story"><span className="kicker">ДИНАМИКА РЫНКА</span><h2>Выручка телеком-сектора</h2><div className="telecom-bars">{[54,61,66,72,79,91].map((v,i)=><div key={i}><b>{0.62+i*.11 > 1 ? (0.62+i*.11).toFixed(2) : (0.62+i*.11).toFixed(2)}</b><i style={{height:`${v}%`}} /><span>{2020+i}</span></div>)}</div></section>
  </>;
}
