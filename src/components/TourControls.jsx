export function TourControls({ onReset, onZoom, timeOfDay, onChangeTimeOfDay }) {
  return (
    <footer className="tour-controls">
      <div className="drag-hint">
        <span className="drag-icon" aria-hidden="true">⤢</span>
        <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>
      </div>
      <div className="control-divider" />
      <button className="reset-button" type="button" onClick={onReset}>
        <span aria-hidden="true">⟳</span> Reset view
      </button>
      <div className="control-divider" />
      <label className="lighting-control">
        <span>TIME OF DAY</span>
        <select aria-label="Time of day" value={timeOfDay} onChange={onChangeTimeOfDay}>
          <option value="daylight">Daylight</option>
          <option value="golden-hour">Golden hour</option>
          <option value="dusk">Dusk</option>
          <option value="night">Night</option>
        </select>
      </label>
      <div className="control-divider" />
      <div className="zoom-controls" aria-label="Zoom controls">
        <button type="button" aria-label="Zoom out" onClick={() => onZoom(0.12)}>−</button>
        <span>ZOOM</span>
        <button type="button" aria-label="Zoom in" onClick={() => onZoom(-0.12)}>+</button>
      </div>
    </footer>
  );
}
