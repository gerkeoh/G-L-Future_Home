import { BOARD_URL } from "../data/pins.js";

export function InspirationPanel({ activeRoom }) {
  return (
    <aside className="inspiration-panel glass-panel" aria-label="Pinterest inspiration">
      <div className="inspiration-heading">
        <div><span className="eyebrow">THE LITTLE DETAILS</span><h2>Things we love</h2></div>
        <span className="sparkle" aria-hidden="true">✳</span>
      </div>
      <div className="inspiration-list">
        {activeRoom.images.map((pin) => (
          <a className="inspiration-card" href={BOARD_URL} target="_blank" rel="noreferrer" key={pin.title}>
            <img src={pin.image} alt={pin.alt} loading="lazy" />
            <span>{pin.title}</span>
          </a>
        ))}
      </div>
      <a className="all-pins-link" href={BOARD_URL} target="_blank" rel="noreferrer">
        See all 49 pins <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
