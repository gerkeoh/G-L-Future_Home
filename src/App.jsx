import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { HomeIntro } from "./components/HomeIntro.jsx";
import { InspirationPanel } from "./components/InspirationPanel.jsx";
import { RoomMarkers } from "./components/RoomMarkers.jsx";
import { RoomPanel } from "./components/RoomPanel.jsx";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { TourControls } from "./components/TourControls.jsx";
import { rooms } from "./data/rooms.js";
import { createHouseScene } from "./scene/createHouseScene.js";
import "../styles.css";

export function App() {
  const canvasRef = useRef(null);
  const markerContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [savedRooms, setSavedRooms] = useState(() => new Set());
  const [sceneError, setSceneError] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState("golden-hour");

  function selectRoom(room) {
    setActiveRoom(room);
    sceneRef.current?.transitionTo(
      sceneRef.current.worldFocus(room.focus),
      false,
      room.cameraOffset,
    );
  }

  useEffect(() => {
    try {
      sceneRef.current = createHouseScene(canvasRef.current, markerContainerRef.current, selectRoom);
      return () => {
        sceneRef.current?.dispose();
        sceneRef.current = null;
      };
    } catch (error) {
      console.error("Unable to initialize the 3D home tour.", error);
      setSceneError(true);
    }
  }, []);

  function toggleSavedRoom() {
    setSavedRooms((current) => {
      const next = new Set(current);
      if (next.has(activeRoom.id)) next.delete(activeRoom.id);
      else next.add(activeRoom.id);
      return next;
    });
  }

  function zoom(factor) {
    sceneRef.current?.zoomBy(factor);
  }

  function changeTimeOfDay(event) {
    const nextTimeOfDay = event.target.value;
    setTimeOfDay(nextTimeOfDay);
    sceneRef.current?.setTimeOfDay(nextTimeOfDay);
  }

  function resetView() {
    setActiveRoom(rooms[0]);
    sceneRef.current?.transitionTo(new Vector3(0, 0, 0), true);
  }

  return (
    <main className="tour" aria-label="Interactive 3D house tour">
      <canvas ref={canvasRef} id="home-canvas" aria-label="3D model of your future home" />
      <div className="scene-wash" aria-hidden="true" />
      <SiteHeader />
      <HomeIntro />
      <RoomPanel
        activeRoom={activeRoom}
        savedRooms={savedRooms}
        onSelectRoom={selectRoom}
        onToggleSaved={toggleSavedRoom}
      />
      <InspirationPanel activeRoom={activeRoom} />
      <RoomMarkers ref={markerContainerRef} activeRoom={activeRoom} onSelectRoom={selectRoom} />
      <TourControls
        onReset={resetView}
        onZoom={zoom}
        timeOfDay={timeOfDay}
        onChangeTimeOfDay={changeTimeOfDay}
      />
      {sceneError && (
        <div className="error-state">
          <strong>We couldn’t open the 3D tour.</strong>
          <span>Please check your connection and reload the page.</span>
        </div>
      )}
    </main>
  );
}
