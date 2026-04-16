export default function Sidebar({ activeSections, onClick }) {
  const sections = ["A", "B", "C", "D"];

  return (
    <div className="sidebar">
      {sections.map((s, index) => (
        <div
          key={s}
          className={`bullet ${
            activeSections.includes(index) ? "active" : ""
          }`}
          onClick={() => onClick(index)}
        >
          <span className="dot" />
          Section {s}
        </div>
      ))}
    </div>
  );
}