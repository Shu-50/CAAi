export default function Navbar() {
  return (
    <nav className="bg-darkCard shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-accent">Bill Manager</h1>
      <button className="bg-accent px-4 py-2 rounded-lg hover:opacity-90">
        + Add Bill
      </button>
    </nav>
  );
}
