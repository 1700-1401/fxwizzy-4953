import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Bookmark,
  Calculator,
  CandlestickChart,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ImagePlus,
  Layers,
  LoaderCircle,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  X,
} from "lucide-react";
import { Chart } from "../components/chart";
import { UploadDialog, type ChartImage } from "../components/upload-dialog";
import { SetupPanel } from "../components/setup-panel";
import { Guide, Journal, RiskCalculator, Settings } from "../components/workspace-extras";
import { useAnalysis, useMentor } from "../queries/analysis";
import { sample, loadSaved, type Analysis, type SavedAnalysis } from "../lib/trading";

const navigation = [
  { id: "analyzer", label: "Chart analyzer", icon: CandlestickChart },
  { id: "journal", label: "Trade journal", icon: Bookmark },
  { id: "risk", label: "Risk calculator", icon: Calculator },
  { id: "guide", label: "Trading playbook", icon: BookOpen },
];
const instruments = [
  { symbol: "XAUUSD", name: "Gold", mark: "Au" },
  { symbol: "EURUSD", name: "Euro / US Dollar", mark: "€" },
  { symbol: "GBPUSD", name: "Pound / US Dollar", mark: "£" },
  { symbol: "USDJPY", name: "US Dollar / Yen", mark: "¥" },
];

