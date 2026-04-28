import React, { useEffect, useMemo, useState } from "react";
import { ADMIN_SPEED_MULTIPLIERS, AMULET_EVIL_AGE, AMULET_EYE_AGE, BASE_LIFESPAN, BASE_SPEED, DAYS_PER_YEAR, EARLY_STAGE_BOOST, OBSERVER_UNLOCK_COST } from "./constants.js";
import { allJobs, allSkills, EVIL_PERKS, jobCategories, miscItems, properties, skillCategories } from "./data.js";
import { CONTACTS, LANGUAGES, tr } from "./i18n.js";
import { BranchHint, CheckboxRow, MoneyAmount, ProgressBar, Section, ShopRow, StatBox, TaskRow } from "./components.jsx";
import { MILESTONES, achievementBonuses, achievementDesc, achievementGroupLabel, achievementName, achievementProgress, achievementReward, achievementUnlocked, visibleAchievementStages } from "./achievements.js";
import { META_UPGRADES, UNIVERSES, initialMetaUpgrades, metaEffects, metaUpgradeCost, universeInfo, universeMods, universePointGain } from "./multiverse.js";
import { OBSERVER_UPGRADES, makeSimulacrum, observerEffects, observerPointGain, observerUpgradeCost, personalityById, talentById } from "./observer.js";
import { clearSave, defaultSave, loadSave, saveGame } from "./save.js";
import { combineSkillBonuses, fmt, freshJobState, freshSkillState, gainTaskState, getLevel, pct, reqText, reqUnlocked, resetProgressKeepMax, skillEffectMultiplier, taskMemoryMultiplier } from "./progression.js";

const jobBranchOf = (name) => Object.entries(jobCategories).find(([, list]) => list.some((item) => item.name === name))?.[0] || "Common work";
const isTen = (level) => level > 0 && level % 10 === 0;
const nextTen = (level) => Math.max(10, Math.ceil((level + 1) / 10) * 10);
const itemMul = (owned, name) => owned.includes(name) ? (miscItems.find((item) => item.name === name)?.effect || 1) : 1;
const stageIcon = (id) => ({ start: "✦", work: "⚒", combat: "⚔", magic: "✧", economy: "◆", amulet: "◉", evil: "☽", multiverse: "◇", observer: "◎" })[id] || "•";

function nextBranch(categories, ctx) {
  for (const [cat, items] of Object.entries(categories)) {
    if (!items.some((item) => reqUnlocked(item.req, ctx))) return { cat, item: items[0] };
  }
  return null;
}

function nextLockedItem(items, ctx, unlockedNames = []) {
  return items.find((item) => !unlockedNames.includes(item.name) && item.req && !reqUnlocked(item.req, ctx)) || null;
}

function UnlockHint({ item, ctx, language, title = "Следующее открытие", name }) {
  if (!item) return null;
  return (
    <div className="unlock-hint">
      <div className="unlock-hint-title">{title}: <b>{name || tr(item.name, language)}</b></div>
      <div className="unlock-hint-req">Требование: {reqText(item.req, ctx, tr, language)}</div>
    </div>
  );
}

