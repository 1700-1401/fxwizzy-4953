import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronDown,
  Bookmark,
  Check,
  AlertTriangle,
  Target,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { price, rr, type Analysis } from "../lib/trading";

export function SetupPanel({
  result,
  saved,
  save,
  risk,
  openRisk,
}: {
  result: Analysis;
  saved: boolean;
  save: () => void;
  risk: number;
  openRisk: () => void;
}) {
  const [showRules, setShowRules] = useState(true);
  const s = result.setup;
  const isSample = result.id === "sample";
  return (
    <aside className="setup-column">
      <section className="panel setup-panel">
        <div className="panel-title">
          <h3>
            <Target size={17} /> Trade setup
          </h3>
          <span className="tiny-tag">{isSample ? "SAMPLE" : "AI ANALYSIS"}</span>
        </div>
        <div
          className={`direction-banner ${s.direction === "SELL" ? "bearish" : s.direction === "WAIT" ? "neutral" : ""}`}
        >
          <div className="direction-icon">
            {s.direction === "SELL" ? (
              <ArrowDownRight size={24} />
            ) : s.direction === "BUY" ? (
              <ArrowUpRight size={24} />
            ) : (
              <ShieldCheck size={24} />
            )}
          </div>
          <div>
            <strong>
              {s.direction === "WAIT"
                ? "WAIT · No trade"
                : `${s.direction === "BUY" ? "Long" : "Short"} opportunity`}
            </strong>
            <span>
              {isSample
                ? "Illustrative setup · not executable"
                : result.status === "needs_context"
                  ? "More context needed"
                  : "Conditional · confirmation required"}
            </span>
          </div>
          <span className="status-dot" />
        </div>
        <div className="setup-level">
          <span className="micro">ENTRY {s.entryHigh ? "ZONE" : "LEVEL"}</span>
          <strong>
            {price(s.entry, result.instrument)}
            {s.entryHigh && s.entryHigh !== s.entry ? (
              <>
                <span className="entry-dash"> – </span>
                <span className="entry-high">{price(s.entryHigh, result.instrument)}</span>
              </>
            ) : (
              ""
            )}
          </strong>
          <span className="muted small">
            {s.direction === "WAIT" ? "No valid entry identified" : "Wait for a confirmed retest"}
          </span>
        </div>
        <div className="stop-row">
          <span>
            <ShieldCheck size={15} /> Stop loss
          </span>
          <strong>{price(s.stopLoss, result.instrument)}</strong>
        </div>
        <div className="target-list">
          {s.targets.length ? (
            s.targets.map((t, i) => (
              <div className="target-row" key={i}>
                <span>
                  <i>TP{i + 1}</i>
                  <strong>{price(t, result.instrument)}</strong>
                </span>
                <span className="rr-tag">
                  1:{rr(s.entry, s.stopLoss, t)} <small>RR</small>
                </span>
              </div>
            ))
          ) : (
            <p className="muted small">
              Targets will appear only when readable prices and a defensible setup are available.
            </p>
          )}
        </div>
        <div className="risk-summary">
          <span>Suggested risk ceiling</span>
          <strong>
            {risk}% <small>of balance</small>
          </strong>
        </div>
        <button className="rules-toggle" onClick={() => setShowRules(!showRules)}>
          <span>
            <AlertTriangle size={14} /> Before you consider an entry
          </span>
          <ChevronDown size={14} style={{ transform: showRules ? "rotate(180deg)" : "" }} />
        </button>
        {showRules && (
          <div className="trade-rules">
            <p>{s.trigger}</p>
            <p><strong>Invalidation: </strong>{s.invalidation}</p>
            {!isSample && <details className="risk-notes"><summary>Risk notes & limitations</summary>{result.cautions.map((c, i) => <p key={i}>{c}</p>)}</details>}
            {!isSample &&
              result.questions.map((q) => (
                <p key={q} className="gold-text">
                  {q}
                </p>
              ))}
          </div>
        )}
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          disabled={isSample || saved}
          onClick={save}
        >
          {saved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
          {saved
            ? "Saved to journal"
            : isSample
              ? "Upload a chart to save a setup"
              : "Save analysis to journal"}
        </button>
        <p className="setup-disclaimer">
          <ShieldCheck size={12} /> No guaranteed returns. Protect your capital.
        </p>
      </section>
      <section className="risk-teaser">
        <div className="risk-teaser-icon">
          <Calculator size={20} />
        </div>
        <span>
          <strong>Size it before you trade.</strong>
          <small>Plan your risk, not your hopes.</small>
        </span>
        <button className="icon-btn" aria-label="Open risk calculator" onClick={openRisk}>
          <ArrowRight size={18} />
        </button>
      </section>
    </aside>
  );
}
