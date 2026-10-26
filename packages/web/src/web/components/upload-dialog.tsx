import { useRef, useState } from "react";
import {
  X,
  Upload,
  ImagePlus,
  MonitorUp,
  Sparkles,
  LoaderCircle,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { imageFromFile } from "../lib/trading";
import { Modal } from './modal';

export type ChartImage = { data: string; name: string };
export function UploadDialog({
  close,
  analyze,
  busy,
  initialSymbol,
  initialTimeframe,
  error,
}: {
  close: () => void;
  analyze: (images: ChartImage[], symbol: string, timeframe: string, context: string) => void;
  busy: boolean;
  initialSymbol: string;
  initialTimeframe: string;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ChartImage[]>([]);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [context, setContext] = useState("");
  const [localError, setLocalError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  async function addFiles(files: FileList | File[]) {
    setLocalError("");
    setProcessing(true);
    try {
      if (files.length + images.length > 4)
        throw new Error("Upload up to four charts for multi-timeframe analysis.");
      const next = await Promise.all(
        Array.from(files).map(async (f) => ({ name: f.name, data: await imageFromFile(f) })),
      );
      setImages((prev) => [...prev, ...next]);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not read image.");
    } finally {
      setProcessing(false);
    }
  }
  async function capture() {
    setLocalError("");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setLocalError(
        "Screen capture is not supported here. Take a screenshot and upload it from your gallery.",
      );
      return;
    }
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1800 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImages((prev) =>
        [...prev, { data: canvas.toDataURL("image/jpeg", 0.9), name: "Screen capture" }].slice(
          0,
          4,
        ),
      );
    } catch {
      setLocalError("Screen capture was cancelled or blocked. Upload a screenshot instead.");
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
    }
  }
  return (
    <Modal className="upload-modal" titleId="upload-title" close={close} busy={busy}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">YOUR CHART. A CLEARER PERSPECTIVE.</span>
            <h2 id="upload-title">Analyze a chart</h2>
          </div>
          <button
            className="icon-btn"
            aria-label="Close upload dialog"
            disabled={busy}
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <p className="muted">
          Add up to 4 screenshots to connect the bigger picture with your entry timeframe.
        </p>
        <input
          ref={input}
          type="file"
          aria-label="Chart screenshot files"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div
          className={`drop-area ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) void addFiles(e.dataTransfer.files);
          }}
        >
          <div className="upload-orb">
            <ImagePlus size={27} />
          </div>
          <h3>Drop your chart screenshots here</h3>
          <p>PNG, JPG or WebP · Up to 15 MB each</p>
          <div className="button-row">
            <button
              className="gold-button"
              disabled={busy || processing || images.length >= 4}
              onClick={() => input.current?.click()}
            >
              <Upload size={16} /> Choose from gallery
            </button>
            <button
              className="secondary-button"
              disabled={busy || images.length >= 4}
              onClick={capture}
            >
              <MonitorUp size={16} /> Capture screen
            </button>
          </div>
        </div>
        {images.length > 0 && (
          <div className="image-list">
            {images.map((image, i) => (
              <div key={i}>
                <img src={image.data} alt={`Chart ${i + 1}`} />
                <span>{image.name}</span>
                <button
                  className="icon-btn"
                  disabled={busy}
                  aria-label={`Remove chart ${i + 1}`}
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="form-grid">
          <label>
            Instrument
            <select value={symbol} disabled={busy} onChange={(e) => setSymbol(e.target.value)}>
              {["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "Other"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Primary timeframe
            <select
              value={timeframe}
              disabled={busy}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              {["5M", "15M", "30M", "1H", "4H", "1D", "Unknown"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="context-label">
          Additional context <span className="muted">(optional)</span>
          <textarea
            aria-label="Additional chart context"
            disabled={busy}
            value={context}
            maxLength={3000}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Screenshot date/time, chart timeframes, current price, or what you’re watching…"
            rows={2}
          />
        </label>
        {(error || localError) && (
          <div className="error-message" role="alert">
            {localError || error}
          </div>
        )}
        <div className="privacy-line">
          <ShieldCheck size={15} />
          <span>Images are sent to the AI only when you click Analyze. No broker access.</span>
        </div>
        <button
          className="gold-button analyze-submit"
          disabled={!images.length || busy || processing}
          onClick={() => analyze(images, symbol, timeframe, context)}
        >
          {busy || processing ? (
            <LoaderCircle size={17} className="spin" />
          ) : (
            <Sparkles size={17} />
          )}{" "}
          {busy
            ? "Reading structure, liquidity & risk…"
            : processing
              ? "Preparing screenshots…"
              : "Analyze my charts"}
        </button>
    </Modal>
  );
}
