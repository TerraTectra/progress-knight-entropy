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
  return <div className="bar"><div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
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
  const need = maxXp(item.maxXp, state.level, difficulty);
  return (
    <button className={`task-row ${active ? "active" : ""}`} onClick={() => onClick(item.name)}>
      <div className="task-main">
        <div className="task-title">{tr(item.name, language)}</div>
        <div className="muted">{language === "ru" ? "Уровень" : "Level"} {state.level} · {language === "ru" ? "До уровня" : "XP left"} {fmt(Math.max(0, need - state.xp))}</div>
        <div className="memory">{taskMemoryText(memoryState, item.name, language)}</div>
      </div>
      <div className="task-right">{right}</div>
      <ProgressBar value={pct(state.xp, need)} />
    </button>
  );
}

export function ShopRow({ item, active, onClick, right, req, language }) {
  return (
    <button className={`shop-row ${active ? "active" : ""}`} onClick={() => onClick(item.name)}>
      <div>
        <b>{tr(item.name, language)}</b>
        <div className="muted">{tr(item.desc || "Happiness", language)}</div>
        {req && <div className="requirement">{req}</div>}
      </div>
      <div>{right}</div>
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
