const SearchBar = () => {
  return (
    <section className="max-w-3xl mx-auto w-full mt-6 md:mt-10">
      <div className="flex items-center bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
        {/* Icono de ubicación */}
        <div className="px-4 text-black/60">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 21s6-5.686 6-11a6 6 0 10-12 0c0 5.314 6 11 6 11z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Buscar empresas, servicios y más…"
          className="flex-1 px-2 py-3 md:py-4 text-[15px] focus:outline-none"
          aria-label="Buscar"
        />

        {/* Botón de búsqueda */}
        <button className="px-4 py-3 md:py-4 bg-gradient-to-r from-yellow-300 to-amber-400 text-[#1b1b1f] font-bold hover:contrast-110 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default SearchBar;
