import { forwardRef } from "react";
import { rooms } from "../data/rooms.js";

export const RoomMarkers = forwardRef(function RoomMarkers({ activeRoom, onSelectRoom }, ref) {
  return (
    <div ref={ref} className="room-markers" aria-label="Room shortcuts">
      {rooms.map((room) => (
        <button
          className={`room-marker${activeRoom.id === room.id ? " is-active" : ""}`}
          data-room={room.id}
          key={room.id}
          type="button"
          aria-label={`Explore ${room.name}`}
          onClick={() => onSelectRoom(room)}
        >
          <span className="marker-dot" aria-hidden="true" />{room.name}
        </button>
      ))}
    </div>
  );
});
