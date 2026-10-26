import { BOARD_URL } from "../data/pins.js";

export function SiteHeader() {
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="G and L home">
        <span className="brand-mark">G<span>&</span>L</span>
        <span className="brand-rule" />
        <span className="brand-caption">A HOME IN THE MAKING</span>
      </a>
      <div className="topbar-center"><span className="live-dot" /> OUR LITTLE VISION BOARD</div>
      <a className="board-link" href={BOARD_URL} target="_blank" rel="noreferrer">
        <span>Open our Pinterest board</span><span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