function AchievementsView({ state, language, doneIds, selectedStage, setSelectedStage, onlyOpen, setOnlyOpen }) {
  const stages = visibleAchievementStages(state);
  const stageIds = stages.map((stage) => stage.id);
  const currentStage = stageIds.includes(selectedStage) ? selectedStage : stages[0]?.id || "start";
  const activeStage = stages.find((stage) => stage.id === currentStage) || stages[0];
  const doneSet = new Set(doneIds);
  const totalDone = doneIds.length;
  const total = MILESTONES.length;
  const stageAchievements = MILESTONES.filter((item) => item.group === currentStage);
  const stageDone = stageAchievements.filter((item) => doneSet.has(item.id)).length;
  const shown = onlyOpen ? stageAchievements.filter((item) => !doneSet.has(item.id)) : stageAchievements;

  return (
    <div className="achievements-view">
      <Section title="Достижения">
        <div className="achievement-total-card">
          <div className="achievement-total-row"><span>Общий прогресс</span><b>{totalDone}/{total}</b></div>
          <ProgressBar value={pct(totalDone, total)} />
        </div>
        <div className="achievement-controls">
          <label className="achievement-check"><input type="checkbox" checked={onlyOpen} onChange={(event) => setOnlyOpen(event.target.checked)} />Показывать только невыполненные</label>
        </div>
        <div className="achievement-stage-tabs">
          {stages.map((stage) => {
            const all = MILESTONES.filter((item) => item.group === stage.id);
            const done = all.filter((item) => doneSet.has(item.id)).length;
            const active = stage.id === currentStage;
            return (
              <button key={stage.id} className={`achievement-stage-tab ${active ? "active" : ""}`} onClick={() => setSelectedStage(stage.id)}>
                <div className="achievement-stage-top"><span>{stageIcon(stage.id)}</span><b>{done}/{all.length}</b></div>
                <div className="achievement-stage-label">{achievementGroupLabel(stage.id, language)}</div>
                <ProgressBar value={pct(done, Math.max(1, all.length))} />
              </button>
            );
          })}
        </div>
      </Section>

      {activeStage && <Section title={`${stageIcon(activeStage.id)} ${achievementGroupLabel(activeStage.id, language)}`} tone="achievement-stage-panel">
        <div className="achievement-current-stage">
          <div><span>Текущий этап</span><b>{achievementGroupLabel(activeStage.id, language)}</b></div>
          <div className="achievement-current-score"><b>{stageDone}/{stageAchievements.length}</b><span>выполнено</span></div>
        </div>
        <ProgressBar value={pct(stageDone, Math.max(1, stageAchievements.length))} />
        <div className="achievement-grid concept-grid">
          {shown.length === 0 && <div className="empty-achievements">Все достижения этого этапа уже выполнены.</div>}
          {shown.map((item) => {
            const progress = achievementProgress(item, state);
            const done = doneSet.has(item.id);
            const percent = done ? 100 : pct(progress.current, progress.target);
            return (
              <article key={item.id} className={`achievement-card concept-card ${done ? "done" : "locked"}`}>
                <div className="achievement-card-head">
                  <span className="achievement-status">{done ? "✓" : `${Math.floor(percent)}%`}</span>
                  <div className="achievement-title-wrap"><h3>{achievementName(item, language)}</h3><p>{achievementDesc(item, language)}</p></div>
                </div>
                <div className="achievement-progress-line"><span>Прогресс</span><b>{done ? "Готово" : `${fmt(progress.current)} / ${fmt(progress.target)}`}</b></div>
                <ProgressBar value={percent} />
                <div className="achievement-reward"><span>Награда</span><b>{achievementReward(item, language)}</b></div>
              </article>
            );
          })}
        </div>
      </Section>}
    </div>
  );
}

