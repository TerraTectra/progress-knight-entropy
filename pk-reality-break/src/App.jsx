import React, { useEffect, useMemo, useState } from "react";
import { BASE_SPEED, EARLY_STAGE_BOOST, DAYS_PER_YEAR, BASE_LIFESPAN, AMULET_EYE_AGE, AMULET_EVIL_AGE, ADMIN_SPEED_MULTIPLIERS, SAVE_KEY } from "./constants.js";
import { jobCategories, skillCategories, properties, miscItems, allJobs, allSkills, EVIL_PERKS } from "./data.js";
import { tr, LANGUAGES, CONTACTS } from "./i18n.js";
import { Section, ProgressBar, MoneyAmount, StatBox, TaskRow, ShopRow, CheckboxRow, BranchHint } from "./components.jsx";
import { freshJobState, freshSkillState, getLevel, gainTaskState, reqUnlocked, reqText, moneyText, fmt, pct, resetProgressKeepMax, skillEffectMultiplier, combineSkillBonuses, taskMemoryMultiplier } from "./progression.js";

function nextLockedBranch(categories, ctx) {
  for (const [cat, items] of Object.entries(categories)) {
    if (!items.some((item) => reqUnlocked(item.req, ctx))) return { cat, item: items[0] };
  }
  return null;
}

function isTenCheckpoint(level) {
  return level > 0 && level % 10 === 0;
}

function nextTenCheckpoint(level) {
  return Math.max(10, Math.ceil((level + 1) / 10) * 10);
}

function jobBranchOf(jobName) {
  return Object.entries(jobCategories).find(([, items]) => items.some((item) => item.name === jobName))?.[0] || "Common work";
}

