import type { AppRouterClient } from '../../api';
export type Analysis = Awaited<ReturnType<AppRouterClient['analysis']['analyze']>>;
export type SavedAnalysis = { result: Analysis; image?: string; name: string };
export const sample: Analysis = {
  id: 'sample', createdAt: '', instrument: 'XAUUSD', timeframe: '1H', status: 'conditional', bias: 'bullish',
  headline: 'A patient approach to the upside', summary: 'Illustrative example: price has reclaimed a prior swing high after a sell-side liquidity sweep. A retest of the demand zone could offer a conditional long—only after a clear bullish close.',
  structure: 'The illustrated chart shifts from lower highs to higher highs and higher lows. A break above the prior swing high suggests a potential bullish change of character. Wait for the retest, not the first impulse.',
  liquidity: 'Sell-side liquidity is illustrated below the recent equal lows. A sweep and reclaim is followed by expansion. Prior highs are possible buy-side liquidity targets; a wick through them alone is not a confirmed breakout.',
  candles: 'Look for a bullish rejection candle in the demand zone, followed by a close above its high. A strong close below the zone invalidates this hypothetical long scenario.',
  timeframes: [{ timeframe: '1H', bias: 'Bullish example', observation: 'Illustrated change of character.' }, { timeframe: '4H', bias: 'Not supplied', observation: 'Upload a higher-timeframe chart to verify the wider trend.' }, { timeframe: '15M', bias: 'Not supplied', observation: 'Upload an entry-timeframe chart for confirmation.' }],
  zones: [{ label: 'Buy-side liquidity', price: '2,368.00', type: 'liquidity' }, { label: 'Prior resistance', price: '2,352.00', type: 'resistance' }, { label: 'Demand zone', price: '2,330–2,334', type: 'support' }],
  setup: { direction: 'BUY', entry: 2332, entryHigh: 2334, stopLoss: 2320, targets: [2344, 2356, 2368], trigger: 'Wait for a bullish candle close above the demand zone and a confirmed retest. This is an example, not an executable signal.', invalidation: 'A decisive 1H close below 2,320 invalidates this illustrative setup.' },
  questions: [], cautions: ['Sample data only. These are not current gold prices.', 'Check high-impact news, spread and your broker’s contract size before any real trade.'],
};
export function price(n: number | null, instrument = 'XAUUSD') { return n === null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: instrument.includes('JPY') ? 3 : instrument === 'XAUUSD' ? 2 : 5, maximumFractionDigits: instrument.includes('JPY') ? 3 : instrument === 'XAUUSD' ? 2 : 5 }); }
export function rr(entry: number | null, stop: number | null, target: number) { return entry !== null && stop !== null && entry !== stop ? (Math.abs(target - entry) / Math.abs(entry - stop)).toFixed(1) : '—'; }
export function loadSaved(): SavedAnalysis[] { try { return JSON.parse(localStorage.getItem('fxwizzy-journal') || '[]'); } catch { return []; } }
export async function imageFromFile(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Use a PNG, JPG or WebP chart image.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB.');
  const bitmap = await createImageBitmap(file); const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return canvas.toDataURL('image/jpeg', .9);
}