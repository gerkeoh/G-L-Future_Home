import { rooms } from "../data/rooms.js";

export function RoomList({ activeRoom, onSelectRoom }) {
  return (
    <nav className="room-list" aria-label="Rooms">
      {rooms.map((room, index) => (
        <button
          className={`room-button${activeRoom.id === room.id ? " is-active" : ""}`}
          key={room.id}
          type="button"
          aria-pressed={activeRoom.id === room.id}
          onClick={() => onSelectRoom(room)}
        >
          <span className="room-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="room-name">{room.name}</span>
          <span className="room-arrow" aria-hidden="true">→</span>
        </button>
      ))}
    </nav>
  );
}
