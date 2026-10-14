import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/pages/dashboard/components/ui';

/* A deterministic pseudo-QR rendered as a plain CSS grid. No SVG and no QR
   dependency: the pattern is seeded from the referral value so every code gets
   its own stable look, complete with the three corner finder squares. */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function qrMatrix(value: string, n = 21): boolean[][] {
  const rand = makeRandom(hashSeed(value || 'STA'));
  const m: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => rand() > 0.52));

  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const r = Math.max(Math.abs(x - 3), Math.abs(y - 3));
        m[oy + y][ox + x] = r === 3 || r <= 1;
      }
    }
    for (let y = -1; y < 8; y += 1) {
      for (let x = -1; x < 8; x += 1) {
        if (x >= 0 && x <= 6 && y >= 0 && y <= 6) continue;
        const gy = oy + y;
        const gx = ox + x;
        if (gy >= 0 && gx >= 0 && gy < n && gx < n) m[gy][gx] = false;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(n - 7, 0);
  drawFinder(0, n - 7);
  return m;
}

export function QrCode({ value, size = 176 }: { value: string; size?: number }) {
  const matrix = qrMatrix(value);
  return (
    <div className="qr" style={{ width: size, height: size }}>
      {matrix.map((row, y) => row.map((on, x) => (
        <span key={`${x}-${y}`} className={on ? 'qr-on' : 'qr-off'} />
      )))}
    </div>
  );
}

export function QrDownloadModal({
  open, onClose, value, target, onDownload,
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  target: string;
  onDownload: () => void;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Modal open={open} onClose={onClose} title={t('dashboard.qr.title')} sub={t('dashboard.qr.sub')}>
      <div className="qr-wrap">
        <QrCode value={value} />
      </div>
      <div className="code-box" style={{ marginTop: 14 }}>
        <div>
          <div className="small muted">{target}</div>
          <div className="val">{value}</div>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn primary" onClick={onDownload}>
          <i className="ri-download-2-line" /> {t('dashboard.qr.download')}
        </button>
        <button type="button" className="btn ghost" onClick={copy}>
          <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} /> {copied ? t('dashboard.common.copied') : t('dashboard.common.copy')}
        </button>
      </div>
    </Modal>
  );
}