export default function App() {
  const [language, setLanguage] = useState("ru");
  const [tab, setTab] = useState("Jobs");
  const [paused, setPaused] = useState(false);
  const [days, setDays] = useState(14 * DAYS_PER_YEAR);
  const [coins, setCoins] = useState(0);
  const [evil, setEvil] = useState(0);
  const [rebirths, setRebirths] = useState(0);
  const [jobName, setJobName] = useState("Beggar");
  const [skillName, setSkillName] = useState("Concentration");
  const [jobState, setJobState] = useState(freshJobState);
  const [skillState, setSkillState] = useState(freshSkillState);
  const [property, setProperty] = useState("Homeless");
  const [misc, setMisc] = useState([]);
  const [unlockedProperties, setUnlockedProperties] = useState(["Homeless"]);
  const [unlockedMisc, setUnlockedMisc] = useState([]);
  const [ownedPerks, setOwnedPerks] = useState([]);
  const [autoPromote, setAutoPromote] = useState(true);
  const [autoLearn, setAutoLearn] = useState(true);
  const [autoShop, setAutoShop] = useState(true);
  const [warp, setWarp] = useState(true);
  const [autoJobBranch, setAutoJobBranch] = useState("Common work");
  const [adminSpeedMultiplier, setAdminSpeedMultiplier] = useState(1);
  const [log, setLog] = useState(["Ты начинаешь жизнь нищим в 14 лет."]);

  const ctx = { days, coins, evil, ownedPerks, universe: 1, jobState, skillState };
  const ageYears = Math.floor(days / DAYS_PER_YEAR);
  const job = allJobs.find((j) => j.name === jobName) || allJobs[0];
  const skill = allSkills.find((s) => s.name === skillName) || allSkills[0];
  const prop = properties.find((p) => p.name === property) || properties[0];
  const addLog = (text) => setLog((prev) => [text, ...prev].slice(0, 8));

  const effects = useMemo(() => {
    const itemEffect = (name) => misc.includes(name) ? (miscItems.find((i) => i.name === name)?.effect || 1) : 1;
    const darkLearning = combineSkillBonuses(skillEffectMultiplier("Dark influence", skillState), skillEffectMultiplier("Demon training", skillState));
    const lifespanSkills = combineSkillBonuses(skillEffectMultiplier("Immortality", skillState), 1);
    return {
      happiness: prop.effect * skillEffectMultiplier("Meditation", skillState) * itemEffect("Cheap meal") * itemEffect("Meditation mat") * itemEffect("Butler"),
      jobXp: combineSkillBonuses(skillEffectMultiplier("Productivity", skillState), darkLearning) * itemEffect("Work gloves") * itemEffect("Personal squire") * (ownedPerks.includes("shadowDiscipline") ? 1.25 : 1),
      skillXp: combineSkillBonuses(skillEffectMultiplier("Concentration", skillState), darkLearning) * itemEffect("Book") * itemEffect("Research notes") * itemEffect("Study desk") * itemEffect("Library") * (ownedPerks.includes("shadowDiscipline") ? 1.25 : 1),
      income: (ownedPerks.includes("darkPatronage") ? 1.12 : 1) * skillEffectMultiplier("Demon's wealth", skillState) * itemEffect("Merchant seal"),
      expense: skillEffectMultiplier("Bargaining", skillState) * skillEffectMultiplier("Intimidation", skillState) * itemEffect("Abacus"),
      militaryPay: skillEffectMultiplier("Strength", skillState) * itemEffect("Knight's banner"),
      commonPay: itemEffect("Ledger"),
      militaryXp: skillEffectMultiplier("Battle tactics", skillState) * itemEffect("Training dummy") * itemEffect("Steel longsword"),
      strengthXp: skillEffectMultiplier("Muscle memory", skillState) * itemEffect("Dumbbells"),
      magicXp: skillEffectMultiplier("Mana control", skillState) * itemEffect("Sapphire charm") * itemEffect("Apprentice grimoire"),
      lifespan: BASE_LIFESPAN * lifespanSkills,
      timeWarp: skillEffectMultiplier("Time warping", skillState),
      evilGain: skillEffectMultiplier("Evil control", skillState),
    };
  }, [misc, prop, skillState, ownedPerks]);

  function finalJobIncome(item) {
    let value = item.income * (1 + Math.log10(getLevel(jobState, item.name) + 1));
    if (["Squire", "Footman", "Veteran footman", "Knight", "Veteran knight"].includes(item.name)) value *= effects.militaryPay;
    if (["Beggar", "Farmer", "Fisherman", "Miner", "Blacksmith", "Merchant"].includes(item.name)) value *= effects.commonPay;
    if (item.name === "Fisherman" && misc.includes("Fishing net")) value *= miscItems.find((i) => i.name === "Fishing net")?.effect || 1;
    return value * effects.income;
  }

  const income = finalJobIncome(job);
  const expense = (prop.expense + miscItems.filter((i) => misc.includes(i.name)).reduce((s, i) => s + i.expense, 0)) * effects.expense;
  const net = income - expense;
  const speed = BASE_SPEED * ((rebirths === 0 && evil === 0 && ageYears < 25) ? EARLY_STAGE_BOOST : 1) * (warp ? effects.timeWarp : 1) * adminSpeedMultiplier;
  const isDead = days >= effects.lifespan;
  const shopUnlocked = days >= 14 * DAYS_PER_YEAR + 100 || unlockedProperties.length > 1 || unlockedMisc.length > 0;
  const autoShopUnlocked = getLevel(jobState, "Merchant") >= 100;

  useEffect(() => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setLanguage(data.language || "ru"); setDays(data.days ?? 14 * DAYS_PER_YEAR); setCoins(data.coins || 0); setEvil(data.evil || 0); setRebirths(data.rebirths || 0);
      setJobName(data.jobName || "Beggar"); setSkillName(data.skillName || "Concentration"); setJobState(data.jobState || freshJobState()); setSkillState(data.skillState || freshSkillState());
      setProperty(data.property || "Homeless"); setMisc(data.misc || []); setUnlockedProperties(data.unlockedProperties || ["Homeless"]); setUnlockedMisc(data.unlockedMisc || []);
      setOwnedPerks(data.ownedPerks || []); setAutoJobBranch(data.autoJobBranch || "Common work"); setAdminSpeedMultiplier(data.adminSpeedMultiplier || 1);
    } catch { addLog("Сохранение повреждено."); }
  }, []);

  useEffect(() => {
    const data = { language, days, coins, evil, rebirths, jobName, skillName, jobState, skillState, property, misc, unlockedProperties, unlockedMisc, ownedPerks, autoJobBranch, adminSpeedMultiplier };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }, [language, days, coins, evil, rebirths, jobName, skillName, jobState, skillState, property, misc, unlockedProperties, unlockedMisc, ownedPerks, autoJobBranch, adminSpeedMultiplier]);

  useEffect(() => {
    if (paused || isDead) return;
    const id = setInterval(() => {
      const dayGain = speed / DAYS_PER_YEAR;
      setDays((d) => d + dayGain);
      setCoins((c) => Math.max(0, c + net * dayGain));
      setJobState((state) => gainTaskState(state, job, 10 * effects.jobXp * effects.happiness * taskMemoryMultiplier(state, job.name) * dayGain, 1).state);
      setSkillState((state) => gainTaskState(state, skill, 10 * effects.skillXp * effects.happiness * taskMemoryMultiplier(state, skill.name) * dayGain, 1).state);
    }, 33);
    return () => clearInterval(id);
  }, [paused, isDead, speed, net, jobName, skillName, effects]);

  useEffect(() => {
    setUnlockedProperties((prev) => Array.from(new Set(["Homeless", ...prev, ...properties.filter((i) => reqUnlocked(i.req, ctx)).map((i) => i.name)])));
    setUnlockedMisc((prev) => Array.from(new Set([...prev, ...miscItems.filter((i) => reqUnlocked(i.req, ctx)).map((i) => i.name)])));
  }, [days, coins, evil, jobState, skillState]);

  useEffect(() => {
    if (!autoPromote || !isTenCheckpoint(getLevel(jobState, jobName))) return;
    const branchItems = jobCategories[autoJobBranch] || [];
    const better = branchItems.filter((j) => reqUnlocked(j.req, ctx) && finalJobIncome(j) > finalJobIncome(job)).sort((a, b) => finalJobIncome(a) - finalJobIncome(b))[0];
    if (better) { setJobName(better.name); addLog(`Авторабота: ${tr(better.name, language)}.`); }
  }, [jobState, autoPromote, autoJobBranch]);

  useEffect(() => {
    if (!autoLearn || !isTenCheckpoint(getLevel(skillState, skillName))) return;
    const available = allSkills.filter((s) => reqUnlocked(s.req, ctx));
    const lowest = available.reduce((best, s) => getLevel(skillState, s.name) < getLevel(skillState, best.name) ? s : best, available[0]);
    if (lowest && lowest.name !== skillName) { setSkillName(lowest.name); addLog(`Авто-навык: ${tr(lowest.name, language)}.`); }
  }, [skillState, autoLearn]);

  function selectJob(name) { setJobName(name); setAutoJobBranch(jobBranchOf(name)); }
  function resetLife(keepMax = true) {
    setCoins(0); setDays(14 * DAYS_PER_YEAR); setJobName("Beggar"); setSkillName("Concentration"); setProperty("Homeless"); setMisc([]); setUnlockedProperties(["Homeless"]); setUnlockedMisc([]);
    setJobState(keepMax ? resetProgressKeepMax(jobState, allJobs) : freshJobState());
    setSkillState(keepMax ? resetProgressKeepMax(skillState, allSkills) : freshSkillState());
  }
  function touchAmulet() { if (ageYears >= AMULET_EYE_AGE) { setRebirths((r) => r + 1); resetLife(true); } }
  function embraceEvil() { if (ageYears >= AMULET_EVIL_AGE) { setEvil((e) => e + Math.max(1, Math.floor(Math.sqrt(coins + 1) / 30 * effects.evilGain))); setRebirths((r) => r + 1); resetLife(false); } }
  function buyPerk(perk) { if (evil >= perk.cost && !ownedPerks.includes(perk.id) && reqUnlocked(perk.req, ctx)) { setEvil((e) => e - perk.cost); setOwnedPerks((p) => [...p, perk.id]); } }

  const tabs = ["Jobs", "Skills", ...(shopUnlocked ? ["Shop"] : []), "Amulet", ...(evil > 0 || ownedPerks.length ? ["Evil Perks"] : []), "Settings", "Admin Console"];
  const visibleJobs = Object.entries(jobCategories).map(([cat, items]) => [cat, items.filter((i) => reqUnlocked(i.req, ctx))]).filter(([, items]) => items.length);
  const visibleSkills = Object.entries(skillCategories).map(([cat, items]) => [cat, items.filter((i) => reqUnlocked(i.req, ctx))]).filter(([, items]) => items.length);

  return <div className="app">
    <header><h1>Progress Knight: Reality Break</h1><div>{tr("Game speed", language)} x{speed.toFixed(2)}</div></header>
    <nav>{tabs.map((t) => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{tr(t, language)}</button>)}</nav>
    <main>
      <aside>
        <Section title={language === "ru" ? "Персонаж" : "Character"}><StatBox label={language === "ru" ? "Возраст" : "Age"} value={ageYears} /><ProgressBar value={pct(days - 14 * DAYS_PER_YEAR, effects.lifespan - 14 * DAYS_PER_YEAR)} /><StatBox label={language === "ru" ? "Срок жизни" : "Lifespan"} value={Math.floor(effects.lifespan / DAYS_PER_YEAR)} /><StatBox label={language === "ru" ? "Жильё" : "Property"} value={tr(property, language)} /></Section>
        <Section title={language === "ru" ? "Деньги" : "Money"}><StatBox label={language === "ru" ? "Баланс" : "Balance"} value={<MoneyAmount amount={coins} language={language} />} /><StatBox label={language === "ru" ? "Доход" : "Income"} value={<MoneyAmount amount={income} language={language} perDay />} /><StatBox label={language === "ru" ? "Расход" : "Expense"} value={<MoneyAmount amount={expense} language={language} perDay />} /><StatBox label={language === "ru" ? "Итог" : "Net"} value={<MoneyAmount amount={net} language={language} perDay signed />} /></Section>
        <Section title={tr("Automation", language)}><CheckboxRow label="Авторабота" checked={autoPromote} onChange={setAutoPromote} /><div className="muted">{tr("Auto-work branch", language)}: {tr(autoJobBranch, language)} · {getLevel(jobState, jobName)}/{nextTenCheckpoint(getLevel(jobState, jobName))}</div><CheckboxRow label="Авто-навык" checked={autoLearn} onChange={setAutoLearn} /><div className="muted">{getLevel(skillState, skillName)}/{nextTenCheckpoint(getLevel(skillState, skillName))}</div><CheckboxRow label="Time warp" checked={warp} onChange={setWarp} /><CheckboxRow label="Автомагазин" checked={autoShop} onChange={setAutoShop} disabled={!autoShopUnlocked} /></Section>
        <Section title={tr("Log", language)}>{log.map((x, i) => <div className="log" key={i}>{x}</div>)}</Section>
      </aside>
      <section className="content">
        {tab === "Jobs" && <div className="grid3">{visibleJobs.map(([cat, items]) => <Section key={cat} title={tr(cat, language)}>{items.map((item) => <TaskRow key={item.name} item={item} state={jobState[item.name]} active={jobName === item.name} onClick={selectJob} right={<MoneyAmount amount={finalJobIncome(item)} language={language} perDay />} difficulty={1} memoryState={jobState} language={language} />)}</Section>)}<BranchHint branch={nextLockedBranch(jobCategories, ctx)} ctx={ctx} reqText={(req) => reqText(req, ctx, tr, language)} language={language} /></div>}
        {tab === "Skills" && <div className="grid2">{visibleSkills.map(([cat, items]) => <Section key={cat} title={tr(cat, language)}>{items.map((item) => <TaskRow key={item.name} item={item} state={skillState[item.name]} active={skillName === item.name} onClick={setSkillName} right={`x${skillEffectMultiplier(item.name, skillState).toFixed(2)} ${tr(item.desc, language)}`} difficulty={1} memoryState={skillState} language={language} />)}</Section>)}<BranchHint branch={nextLockedBranch(skillCategories, ctx)} ctx={ctx} reqText={(req) => reqText(req, ctx, tr, language)} language={language} /></div>}
        {tab === "Shop" && <div className="grid2"><Section title={tr("Properties", language)}>{properties.filter((i) => unlockedProperties.includes(i.name) || reqUnlocked(i.req, ctx)).map((item) => <ShopRow key={item.name} item={item} active={property === item.name} onClick={setProperty} right={<MoneyAmount amount={item.expense} language={language} perDay />} language={language} />)}</Section><Section title={tr("Misc", language)}>{miscItems.filter((i) => unlockedMisc.includes(i.name) || reqUnlocked(i.req, ctx)).map((item) => <ShopRow key={item.name} item={item} active={misc.includes(item.name)} onClick={(name) => setMisc((m) => m.includes(name) ? m.filter((x) => x !== name) : [...m, name])} right={<MoneyAmount amount={item.expense} language={language} perDay />} language={language} />)}</Section></div>}
        {tab === "Amulet" && <Section title={tr("Amulet", language)}><p>Амулет сохраняет пределы прошлых жизней и даёт множитель памяти.</p>{ageYears >= AMULET_EYE_AGE && <button onClick={touchAmulet}>Прикоснуться к глазу</button>}{ageYears >= AMULET_EVIL_AGE && <button onClick={embraceEvil}>Принять зло</button>}</Section>}
        {tab === "Evil Perks" && <Section title={tr("Evil Perks", language)}>{EVIL_PERKS.map((p) => <button key={p.id} className="perk" disabled={ownedPerks.includes(p.id) || evil < p.cost || !reqUnlocked(p.req, ctx)} onClick={() => buyPerk(p)}><b>{tr(p.name, language)}</b><span>{ownedPerks.includes(p.id) ? "Куплено" : `${p.cost} Evil`}</span><small>{p.effect}</small></button>)}</Section>}
        {tab === "Settings" && <Section title={tr("Settings", language)}><select value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select><button onClick={() => setPaused((p) => !p)}>{paused ? "Продолжить" : "Пауза"}</button><button onClick={() => localStorage.removeItem(SAVE_KEY)}>Очистить сохранение</button>{CONTACTS.map((c) => <div className="contact" key={c.label}><b>{c.label}</b><span>{c.value}</span></div>)}<div className="support">По вопросам сотрудничества или добровольной поддержки пишите в Telegram @tahioff или на почту luter.rouze@gmail.com.</div></Section>}
        {tab === "Admin Console" && <Section title={tr("Admin Console", language)}><div className="admin-buttons">{ADMIN_SPEED_MULTIPLIERS.map((m) => <button key={m} className={adminSpeedMultiplier === m ? "active" : ""} onClick={() => setAdminSpeedMultiplier((cur) => cur === m ? 1 : m)}>x{m}</button>)}</div></Section>}
      </section>
    </main>
  </div>;
}
