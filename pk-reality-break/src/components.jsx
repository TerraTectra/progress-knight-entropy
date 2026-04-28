import React from "react";
import { pct, moneyText, fmt, maxXp, taskMemoryText } from "./progression.js";
import { tr } from "./i18n.js";

export function Section({ title, children, tone = "" }) {
  return (
    <section className={`section ${tone}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ProgressBar({ value }) {
  return <div className="bar"><div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} /></div>;
}

export function MoneyAmount({ amount, language = "ru", perDay = false, signed = false }) {
  const text = `${signed && amount > 0 ? "+" : ""}${moneyText(amount, language)}${perDay ? (language === "ru" ? "/день" : "/day") : ""}`;
  const cls = amount < 0 ? "negative" : "positive";
  return <span className={cls}>{text}</span>;
}

export function StatBox({ label, value, children }) {
  return <div className="stat"><span>{label}</span><b>{value}</b>{children}</div>;
}

export function TaskRow({ item, state, active, onClick, right, difficulty, memoryState, language }) {
  const safeState = state || { level: 0, xp: 0, maxLevel: 0 };
  const need = maxXp(item.maxXp, safeState.level, difficulty);
  return (
    <button className={`task-row ${active ? "active" : ""}`} onClick={() => onClick(item.name)}>
      <div className="task-main">
        <div className="task-title">{tr(item.name, language)}</div>
        <div className="muted">{language === "ru" ? "Уровень" : "Level"} {safeState.level} · {language === "ru" ? "До уровня" : "XP left"} {fmt(Math.max(0, need - safeState.xp))}</div>
        <div className="memory">{taskMemoryText(memoryState, item.name, language)}</div>
      </div>
      <div className="task-right">{right}</div>
      <ProgressBar value={pct(safeState.xp, need)} />
    </button>
  );
}

function shopBonusText(item, language = "ru") {
  const effectName = tr(item.desc || "Happiness", language);
  const effect = Number(item.effect || 1);
  if (effect < 1) {
    const percent = Math.round((1 - effect) * 100);
    return language === "ru" ? `-${percent}% к расходам` : `-${percent}% expenses`;
  }
  const percent = Math.round((effect - 1) * 100);
  if (percent <= 0) return language === "ru" ? "Без бонуса" : "No bonus";
  return `x${effect.toFixed(2)} ${effectName} · +${percent}%`;
}

export function ShopRow({ item, active, onClick, right, req, language }) {
  return (
    <button className={`shop-row ${active ? "active" : ""}`} onClick={() => onClick(item.name)}>
      <div className="shop-main">
        <div className="shop-title-line">
          <b>{tr(item.name, language)}</b>
          {active && <span className="active-pill">{language === "ru" ? "Активно" : "Active"}</span>}
        </div>
        <div className="shop-bonus">{shopBonusText(item, language)}</div>
        <div className="shop-desc">{language === "ru" ? "Эффект" : "Effect"}: {tr(item.desc || "Happiness", language)}</div>
        {req && <div className="requirement">{req}</div>}
      </div>
      <div className="shop-price">
        <span>{language === "ru" ? "Цена" : "Cost"}</span>
        <b>{right}</b>
      </div>
    </button>
  );
}

export function CheckboxRow({ label, checked, onChange, disabled = false }) {
  return (
    <label className="check-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export function BranchHint({ branch, ctx, reqText, language }) {
  if (!branch) return null;
  return (
    <div className="branch-hint">
      <b>{language === "ru" ? "Следующая ветка" : "Next branch"}: {tr(branch.cat, language)}</b>
      <div>{language === "ru" ? "Требование" : "Requirement"}: {reqText(branch.item.req, ctx)}</div>
    </div>
  );
}
