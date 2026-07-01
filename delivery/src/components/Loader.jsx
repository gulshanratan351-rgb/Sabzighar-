export default function Loader({ full }) {
  return (
    <div className="loader" style={full ? { minHeight: '100vh' } : {}}>
      <div className="spinner" />
    </div>
  );
}