export default function App() {
  const [s, setS] = useState(() => loadSave());
  const [achievementStage, setAchievementStage] = useState("start");
  const patch = (value) => setS((old) => ({ ...old, ...(typeof value === "function" ? value(old) : value) }));

  const ctx = { days: s.days, coins: s.coins, evil: s.evil, ownedPerks: s.ownedPerks, universe: s.universe, jobState: s.jobState, skillState: s.skillState };
  const age = Math.floor(s.days / DAYS_PER_YEAR);
  const job = allJobs.find((item) => item.name === s.jobName) || allJobs[0];
  const skill = allSkills.find((item) => item.name === s.skillName) || allSkills[0];
  const prop = properties.find((item) => item.name === s.property) || properties[0];
  const bonus = useMemo(() => achievementBonuses(s.achievedMilestones), [s.achievedMilestones]);
  const meta = useMemo(() => metaEffects(s.metaUpgrades || initialMetaUpgrades), [s.metaUpgrades]);
  const uMods = useMemo(() => universeMods(s.universe), [s.universe]);
  const uInfo = universeInfo(s.universe);

  const effects = useMemo(() => {
    const dark = combineSkillBonuses(skillEffectMultiplier("Dark influence", s.skillState), skillEffectMultiplier("Demon training", s.skillState));
    return {
      happiness: prop.effect * skillEffectMultiplier("Meditation", s.skillState) * itemMul(s.misc, "Cheap meal") * itemMul(s.misc, "Meditation mat") * itemMul(s.misc, "Butler"),
      jobXp: bonus.allXp * meta.allXp * uMods.jobXp * combineSkillBonuses(skillEffectMultiplier("Productivity", s.skillState), dark) * itemMul(s.misc, "Work gloves") * itemMul(s.misc, "Personal squire") * (s.ownedPerks.includes("shadowDiscipline") ? 1.25 : 1),
      skillXp: bonus.allXp * bonus.skillXp * meta.allXp * uMods.skillXp * combineSkillBonuses(skillEffectMultiplier("Concentration", s.skillState), dark) * itemMul(s.misc, "Book") * itemMul(s.misc, "Research notes") * (s.ownedPerks.includes("shadowDiscipline") ? 1.25 : 1),
      income: bonus.income * meta.income * uMods.income * skillEffectMultiplier("Demon's wealth", s.skillState) * itemMul(s.misc, "Merchant seal") * itemMul(s.misc, "Debt ledger") * (s.ownedPerks.includes("darkPatronage") ? 1.12 : 1),
      expense: meta.expense * uMods.expense * skillEffectMultiplier("Bargaining", s.skillState) * skillEffectMultiplier("Intimidation", s.skillState) * itemMul(s.misc, "Abacus") * (s.ownedPerks.includes("wickedBargain") ? 0.85 : 1),
      militaryPay: skillEffectMultiplier("Strength", s.skillState) * itemMul(s.misc, "Knight's banner"),
      commonPay: itemMul(s.misc, "Ledger"),
      magicPay: skillEffectMultiplier("Mana control", s.skillState) * itemMul(s.misc, "Arcane focus"),
      lifespan: BASE_LIFESPAN * combineSkillBonuses(skillEffectMultiplier("Immortality", s.skillState), skillEffectMultiplier("Super immortality", s.skillState)) * meta.lifespan * uMods.lifespan + (s.ownedPerks.includes("deathDefiance") ? 30 * DAYS_PER_YEAR : 0),
      timeWarp: combineSkillBonuses(skillEffectMultiplier("Time warping", s.skillState), skillEffectMultiplier("Clockwork focus", s.skillState)) * meta.speed * uMods.speed,
      evilGain: bonus.evilGain * meta.evilGain * uMods.evilGain * skillEffectMultiplier("Evil control", s.skillState) * (s.ownedPerks.includes("soulFurnace") ? 1.6 : 1),
      metaGain: bonus.metaGain * meta.metaGain * uMods.metaGain * skillEffectMultiplier("Paradox handling", s.skillState),
      observerGain: bonus.observerGain,
    };
  }, [s.skillState, s.misc, s.ownedPerks, prop.effect, bonus, meta, uMods]);

  const incomeFor = (item) => {
    let value = item.income * (1 + Math.log10(getLevel(s.jobState, item.name) + 1));
    if (["Beggar", "Farmer", "Fisherman", "Miner", "Blacksmith", "Merchant"].includes(item.name)) value *= effects.commonPay;
    if (["Squire", "Footman", "Veteran footman", "Knight", "Veteran knight", "Elite knight", "Holy knight", "Legendary knight"].includes(item.name)) value *= effects.militaryPay;
    if (["Student", "Apprentice mage", "Mage", "Wizard", "Master wizard", "Chairman"].includes(item.name)) value *= effects.magicPay;
    if (item.name === "Fisherman") value *= itemMul(s.misc, "Fishing net");
    return value * effects.income;
  };

  const income = incomeFor(job);
  const expense = (prop.expense + miscItems.filter((item) => s.misc.includes(item.name)).reduce((sum, item) => sum + item.expense, 0)) * effects.expense;
  const net = income - expense;
  const speed = BASE_SPEED * ((s.rebirths === 0 && s.evil === 0 && age < 25 && s.universe === 1) ? EARLY_STAGE_BOOST : 1) * (s.warp ? effects.timeWarp : 1) * s.adminSpeedMultiplier;
  const shopOpen = s.days >= 14 * DAYS_PER_YEAR + 100 || s.unlockedProperties.length > 1 || s.unlockedMisc.length > 0;
  const autoShopOpen = getLevel(s.jobState, "Merchant") >= 100 || s.achievedMilestones.includes("merchant100AutoShop");
  const multiverseOpen = s.ownedPerks.includes("realityBreak") || s.highestUniverse > 1;
  const observerReady = s.metaverse >= OBSERVER_UNLOCK_COST && s.highestUniverse >= 10;
  const achState = { ...s, language: s.language };
  const tabs = ["Jobs", "Skills", ...(shopOpen ? ["Shop"] : []), "Amulet", "Achievements", ...(s.evil > 0 || s.ownedPerks.length ? ["Evil Perks"] : []), ...(multiverseOpen ? ["Multiverse"] : []), ...(s.observerUnlocked ? ["Observer"] : []), "Settings", "Admin Console"];

  useEffect(() => { saveGame(s); }, [s]);

  useEffect(() => {
    if (s.paused || s.days >= effects.lifespan || s.observerUnlocked) return;
    const id = setInterval(() => {
      const dayGain = speed / DAYS_PER_YEAR;
      setS((old) => ({
        ...old,
        days: old.days + dayGain,
        coins: Math.max(0, old.coins + net * dayGain),
        jobState: gainTaskState(old.jobState, job, 10 * effects.jobXp * effects.happiness * taskMemoryMultiplier(old.jobState, job.name) * dayGain, uInfo.difficulty).state,
        skillState: gainTaskState(old.skillState, skill, 10 * effects.skillXp * effects.happiness * taskMemoryMultiplier(old.skillState, skill.name) * dayGain, uInfo.difficulty).state,
      }));
    }, 33);
    return () => clearInterval(id);
  }, [s.paused, s.observerUnlocked, s.days, speed, net, job.name, skill.name, effects, uInfo.difficulty]);

  useEffect(() => {
    const done = MILESTONES.filter((item) => achievementUnlocked(item, achState)).map((item) => item.id);
    const fresh = done.filter((id) => !s.achievedMilestones.includes(id));
    if (fresh.length) patch({ achievedMilestones: Array.from(new Set([...s.achievedMilestones, ...fresh])) });
  }, [s.days, s.coins, s.evil, s.rebirths, s.highestUniverse, s.metaverse, s.observerUnlocked, s.jobState, s.skillState, s.misc, s.ownedPerks, s.simulacra]);

  useEffect(() => {
    const up = properties.filter((item) => reqUnlocked(item.req, ctx)).map((item) => item.name);
    const um = miscItems.filter((item) => reqUnlocked(item.req, ctx)).map((item) => item.name);
    patch((old) => ({ unlockedProperties: Array.from(new Set(["Homeless", ...old.unlockedProperties, ...up])), unlockedMisc: Array.from(new Set([...old.unlockedMisc, ...um])) }));
  }, [s.days, s.coins, s.evil, s.universe, s.jobState, s.skillState]);

  useEffect(() => {
    if (s.coins <= 0.01 && net < 0 && (s.property !== "Homeless" || s.misc.length)) patch({ property: "Homeless", misc: [] });
  }, [s.coins, net, s.property, s.misc]);

  useEffect(() => {
    if (!s.autoPromote || !isTen(getLevel(s.jobState, s.jobName))) return;
    const better = (jobCategories[s.autoJobBranch] || []).filter((item) => reqUnlocked(item.req, ctx) && incomeFor(item) > incomeFor(job)).sort((a, b) => incomeFor(a) - incomeFor(b))[0];
    if (better) patch({ jobName: better.name });
  }, [s.jobState, s.autoPromote, s.autoJobBranch]);

  useEffect(() => {
    if (!s.autoLearn || !isTen(getLevel(s.skillState, s.skillName))) return;
    const available = allSkills.filter((item) => reqUnlocked(item.req, ctx));
    const lowest = available.reduce((best, item) => getLevel(s.skillState, item.name) < getLevel(s.skillState, best.name) ? item : best, available[0]);
    if (lowest && lowest.name !== s.skillName) patch({ skillName: lowest.name });
  }, [s.skillState, s.autoLearn]);

  useEffect(() => {
    if (!s.observerUnlocked || s.paused) return;
    const id = setInterval(() => {
      const op = observerPointGain(s.simulacra, s.observerUpgrades, effects.observerGain) / 30;
      setS((old) => ({ ...old, observerPoints: old.observerPoints + op, simulacra: old.simulacra.map((sim) => ({ ...sim, xp: sim.xp + op * 0.35, level: sim.xp > sim.level * 20 ? sim.level + 1 : sim.level, status: "самостоятельно проходит игру" })) }));
    }, 33);
    return () => clearInterval(id);
  }, [s.observerUnlocked, s.paused, s.simulacra, s.observerUpgrades, effects.observerGain]);

  const resetLife = (keepMax, target = s.universe) => patch({ coins: 0, days: 14 * DAYS_PER_YEAR, jobName: "Beggar", skillName: "Concentration", property: "Homeless", misc: [], unlockedProperties: ["Homeless"], unlockedMisc: [], universe: target, jobState: keepMax ? resetProgressKeepMax(s.jobState, allJobs) : freshJobState(), skillState: keepMax ? resetProgressKeepMax(s.skillState, allSkills) : freshSkillState() });
  const buyPerk = (perk) => { if (s.evil >= perk.cost && !s.ownedPerks.includes(perk.id) && reqUnlocked(perk.req, ctx)) patch({ evil: s.evil - perk.cost, ownedPerks: [...s.ownedPerks, perk.id], ...(perk.id === "realityBreak" ? { highestUniverse: Math.max(s.highestUniverse, 2), universe: 2 } : {}) }); };
  const collapseUniverse = () => { const gain = universePointGain(s, effects); if (gain > 0) { patch({ metaverse: s.metaverse + gain }); resetLife(false); } };
  const unlockUniverse = (info) => { if (info.id <= s.highestUniverse + 1 && s.metaverse >= info.unlockCost) patch({ metaverse: s.metaverse - info.unlockCost, highestUniverse: Math.max(s.highestUniverse, info.id) }); };
  const buyMeta = (upgrade) => { const level = s.metaUpgrades[upgrade.id] || 0; const cost = metaUpgradeCost(upgrade, level); if (s.metaverse >= cost) patch({ metaverse: s.metaverse - cost, metaUpgrades: { ...s.metaUpgrades, [upgrade.id]: level + 1 } }); };
  const freshReset = () => setS(defaultSave());

  return <div className="app"><header><h1>Progress Knight: Reality Break</h1><div>x{speed.toFixed(2)} · U{s.universe} · {fmt(s.metaverse)} MP</div></header><nav>{tabs.map((item) => <button key={item} className={s.tab === item ? "active" : ""} onClick={() => patch({ tab: item })}>{tr(item, s.language)}</button>)}</nav><main><aside>
    <Section title="Персонаж"><StatBox label="Возраст" value={age} /><ProgressBar value={pct(s.days - 14 * DAYS_PER_YEAR, effects.lifespan - 14 * DAYS_PER_YEAR)} /><StatBox label="Срок жизни" value={Math.floor(effects.lifespan / DAYS_PER_YEAR)} /><StatBox label="Жильё" value={tr(s.property, s.language)} /></Section>
    <Section title="Деньги"><StatBox label="Баланс" value={<MoneyAmount amount={s.coins} language={s.language} />} /><StatBox label="Доход" value={<MoneyAmount amount={income} language={s.language} perDay />} /><StatBox label="Расход" value={<MoneyAmount amount={expense} language={s.language} perDay />} /><StatBox label="Итог" value={<MoneyAmount amount={net} language={s.language} perDay signed />} /></Section>
    <Section title={tr("Automation", s.language)}><CheckboxRow label="Авторабота" checked={s.autoPromote} onChange={(v) => patch({ autoPromote: v })} /><div className="muted">{tr(s.autoJobBranch, s.language)} · {getLevel(s.jobState, s.jobName)}/{nextTen(getLevel(s.jobState, s.jobName))}</div><CheckboxRow label="Авто-навык" checked={s.autoLearn} onChange={(v) => patch({ autoLearn: v })} /><div className="muted">{tr(s.skillName, s.language)} · {getLevel(s.skillState, s.skillName)}/{nextTen(getLevel(s.skillState, s.skillName))}</div><CheckboxRow label="Time warp" checked={s.warp} onChange={(v) => patch({ warp: v })} /><CheckboxRow label="Автомагазин" checked={s.autoShop} disabled={!autoShopOpen} onChange={(v) => patch({ autoShop: v })} /></Section>
    <Section title={tr("Log", s.language)}>{(s.log || []).map((item, i) => <div className="log" key={i}>{item}</div>)}</Section>
  </aside><section className="content">
    {s.tab === "Jobs" && <div className="grid3">{Object.entries(jobCategories).map(([cat, list]) => [cat, list.filter((item) => reqUnlocked(item.req, ctx)), list]).filter(([, visible]) => visible.length).map(([cat, visible, fullList]) => <Section key={cat} title={tr(cat, s.language)}>{visible.map((item) => <TaskRow key={item.name} item={item} state={s.jobState[item.name]} active={s.jobName === item.name} onClick={(name) => patch({ jobName: name, autoJobBranch: jobBranchOf(name) })} right={<MoneyAmount amount={incomeFor(item)} language={s.language} perDay />} difficulty={uInfo.difficulty} memoryState={s.jobState} language={s.language} />)}<UnlockHint item={nextLockedItem(fullList, ctx)} ctx={ctx} language={s.language} title="Следующая работа" /></Section>)}<BranchHint branch={nextBranch(jobCategories, ctx)} ctx={ctx} reqText={(req) => reqText(req, ctx, tr, s.language)} language={s.language} /></div>}
    {s.tab === "Skills" && <div className="grid2">{Object.entries(skillCategories).map(([cat, list]) => [cat, list.filter((item) => reqUnlocked(item.req, ctx)), list]).filter(([, visible]) => visible.length).map(([cat, visible, fullList]) => <Section key={cat} title={tr(cat, s.language)}>{visible.map((item) => <TaskRow key={item.name} item={item} state={s.skillState[item.name]} active={s.skillName === item.name} onClick={(name) => patch({ skillName: name })} right={`x${skillEffectMultiplier(item.name, s.skillState).toFixed(2)} ${tr(item.desc, s.language)}`} difficulty={uInfo.difficulty} memoryState={s.skillState} language={s.language} />)}<UnlockHint item={nextLockedItem(fullList, ctx)} ctx={ctx} language={s.language} title="Следующий навык" /></Section>)}<BranchHint branch={nextBranch(skillCategories, ctx)} ctx={ctx} reqText={(req) => reqText(req, ctx, tr, s.language)} language={s.language} /></div>}
    {s.tab === "Shop" && <div className="grid2"><Section title="Жильё">{properties.filter((item) => s.unlockedProperties.includes(item.name) || reqUnlocked(item.req, ctx)).map((item) => <ShopRow key={item.name} item={item} active={s.property === item.name} onClick={(name) => patch({ property: name })} right={<MoneyAmount amount={item.expense} language={s.language} perDay />} language={s.language} />)}<UnlockHint item={nextLockedItem(properties, ctx, s.unlockedProperties)} ctx={ctx} language={s.language} title="Следующее жильё" /></Section><Section title="Предметы">{miscItems.filter((item) => s.unlockedMisc.includes(item.name) || reqUnlocked(item.req, ctx)).map((item) => <ShopRow key={item.name} item={item} active={s.misc.includes(item.name)} onClick={(name) => patch({ misc: s.misc.includes(name) ? s.misc.filter((x) => x !== name) : [...s.misc, name] })} right={<MoneyAmount amount={item.expense} language={s.language} perDay />} language={s.language} />)}<UnlockHint item={nextLockedItem(miscItems, ctx, s.unlockedMisc)} ctx={ctx} language={s.language} title="Следующий предмет" /></Section></div>}
    {s.tab === "Amulet" && <Section title="Амулет"><p>Амулет сохраняет пределы прошлых жизней.</p>{age >= AMULET_EYE_AGE && <button onClick={() => { patch({ rebirths: s.rebirths + 1 }); resetLife(true); }}>Прикоснуться к глазу</button>}{age >= AMULET_EVIL_AGE && <button onClick={() => { patch({ evil: s.evil + Math.max(1, Math.floor(Math.sqrt(s.coins + 1) / 30 * effects.evilGain)), rebirths: s.rebirths + 1 }); resetLife(false); }}>Принять зло</button>}</Section>}
    {s.tab === "Achievements" && <AchievementsView state={achState} language={s.language} doneIds={s.achievedMilestones} selectedStage={achievementStage} setSelectedStage={setAchievementStage} onlyOpen={s.showOnlyIncompleteAchievements} setOnlyOpen={(value) => patch({ showOnlyIncompleteAchievements: value })} />}
    {s.tab === "Evil Perks" && <Section title="Перки зла">{EVIL_PERKS.map((perk) => <button key={perk.id} className="perk" disabled={s.ownedPerks.includes(perk.id) || s.evil < perk.cost || !reqUnlocked(perk.req, ctx)} onClick={() => buyPerk(perk)}><b>{tr(perk.name, s.language)}</b><span>{s.ownedPerks.includes(perk.id) ? "Куплено" : `${perk.cost} Evil`}</span><small>{perk.effect}</small></button>)}</Section>}
    {s.tab === "Multiverse" && <div className="grid2"><Section title="Мультивселенная"><StatBox label="MP" value={fmt(s.metaverse)} /><button onClick={collapseUniverse}>Схлопнуть (+{fmt(universePointGain(s, effects))} MP)</button>{observerReady && <button className="final-perk" onClick={() => patch({ metaverse: s.metaverse - OBSERVER_UNLOCK_COST, observerUnlocked: true, tab: "Observer", simulacra: s.simulacra.length ? s.simulacra : [makeSimulacrum(0, observerEffects(s.observerUpgrades), true)] })}>Нечитаемый перк</button>}</Section><Section title="Вселенные">{UNIVERSES.map((info) => <div className="universe-card" key={info.id}><b>{info.name}</b><small>{info.rule}</small>{info.id <= s.highestUniverse ? <button onClick={() => resetLife(false, info.id)}>Войти</button> : <button disabled={s.metaverse < info.unlockCost || info.id > s.highestUniverse + 1} onClick={() => unlockUniverse(info)}>Открыть · {fmt(info.unlockCost)} MP</button>}</div>)}</Section><Section title="Глобальные улучшения">{META_UPGRADES.map((up) => { const level = s.metaUpgrades[up.id] || 0; const cost = metaUpgradeCost(up, level); return <button className="upgrade" key={up.id} disabled={s.metaverse < cost} onClick={() => buyMeta(up)}><b>{up.labels[Math.min(s.universe - 1, up.labels.length - 1)]}</b><span>lvl {level} · {fmt(cost)} MP</span><small>{up.effect}</small></button>; })}</Section></div>}
    {s.tab === "Observer" && <div className="grid2"><Section title="Наблюдатель"><StatBox label="OP" value={fmt(s.observerPoints)} /><StatBox label="OP/sec" value={fmt(observerPointGain(s.simulacra, s.observerUpgrades, effects.observerGain))} /><button onClick={() => patch({ simulacra: [...s.simulacra, makeSimulacrum(s.simulacra.length, observerEffects(s.observerUpgrades), s.simulacra.length === 0)] })}>Купить симулякра</button></Section><Section title="Симулякры">{s.simulacra.map((sim) => <div className="sim-card" key={sim.id}><b>{sim.name}</b><span>{talentById(sim.talentId).rarity}: {talentById(sim.talentId).name}</span><small>{personalityById(sim.personalityId).name} · lvl {sim.level} · {sim.status}</small></div>)}</Section><Section title="Улучшения">{OBSERVER_UPGRADES.map((up) => { const level = s.observerUpgrades[up.id] || 0; const cost = observerUpgradeCost(up, level); return <button className="upgrade" key={up.id} disabled={s.observerPoints < cost} onClick={() => { if (s.observerPoints >= cost) patch({ observerPoints: s.observerPoints - cost, observerUpgrades: { ...s.observerUpgrades, [up.id]: level + 1 } }); }}><b>{up.name}</b><span>lvl {level} · {fmt(cost)} OP</span><small>{up.effect}</small></button>; })}</Section></div>}
    {s.tab === "Settings" && <Section title="Настройки"><select value={s.language} onChange={(e) => patch({ language: e.target.value })}>{LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button onClick={() => patch({ paused: !s.paused })}>{s.paused ? "Продолжить" : "Пауза"}</button><button onClick={() => { clearSave(); freshReset(); }}>Полный сброс</button>{CONTACTS.map((c) => <div className="contact" key={c.label}><b>{c.label}</b><span>{c.value}</span></div>)}<div className="support">По вопросам сотрудничества или добровольной поддержки пишите в Telegram @tahioff или на почту luter.rouze@gmail.com.</div></Section>}
    {s.tab === "Admin Console" && <Section title="Админ-консоль"><div className="admin-buttons">{ADMIN_SPEED_MULTIPLIERS.map((m) => <button key={m} className={s.adminSpeedMultiplier === m ? "active" : ""} onClick={() => patch({ adminSpeedMultiplier: s.adminSpeedMultiplier === m ? 1 : m })}>x{m}</button>)}</div><button onClick={() => patch({ ownedPerks: Array.from(new Set([...s.ownedPerks, "shadowDiscipline", "darkPatronage", "wickedBargain", "soulFurnace", "deathDefiance", "demonicAutomation", "realityBreak"])), highestUniverse: 10, universe: 10, metaverse: Math.max(s.metaverse, 2000000) })}>Open Universe X</button></Section>}
  </section></main></div>;
}
