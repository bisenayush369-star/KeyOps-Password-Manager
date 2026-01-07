function Navbar() {
  return (
    <nav className="h-16 bg-purple-900 text-white px-10 flex items-center justify-between">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold text-purple-300">
        &lt;Key<span className="text-white">Ops</span> /&gt;
      </h1>

      {/* GitHub Button (white border, pill) */}
      <a
        href="https://github.com/bisenayush369-star/KeyOps-Password-Manager"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 border border-white text-white px-5 py-2 rounded-full hover:bg-purple-700 transition"
      >
        <img
          src="/icon/github.svg"
          alt="GitHub"
          className="w-5 h-5 invert"
        />
        <span className="text-sm font-semibold">
          GitHub
        </span>
      </a>

    </nav>
  );
}

export default Navbar;