function exportAnalysis(result: Analysis) {
  const content = `FXWIZZY CHART ANALYSIS\n${result.instrument} • ${result.timeframe}\n${result.createdAt}\nStatus: ${result.status}\n\n${result.headline}\n${result.summary}\n\nMARKET STRUCTURE\n${result.structure}\n\nLIQUIDITY\n${result.liquidity}\n\nCANDLES\n${result.candles}\n\nCONDITIONAL SETUP\n${JSON.stringify(result.setup, null, 2)}\n\nQUESTIONS\n${result.questions.join("\n")}\n\nCAUTIONS\n${result.cautions.join("\n")}\n\nEducational analysis. Not live data. No guaranteed profits. Forex and gold trading involve substantial risk.`;
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `fxwizzy-${result.instrument}-${result.id.slice(0, 8)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Workspace() {
  const [page, setPage] = useState("analyzer");
  const [upload, setUpload] = useState(false);
  const [settings, setSettings] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [symbol, setSymbol] = useState("XAUUSD");
  const [timeframe, setTimeframe] = useState("1H");
  const [result, setResult] = useState<Analysis>(sample);
  const [image, setImage] = useState<string>();
  const [images, setImages] = useState<ChartImage[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [saved, setSaved] = useState<SavedAnalysis[]>(loadSaved);
  const [risk, setRisk] = useState(() => {
    try {
      return Number(localStorage.getItem("fxwizzy-risk")) || 1;
    } catch {
      return 1;
    }
  });
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState("");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [notifications, setNotifications] = useState(false);
  const analysis = useAnalysis();
  const mentor = useMentor();
  const isSample = result.id === "sample";
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape" && !analysis.isPending) {
        setUpload(false);
        setSettings(false);
        setNotifications(false);
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [analysis.isPending]);
  function changePage(id: string) {
    setPage(id);
    setMobileMenu(false);
  }
  async function analyze(
    charts: ChartImage[],
    selectedSymbol: string,
    selectedTimeframe: string,
    context: string,
  ) {
    try {
      const next = await analysis.mutateAsync({
        images: charts.map((c) => c.data),
        instrument: selectedSymbol,
        timeframe: selectedTimeframe,
        context,
      });
      setResult(next);
      setImage(charts[0]?.data);
      setImages(charts);
      setSelectedImage(0);
      setSymbol(selectedSymbol);
      setTimeframe(selectedTimeframe);
      setChat([]);
      mentor.reset();
      setUpload(false);
      setPage("analyzer");
      setTab("overview");
      setToast(
        next.status === "needs_context"
          ? "Chart reviewed. More context is needed—see the questions below."
          : "Your chart analysis is ready. Review the confirmation and risk conditions.",
      );
    } catch {
      /* Typed error is rendered in the upload form. */
    }
  }
  function save() {
    if (isSample || saved.some((e) => e.result.id === result.id)) return;
    const entry: SavedAnalysis = { result, image, name: images[0]?.name || "Uploaded chart" };
    const next = [entry, ...saved].slice(0, 20);
    try {
      localStorage.setItem("fxwizzy-journal", JSON.stringify(next));
      setSaved(next);
      setToast("Analysis saved on this device.");
    } catch {
      try {
        const compact = [
          { ...entry, image: undefined },
          ...saved.map((e) => ({ ...e, image: undefined })),
        ].slice(0, 20);
        localStorage.setItem("fxwizzy-journal", JSON.stringify(compact));
        setSaved(compact);
        setToast("Analysis saved without screenshots because browser storage is full.");
      } catch {
        setToast("Unable to save: browser storage is unavailable. Download the analysis instead.");
      }
    }
  }
  function openSaved(entry: SavedAnalysis) {
    setResult(entry.result);
    setImage(entry.image);
    setImages(entry.image ? [{ data: entry.image, name: entry.name }] : []);
    setSelectedImage(0);
    setSymbol(entry.result.instrument);
    setTimeframe(entry.result.timeframe);
    setPage("analyzer");
    setChat([]);
    mentor.reset();
  }
  async function askMentor(text: string) {
    if (!text.trim() || mentor.isPending) return;
    setQuestion("");
    setChat((prev) => [...prev, { role: "user", text }]);
    try {
      const response = await mentor.mutateAsync({
        question: text,
        context: JSON.stringify({
          ...result,
          sampleOnly: isSample,
          previousConversation: chat.slice(-4),
        }).slice(0, 14000),
      });
      setChat((prev) => [...prev, { role: "mentor", text: response.text }]);
    } catch {
      /* Error shown in mentor panel. */
    }
  }
  return (
    <div className="workspace">
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <a href="/" className="brand" aria-label="Fxwizzy home">
          <span className="brand-symbol">
            <CandlestickChart size={23} />
          </span>
          <span>
            fx<span className="gold-text">wizzy</span>
            <small>YOUR TRADING EDGE</small>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-dot" /> PERSONAL WORKSPACE
        </div>
        <nav>
          {navigation.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "selected" : ""}`}
              onClick={() => changePage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "analyzer" ? (
                <span className="nav-active-dot" />
              ) : id === "journal" && saved.length ? (
                <span className="nav-count">{saved.length}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-section">
          <span className="micro">YOUR TOOLKIT</span>
          <button
            className="nav-item"
            onClick={() => {
              setUpload(true);
              analysis.reset();
            }}
          >
            <ImagePlus size={18} /> Upload a chart <Plus size={14} className="push-right" />
          </button>
          <button className="nav-item" onClick={() => setSettings(true)}>
            <SettingsIcon size={18} /> Preferences
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="brand-card">
            <img src="/images/fxwizzy-logo.jpg" alt="Fxwizzy original logo" />
            <span className="micro">
              READ THE CHART.
              <br />
              <strong>RESPECT THE RISK.</strong>
            </span>
            <p>Your edge starts with a clearer perspective.</p>
            <button onClick={() => changePage("guide")}>
              Explore the playbook <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="sidebar-security">
            <ShieldCheck size={14} />
            <span>Analysis, not auto-execution</span>
          </div>
          <button className="profile" onClick={() => setSettings(true)}>
            <span className="avatar">FW</span>
            <span>
              <strong>Your workspace</strong>
              <small>Personal · no login needed</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-btn"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={20} />
            </button>
            <span className="muted">Workspace</span>
            <ChevronRight size={13} />
            <strong>{navigation.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="connection-label">
              <i className="dot" /> Screenshot-based analysis
            </span>
            <div className="notification-wrap">
              <button
                className="icon-btn notification-button"
                aria-label="View notifications"
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={18} />
              </button>
              {notifications && (
                <div className="notification-popover">
                  <strong>You’re all caught up.</strong>
                  <p>
                    Fxwizzy does not send live price alerts. Uploaded charts are snapshots, not a
                    live feed.
                  </p>
                </div>
              )}
            </div>
            <button
              className="topbar-avatar"
              aria-label="Workspace preferences"
              onClick={() => setSettings(true)}
            >
              FW
            </button>
          </div>
        </header>
        <main className="main-content">
          {page === "analyzer" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="gold-line" /> PRECISION OVER PREDICTION
                  </div>
                  <h1>
                    See the chart. <span>Find your edge.</span>
                  </h1>
                  <p>
                    Forex & gold analysis built around structure, liquidity, and disciplined risk.
                  </p>
                </div>
                <button
                  className="gold-button main-upload"
                  onClick={() => {
                    setUpload(true);
                    analysis.reset();
                  }}
                >
                  <Upload size={17} /> Upload chart <span className="button-key">↗</span>
                </button>
              </div>
              <section className="upload-banner">
                <span className="upload-banner-icon">
                  <ImagePlus size={24} />
                </span>
                <div>
                  <strong>
                    {isSample
                      ? "Your next insight starts with a screenshot."
                      : "Bring the bigger picture into focus."}
                  </strong>
                  <p>
                    Upload from your gallery or capture your screen. Add multiple timeframes for
                    more context.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUpload(true);
                    analysis.reset();
                  }}
                >
                  Analyze a chart <ArrowRight size={15} />
                </button>
              </section>
              <div className="market-tabs">
                {instruments.map((item) => (
                  <button
                    key={item.symbol}
                    className={`market-tab ${symbol === item.symbol ? "selected" : ""}`}
                    onClick={() => {
                      setSymbol(item.symbol);
                      if (item.symbol !== result.instrument) {
                        setUpload(true);
                        analysis.reset();
                      }
                    }}
                  >
                    <span
                      className={`currency-mark ${item.symbol === "XAUUSD" ? "gold-mark" : ""}`}
                    >
                      {item.mark}
                    </span>
                    <span>
                      <strong>
                        {item.symbol}
                        <small>{item.symbol === "XAUUSD" ? "GOLD" : "FOREX"}</small>
                      </strong>
                      <span>{item.name}</span>
                    </span>
                    {symbol === item.symbol && <span className="market-indicator" />}
                  </button>
                ))}
                <button
                  className="add-market"
                  aria-label="Analyze another forex pair"
                  title="Analyze another instrument"
                  onClick={() => {
                    setSymbol("Other");
                    setUpload(true);
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="analysis-grid">
                <div className="chart-column">
                  <section className="panel chart-panel">
                    <div className="chart-heading">
                      <div className="chart-heading-title">
                        <span className="currency-mark gold-mark">
                          {result.instrument === "XAUUSD" ? "Au" : result.instrument.slice(0, 2)}
                        </span>
                        <div>
                          <h2>
                            {result.instrument === "XAUUSD"
                              ? "Gold / US Dollar"
                              : result.instrument}
                            <span className="tiny-tag">{isSample ? "DEMO" : "SCREENSHOT"}</span>
                          </h2>
                          <span className="small muted">
                            {result.instrument} <span className="middle-dot">·</span>{" "}
                            {result.timeframe} <span className="middle-dot">·</span>{" "}
                            {isSample
                              ? "Illustrative example"
                              : new Date(result.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label="Upload another chart"
                        title="Upload another chart"
                        onClick={() => setUpload(true)}
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                    <div className="timeframe-row">
                      <div className="timeframe-tabs">
                        {["5M", "15M", "30M", "1H", "4H", "1D"].map((t) => (
                          <button
                            className={timeframe === t ? "selected" : ""}
                            key={t}
                            onClick={() => {
                              setTimeframe(t);
                              if (t !== result.timeframe) setUpload(true);
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <span className="analysis-mode">
                        <Sparkles size={13} /> SMC + Price action
                      </span>
                    </div>
                    {!image && !isSample ? (
                      <div className="missing-chart">
                        <ImagePlus size={26} />
                        <p>
                          The screenshot wasn’t saved on this device. Your original analysis is
                          shown below.
                        </p>
                        <button className="secondary-button" onClick={() => setUpload(true)}>
                          Upload a new chart
                        </button>
                      </div>
                    ) : (
                      <Chart
                        image={image}
                        symbol={result.instrument}
                        timeframe={result.timeframe}
                      />
                    )}
                    {images.length > 1 && (
                      <div className="screenshot-tabs">
                        {images.map((img, i) => (
                          <button
                            className={selectedImage === i ? "selected" : ""}
                            key={i}
                            onClick={() => {
                              setImage(img.data);
                              setSelectedImage(i);
                            }}
                          >
                            {i + 1}. {img.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                  <section className="panel insights-panel">
                    <div className="insights-header">
                      <div className="insights-title">
                        <span className="ai-icon">
                          <Sparkles size={16} />
                        </span>
                        <h3>Chart insights</h3>
                        <span className="tiny-tag">{isSample ? "SAMPLE" : "AI"}</span>
                      </div>
                      <span className={`bias-label ${result.bias}`}>
                        <i className="dot" />
                        {result.bias} bias
                      </span>
                    </div>
                    <div className="insight-tabs">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "structure", label: "Market structure" },
                        { id: "liquidity", label: "Liquidity & zones" },
                        { id: "timeframes", label: "Timeframes" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          className={tab === t.id ? "selected" : ""}
                          onClick={() => setTab(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div className="insight-content">
                      {tab === "overview" ? (
                        <>
                          <h4>{result.headline}</h4>
                          <p>{result.summary}</p>
                          <div className="insight-chips">
                            <span>
                              <Layers size={13} /> Structure first
                            </span>
                            <span>
                              <Target size={13} /> Liquidity aware
                            </span>
                            <span>
                              <ShieldCheck size={13} /> Risk defined
                            </span>
                          </div>
                          {result.questions.length > 0 && (
                            <div className="clarification-box">
                              <strong>Before a setup can be considered</strong>
                              {result.questions.map((q) => (
                                <p key={q}>{q}</p>
                              ))}
                              <button className="text-button" onClick={() => setUpload(true)}>
                                Add clearer charts or context <ArrowRight size={13} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : tab === "structure" ? (
                        <>
                          <h4>Follow the structure, not the noise.</h4>
                          <p>{result.structure}</p>
                          <h4 className="subheading">Candle behavior</h4>
                          <p>{result.candles}</p>
                        </>
                      ) : tab === "liquidity" ? (
                        <>
                          <p>{result.liquidity}</p>
                          <div className="zone-list">
                            {result.zones.map((zone, i) => (
                              <div key={i}>
                                <span className={`zone-dot ${zone.type}`} />
                                <span>{zone.label}</span>
                                <strong>{zone.price}</strong>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="timeframe-context">
                          {result.timeframes.map((tf, i) => (
                            <div key={i}>
                              <span className="tf-box">{tf.timeframe}</span>
                              <div>
                                <strong>{tf.bias}</strong>
                                <p>{tf.observation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="insight-footer">
                      <ShieldCheck size={13} />
                      <span>
                        {isSample
                          ? "Example analysis. Upload your chart for an evidence-based review."
                          : result.cautions[0] ||
                            "Screenshot analysis, not live prices. Validate before any trade."}
                      </span>
                    </div>
                  </section>
                </div>
                <SetupPanel
                  result={result}
                  saved={saved.some((e) => e.result.id === result.id)}
                  save={save}
                  risk={risk}
                  openRisk={() => changePage("risk")}
                />
              </div>
              <section className="panel mentor-panel">
                <div className="mentor-heading">
                  <span className="mentor-icon">
                    <MessageSquare size={20} />
                  </span>
                  <div>
                    <h3>Your chart mentor</h3>
                    <p>A second perspective. A more disciplined decision.</p>
                  </div>
                  <span className="tiny-tag">
                    {isSample ? "EXAMPLE CONTEXT" : "CHART-AWARE AI"}
                  </span>
                </div>
                <div className="mentor-body">
                  {chat.length === 0 ? (
                    <div className="mentor-welcome">
                      <p>
                        {isSample
                          ? "Want to understand the example? Ask about the liquidity sweep, the confirmation, or when to stay out."
                          : "Ask me to explain the setup, challenge the bias, or help you identify invalidation."}
                      </p>
                      <div className="mentor-prompts">
                        {[
                          "What confirms this setup?",
                          "Where could this be a false breakout?",
                          "When should I stay out?",
                        ].map((prompt) => (
                          <button
                            key={prompt}
                            disabled={mentor.isPending}
                            onClick={() => askMentor(prompt)}
                          >
                            {prompt}
                            <ArrowUpRight size={13} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="chat-list">
                      {chat.map((message, i) => (
                        <div key={i} className={`chat-message ${message.role}`}>
                          <span>{message.role === "user" ? "YOU" : "FXWIZZY"}</span>
                          <p>{message.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {mentor.isPending && (
                    <div className="mentor-loading">
                      <LoaderCircle size={15} className="spin" /> Reviewing your question…
                    </div>
                  )}
                  {mentor.isError && <div className="error-message">{mentor.error.message}</div>}
                  <form
                    className="mentor-input"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void askMentor(question);
                    }}
                  >
                    <Sparkles size={17} />
                    <input
                      placeholder="Ask about structure, confirmation, or risk…"
                      aria-label="Ask your chart mentor"
                      value={question}
                      maxLength={2000}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button
                      aria-label="Send question"
                      disabled={!question.trim() || mentor.isPending}
                    >
                      <Send size={17} />
                    </button>
                  </form>
                </div>
              </section>
              <div className="workspace-footer">
                <span>
                  <ShieldCheck size={13} /> Trade with a plan. Never with a promise.
                </span>
                <button
                  className="text-button"
                  disabled={isSample}
                  onClick={() => exportAnalysis(result)}
                >
                  <Download size={13} /> Download analysis
                </button>
              </div>
            </>
          ) : page === "risk" ? (
            <RiskCalculator key={result.id} result={result} defaultRisk={risk} />
          ) : page === "journal" ? (
            <Journal entries={saved} open={openSaved} exportEntry={exportAnalysis} />
          ) : (
            <Guide />
          )}
          <footer className="legal-footer">
            Fxwizzy provides AI-assisted educational analysis, not financial advice. Leveraged
            trading involves substantial risk. No signal guarantees profit.
          </footer>
        </main>
      </div>
      {upload && (
        <UploadDialog
          close={() => setUpload(false)}
          analyze={analyze}
          busy={analysis.isPending}
          initialSymbol={symbol}
          initialTimeframe={timeframe}
          error={analysis.isError ? analysis.error.message : undefined}
        />
      )}
      {settings && (
        <Settings
          close={() => setSettings(false)}
          risk={risk}
          setRisk={(n) => {
            setRisk(n);
            try {
              localStorage.setItem("fxwizzy-risk", String(n));
            } catch {
              setToast("Preference could not be stored on this browser.");
            }
          }}
        />
      )}{" "}
      {toast && (
        <output className="toast" aria-live="polite">
          <Check size={17} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </output>
      )}
    </div>
  );
}
