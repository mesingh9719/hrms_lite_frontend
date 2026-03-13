export default function DateFilter({ value, onChange, onClear }) {
  return (
    <div className="filter-row">
      <label>Filter by date:</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={onClear}>Clear</button>
      )}
    </div>
  );
}
