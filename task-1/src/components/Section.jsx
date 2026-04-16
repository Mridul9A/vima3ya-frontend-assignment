export default function Section({ title, innerRef, children }) {
  return (
    <div ref={innerRef} className="section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}