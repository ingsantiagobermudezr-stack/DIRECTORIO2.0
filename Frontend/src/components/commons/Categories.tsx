import { Apple, Store, Car, Stethoscope, Wrench, Briefcase, GraduationCap, Utensils } from "lucide-react";

interface Category {
  icon: JSX.Element;
  label: string;
  href: string;
}

const categories: Category[] = [
  { icon: <Apple className="w-7 h-7 stroke-amber-600" />, label: "Alimentos", href: "/empresas?cat=alimentos" },
  { icon: <Store className="w-7 h-7 stroke-amber-600" />, label: "Tiendas", href: "/empresas?cat=tiendas" },
  { icon: <Car className="w-7 h-7 stroke-amber-600" />, label: "Automotriz", href: "/empresas?cat=automotriz" },
  { icon: <Stethoscope className="w-7 h-7 stroke-amber-600" />, label: "Salud", href: "/empresas?cat=salud" },
  { icon: <Wrench className="w-7 h-7 stroke-amber-600" />, label: "Servicios", href: "/empresas?cat=servicios" },
  { icon: <GraduationCap className="w-7 h-7 stroke-amber-600" />, label: "Educación", href: "/empresas?cat=educacion" },
  { icon: <Briefcase className="w-7 h-7 stroke-amber-600" />, label: "Profesionales", href: "/empresas?cat=profesionales" },
  { icon: <Utensils className="w-7 h-7 stroke-amber-600" />, label: "Restaurantes", href: "/empresas?cat=restaurantes" },
];

const Categories = () => {
  return (
    <section className="py-10 md:py-14">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center">Directorios</h2>
      <p className="mt-2 text-center text-black/60">Explora empresas por categoría</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat) => (
          <a
            key={cat.label}
            href={cat.href}
            className="group rounded-2xl bg-white border border-black/5 shadow-sm p-6 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition"
          >
            <div className="w-14 h-14 rounded-2xl grid place-items-center bg-amber-50 group-hover:bg-amber-100 transition">
              {cat.icon}
            </div>
            <span className="font-semibold text-center">{cat.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Categories; 
