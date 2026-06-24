import { useState, useEffect, useRef } from 'react';

const WIDTH_OPTIONS = ['100%', '800px', '1000px', '1200px'];
const HEIGHT_OPTIONS = ['600px', '700px', '800px', '900px'];

function EmbedModal({ onClose }) {
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('700px');
  const [copied, setCopied] = useState(false);
  const snippetRef = useRef(null);

  // Build the src URL — auto-detects current origin so it works in dev and after deploy
  const src = `${window.location.origin}${window.location.pathname}?embed=true`;

  const snippet = `<iframe
  src="${src}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="clipboard-write"
  style="border:none;border-radius:12px;">
</iframe>`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Embed Calculator">
        <div className="modal-header">
          <h2 className="modal-title">Embed this Calculator</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Paste this code into any webpage to embed the ROI calculator.
          </p>

          {/* Size controls */}
          <div className="embed-controls">
            <div className="embed-control">
              <label>Width</label>
              <select value={width} onChange={e => setWidth(e.target.value)}>
                {WIDTH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="embed-control">
              <label>Height</label>
              <select value={height} onChange={e => setHeight(e.target.value)}>
                {HEIGHT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Code snippet */}
          <div className="embed-snippet-wrapper">
            <pre className="embed-snippet" ref={snippetRef}>{snippet}</pre>
          </div>

          {/* Copy button */}
          <button
            className={`btn embed-copy-btn${copied ? ' embed-copy-btn--copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmbedModal;
