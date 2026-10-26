import { rooms } from "../data/rooms.js";
import { RoomList } from "./RoomList.jsx";

export function RoomPanel({ activeRoom, savedRooms, onSelectRoom, onToggleSaved }) {
  const isSaved = savedRooms.has(activeRoom.id);

  return (
    <aside className="room-panel glass-panel" aria-label="Explore rooms">
      <div className="panel-heading">
        <span className="eyebrow">TAKE A LITTLE TOUR</span>
        <span className="room-count">{String(rooms.length).padStart(2, "0")} SPACES</span>
      </div>
      <RoomList activeRoom={activeRoom} onSelectRoom={onSelectRoom} />
      <div className="room-detail" aria-live="polite">
        <div className="detail-topline">
          <span className="eyebrow">{activeRoom.kicker}</span>
          <button
            className={`favorite-button${isSaved ? " is-saved" : ""}`}
            type="button"
            aria-label={isSaved ? "Unsave this room" : "Save this room"}
            aria-pressed={isSaved}
            onClick={onToggleSaved}
          >
            <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
          </button>
        </div>
        <h2>{activeRoom.title}</h2>
        <p>{activeRoom.description}</p>
        <div className="detail-tags">
          {activeRoom.tags.map((tag) => <span className="detail-tag" key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="panel-hint"><span aria-hidden="true">✳</span> Pick a room to wander in</div>
    </aside>
  );
}
