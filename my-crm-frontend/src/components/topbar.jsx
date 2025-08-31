export default function Topbar({ onLogout }) {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-sm">
      <h1 className="text-xl font-bold">SURENDHAR ENTERPRISES</h1>
      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
