import { useState } from "react";
import {
  Calculator,
  ShieldCheck,
  ArrowRight,
  Bookmark,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Target,
  X,
} from "lucide-react";
import { price, type Analysis, type SavedAnalysis } from "../lib/trading";
import { Modal } from './modal';

export function RiskCalculator({ result, defaultRisk }: { result: Analysis; defaultRisk: number }) {
  const [balance, setBalance] = useState("10000");
  const [risk, setRisk] = useState(String(defaultRisk));
  const [entry, setEntry] = useState(String(result.setup.entry ?? ""));
  const [stop, setStop] = useState(String(result.setup.stopLoss ?? ""));
  const [units, setUnits] = useState(result.instrument === "XAUUSD" ? "100" : "100000");
  const [target, setTarget] = useState(String(result.setup.targets[2] ?? ""));
  const e = Number(entry),
    s = Number(stop),
    b = Number(balance),
    r = Number(risk),
    contract = Number(units);
  const usdQuote = result.instrument.endsWith('USD');
  const valid = usdQuote && b > 0 && r > 0 && r <= 100 && e > 0 && s > 0 && e !== s && contract > 0 && [b,r,e,s,contract].every(Number.isFinite);
  const riskMoney = valid ? (b * r) / 100 : 0;
  const lossPerLot = Math.abs(e - s) * contract;
  const rawLots = valid ? riskMoney / lossPerLot : 0;
  const lots = Math.floor(rawLots * 100) / 100;
  return (
    <div className="risk-page">
      <div className="section-intro">
        <span className="eyebrow">CAPITAL FIRST. ALWAYS.</span>
        <h2>Position size calculator</h2>
        <p className="muted">Know your downside before thinking about the upside.</p>
      </div>
      <div className="risk-layout">
        <section className="panel calculator-form">
          {!usdQuote && <div className="error-message">Position sizing is unavailable for {result.instrument}: currency conversion is required. Use your broker’s calculator for non-USD-quoted pairs.</div>}
          <div className="panel-title">
            <h3>
              <Calculator size={18} /> Your trade parameters
            </h3>
            <span className="tiny-tag">USD ACCOUNT</span>
          </div>
          <div className="form-grid">
            <label>
              Account balance ($)
              <input
                type="number"
                aria-label="Account balance ($)"
                min="1"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </label>
            <label>
              Risk per trade (%)
              <input
                type="number"
                aria-label="Risk per trade (%)"
                min="0.01"
                max="100"
                step="0.1"
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
              />
            </label>
            <label>
              Entry price
              <input
                type="number"
                aria-label="Entry price"
                step="any"
                min="0"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Entry"
              />
            </label>
            <label>
              Stop loss price
              <input
                type="number"
                aria-label="Stop loss price"
                step="any"
                min="0"
                value={stop}
                onChange={(e) => setStop(e.target.value)}
                placeholder="Stop loss"
              />
            </label>
            <label>
              Contract units per lot
              <input
                type="number"
                aria-label="Contract units per lot"
                min="1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </label>
            <label>
              Final target (optional)
              <input
                type="number"
                aria-label="Final target (optional)"
                step="any"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Take profit"
              />
            </label>
          </div>
          <div className="info-box">
            <ShieldCheck size={18} />
            <p>
              For USD-quoted instruments and USD accounts only (e.g. XAUUSD, EURUSD). Gold often
              uses 100 oz/lot and forex 100,000 units/lot, but confirm your broker’s specifications.
              USDJPY and other non-USD quotes need currency conversion not included here.
            </p>
          </div>
          {r > 2 && (
            <div className="error-message">
              High risk: risking more than 2% per trade can cause significant drawdowns.
            </div>
          )}
        </section>
        <section className="panel calculation-result">
          <span className="eyebrow">YOUR POSITION SIZE</span>
          <div className="lot-number">
            {valid ? lots.toFixed(2) : "—"}
            <span>lots</span>
          </div>
          <p className="muted">Rounded down to a 0.01 lot step</p>
          <div className="calc-stat">
            <span>Planned risk budget</span>
            <strong>${riskMoney.toFixed(2)}</strong>
          </div>
          <div className="calc-stat">
            <span>Risk at rounded size</span>
            <strong>${valid ? (lots * lossPerLot).toFixed(2) : "0.00"}</strong>
          </div>
          <div className="calc-stat">
            <span>Price distance to stop</span>
            <strong>
              {valid
                ? Math.abs(e - s)
                    .toFixed(5)
                    .replace(/0+$/, "")
                    .replace(/\.$/, "")
                : "—"}
            </strong>
          </div>
          <div className="calc-stat">
            <span>Target risk-to-reward</span>
            <strong>
              {valid && Number(target) > 0 && (e > s ? Number(target) > e : Number(target) < e)
                ? "1:" + (Math.abs(Number(target) - e) / Math.abs(e - s)).toFixed(2)
                : "—"}
            </strong>
          </div>
          <p className="small muted">
            Excludes spreads, commissions and slippage. Stop losses do not guarantee the exit price.
            A size below your broker’s minimum means skip the trade.
          </p>
          {result.id === "sample" && (
            <span className="tiny-tag">PRE-FILLED WITH SAMPLE LEVELS</span>
          )}
        </section>
      </div>
    </div>
  );
}

