import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          Vision Roadmap
        </Link>
        <Link
          to="/chat"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Open Chat
        </Link>
      </div>
    </nav>
  );
}
