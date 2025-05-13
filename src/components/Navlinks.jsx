// NavLinks.jsx
import { Link } from "react-router-dom";

export const NavLinks = ({ mobile, closeSidebar }) => (
  <ul className={`flex ${mobile ? "flex-col space-y-6" : "space-x-8"}`}>
    {[ "Menu", "Order", "Best Online Service"].map((item) => (
      <li key={item}>
        <Link
          to={`/${item.toLowerCase().replace(/ /g, '')}`}
          onClick={closeSidebar}
          className="text-white hover:text-red-100 font-medium relative group transition-colors"
        >
          {item}
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-100 transition-all group-hover:w-full" />
        </Link>
      </li>
    ))}
  </ul>
);

export const AuthButtons = () => (
  <div className="flex space-x-4">
    <Link
      to="/signin"
      className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
    >
      Sign In
    </Link>
    <Link
      to="/signup"
      className="px-6 py-2 rounded-full bg-white text-red-700 hover:bg-red-50 transition-colors font-semibold"
    >
      Sign Up
    </Link>
  </div>
);