export function Journal({
  entries,
  open,
  exportEntry,
}: {
  entries: SavedAnalysis[];
  open: (entry: SavedAnalysis) => void;
  exportEntry: (result: Analysis) => void;
}) {
  return (
    <div>
      <div className="section-intro">
        <span className="eyebrow">BUILD A BETTER TRADING PROCESS</span>
        <h2>Your analysis journal</h2>
        <p className="muted">Saved on this browser. No public feed, no cloud sync.</p>
      </div>
      {entries.length ? (
        <div className="journal-list">
          {entries.map(({ result, name }, i) => (
            <section className="panel journal-entry" key={result.id}>
              <div className="journal-icon">
                <Bookmark size={20} />
              </div>
              <div className="journal-body">
                <div>
                  <strong>{result.instrument}</strong>
                  <span className="tiny-tag">{result.timeframe}</span>
                  <span className={`bias-label ${result.bias}`}>{result.bias}</span>
                </div>
                <h3>{result.headline}</h3>
                <p className="muted small">
                  {new Date(result.createdAt).toLocaleString()} · {name}
                </p>
                <p className="small">
                  Entry {price(result.setup.entry, result.instrument)} · Stop{" "}
                  {price(result.setup.stopLoss, result.instrument)}
                </p>
              </div>
              <div className="button-row">
                <button
                  className="secondary-button"
                  title="Download analysis"
                  aria-label="Download analysis"
                  onClick={() => exportEntry(result)}
                >
                  <Download size={16} />
                </button>
                <button className="gold-button" onClick={() => open(entries[i]!)}>
                  Open <ArrowRight size={15} />
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="panel empty-journal">
          <Bookmark size={34} />
          <h3>Every good process starts with a journal.</h3>
          <p>
            Analyze a screenshot, then save the result to keep your reasoning and risk plan
            together.
          </p>
        </section>
      )}
    </div>
  );
}

export function Guide() {
  const topics = [
    {
      icon: Layers,
      number: "01",
      title: "Start with structure",
      content:
        "Identify the trend on a higher timeframe. Higher highs and higher lows suggest an uptrend; lower highs and lower lows suggest a downtrend. A single wick beyond a swing does not confirm a structure break.",
    },
    {
      icon: Target,
      number: "02",
      title: "Map the liquidity",
      content:
        "Mark equal highs, equal lows and obvious swing points. A sweep followed by a reclaim can signal rejection; continued acceptance beyond the level can signal expansion. Neither is certain.",
    },
    {
      icon: CheckCircle2,
      number: "03",
      title: "Wait for the close",
      content:
        "A confirmed close through a level, then a retest, is stronger evidence than an intrabar breakout. Watch for rejection, displacement and whether the close holds beyond the level.",
    },
    {
      icon: ShieldCheck,
      number: "04",
      title: "Define what proves you wrong",
      content:
        "Place your stop around structural invalidation, not an arbitrary distance. Size the position to your risk budget. If the first reasonable target does not justify the risk, no trade is the right decision.",
    },
  ];
  return (
    <div>
      <div className="section-intro">
        <span className="eyebrow">LESS GUESSWORK. MORE PROCESS.</span>
        <h2>The Fxwizzy trading playbook</h2>
        <p className="muted">A practical checklist for chart reading—not a promise of returns.</p>
      </div>
      <div className="guide-list">
        {topics.map(({ icon: Icon, number, title, content }) => (
          <section className="panel guide-card" key={number}>
            <span className="guide-number">{number}</span>
            <Icon size={24} />
            <div>
              <h3>{title}</h3>
              <p>{content}</p>
            </div>
          </section>
        ))}
      </div>
      <div className="info-box">
        <AlertTriangle size={21} />
        <p>
          Leveraged forex and gold trading can result in substantial losses. Screenshots can be
          stale and cannot verify spreads, execution quality or news. Use a demo account to test
          your process and seek qualified advice when needed.
        </p>
      </div>
    </div>
  );
}

export function Settings({
  close,
  risk,
  setRisk,
}: {
  close: () => void;
  risk: number;
  setRisk: (n: number) => void;
}) {
  const [value, setValue] = useState(String(risk));
  return (
    <Modal className="settings-modal" titleId="settings-title" close={close}>
        <div className="modal-heading">
          <h2 id="settings-title">Workspace settings</h2>
          <button className="icon-btn" aria-label="Close settings" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <label>
          Default risk ceiling (%)
          <input
            type="number"
            aria-label="Default risk ceiling (%)"
            min="0.1"
            max="5"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <p className="muted small">
          A planning preference, not a safety guarantee. This does not place trades.
        </p>
        <div className="info-box">
          <FileText size={18} />
          <p>
            Your saved analyses live in this browser’s local storage. Images are sent to the AI
            gateway for analysis only after you submit them. Clear browser data to remove local
            history.
          </p>
        </div>
        <button
          className="gold-button full-width"
          disabled={!(Number(value) >= 0.1 && Number(value) <= 5)}
          onClick={() => {
            setRisk(Number(value));
            close();
          }}
        >
          Save preferences
        </button>
    </Modal>
  );
}
