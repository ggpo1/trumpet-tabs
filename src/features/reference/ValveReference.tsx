const REFERENCE_ITEMS: [string, string][] = [
  ['до / C', '○'],
  ['ре / D', '1'],
  ['ми / E', '1+2'],
  ['фа / F', '1'],
  ['соль / G', '○'],
  ['ля / A', '1+2'],
  ['си / B', '2'],
];

export function ValveReference() {
  return (
    <section className="reference">
      <h2>Справка: клапаны Bb-трубы</h2>
      <div className="reference-grid">
        {REFERENCE_ITEMS.map(([note, fingering]) => (
          <div key={note} className="reference-item">
            <span>{note}</span>
            <strong>{fingering}</strong>
          </div>
        ))}
      </div>
      <p className="hint">○ — все клапаны открыты. Цифры — зажатые клапаны.</p>
    </section>
  );
}
