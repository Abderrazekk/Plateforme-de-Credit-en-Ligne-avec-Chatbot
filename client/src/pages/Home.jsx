import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const features = [
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: "Réponse rapide",
    desc: "Recevez une décision de principe en moins de 24 heures après la soumission de votre dossier complet.",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "100 % Sécurisé",
    desc: "Vos données personnelles et financières sont protégées par un chiffrement bancaire de niveau militaire.",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Taux compétitifs",
    desc: "Nous négocions les meilleures conditions du marché tunisien pour vous offrir des taux d'intérêt avantageux.",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    title: "Démarches simplifiées",
    desc: "Téléversez vos documents une seule fois et suivez l'avancement de votre dossier en temps réel.",
  },
];

const steps = [
  {
    num: "01",
    title: "Créez votre compte",
    desc: "Inscrivez-vous gratuitement en quelques minutes avec votre CIN et votre e-mail.",
    img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=480&q=80",
  },
  {
    num: "02",
    title: "Remplissez votre demande",
    desc: "Choisissez le type de crédit, le montant et la durée qui correspondent à votre projet.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=480&q=80",
  },
  {
    num: "03",
    title: "Joignez vos documents",
    desc: "Téléversez vos justificatifs (fiches de paie, relevés bancaires, pièce d'identité).",
    img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=480&q=80",
  },
  {
    num: "04",
    title: "Recevez votre réponse",
    desc: "Notre équipe analyse votre dossier et vous contacte avec une offre personnalisée.",
    img: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=480&q=80",
  },
];

const loanTypes = [
  {
    title: "Crédit Personnel",
    desc: "Financez vos projets personnels : voyage, mariage, rénovation ou dépenses imprévues.",
    range: "1 000 – 50 000 TND",
    duration: "Jusqu'à 84 mois",
    img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
    color: "from-blue-600 to-blue-800",
  },
  {
    title: "Crédit Immobilier",
    desc: "Réalisez votre rêve de propriété avec un financement adapté à votre capacité de remboursement.",
    range: "50 000 – 100 000 TND",
    duration: "Jusqu'à 60 mois",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    color: "from-emerald-600 to-emerald-800",
  },
  {
    title: "Crédit Auto",
    desc: "Acquérez le véhicule de vos rêves avec des mensualités flexibles et des conditions avantageuses.",
    range: "5 000 – 80 000 TND",
    duration: "Jusqu'à 60 mois",
    img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80",
    color: "from-violet-600 to-violet-800",
  },
];

const stats = [
  { value: "10 000+", label: "Clients satisfaits" },
  { value: "98 %", label: "Taux de satisfaction" },
  { value: "24h", label: "Délai de réponse moyen" },
  { value: "+5 Types", label: "De crédits disponibles" },
];

const testimonials = [
  {
    name: "Sarra Mejri",
    role: "Ingénieure, Tunis",
    text: "J'ai obtenu mon crédit immobilier en moins d'une semaine. La plateforme est intuitive et l'équipe très réactive.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
  },
  {
    name: "Mehdi Trabelsi",
    role: "Entrepreneur, Sfax",
    text: "Excellent service ! Les taux proposés sont imbattables et la procédure entièrement en ligne m'a vraiment facilité la vie.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    name: "Yasmine Chaabane",
    role: "Médecin, Sousse",
    text: "J'apprécie la transparence totale sur les conditions du crédit. Aucune mauvaise surprise, tout est clair dès le départ.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80')",
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest text-cyan-400 uppercase mb-6 border border-cyan-500/30 rounded-full px-4 py-1.5 bg-cyan-500/10">
              Plateforme de crédit en ligne
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Votre crédit,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                en toute simplicité
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg">
              CréditTunisie vous accompagne dans tous vos projets. Simulez,
              demandez et suivez votre crédit entièrement en ligne, sans vous
              déplacer.
            </p>
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <p className="text-slate-300 self-center">
                  Bonjour, <strong className="text-white">{user.prenom}</strong>{" "}
                  !
                </p>
                <Link
                  to={`/${user.role}/dashboard`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200"
                >
                  Mon tableau de bord
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200"
                >
                  Commencer gratuitement
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Se connecter
                </Link>
              </div>
            )}
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-6 text-slate-400 text-sm">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Sans frais de dossier
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                100 % en ligne
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Réponse en 24h
              </span>
            </div>
          </div>

          {/* Right card mockup */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50">
              <img
                src="https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=700&q=80"
                alt="Dashboard aperçu"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              {/* Floating stat card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <p className="text-xs text-slate-300 mb-1">Demande en cours</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-lg">25 000 TND</p>
                    <p className="text-cyan-400 text-sm">
                      Crédit Personnel · 48 mois
                    </p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                    En analyse
                  </span>
                </div>
              </div>
            </div>
            {/* Floating badge top-right */}
            <div className="absolute -top-4 -right-4 bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg shadow-cyan-500/40">
              15 000+ clients
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60L1440 60L1440 30C1200 60 960 0 720 0C480 0 240 60 0 30L0 60Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-blue-700 mb-1">
                  {s.value}
                </p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Pourquoi nous choisir
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              Une expérience crédit réinventée
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Nous combinons technologie moderne et expertise financière pour
              vous offrir le meilleur service de crédit en ligne en Tunisie.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Comment ça marche
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              4 étapes simples
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              De la création de compte à la réception de votre offre, tout se
              passe en ligne, à votre rythme.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(100%-0px)] w-full h-0.5 bg-blue-100 z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="relative inline-block mb-6">
                    <img
                      src={step.img}
                      alt={step.title}
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute -top-2 -right-2 w-9 h-9 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-200"
              >
                Démarrer ma demande
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── LOAN TYPES ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Nos produits
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              Choisissez votre crédit
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              Des solutions de financement adaptées à chaque besoin et à chaque
              profil.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {loanTypes.map((loan) => (
              <div
                key={loan.title}
                className="group rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={loan.img}
                    alt={loan.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${loan.color} opacity-70`}
                  />
                  <h3 className="absolute bottom-4 left-6 text-white font-extrabold text-xl">
                    {loan.title}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    {loan.desc}
                  </p>
                  <div className="flex justify-between text-sm mb-6">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Montant</p>
                      <p className="font-semibold text-slate-800">
                        {loan.range}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Durée</p>
                      <p className="font-semibold text-slate-800">
                        {loan.duration}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={user ? `/${user.role}/apply-loan` : "/register"}
                    className="block text-center bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors duration-200"
                  >
                    Faire une demande
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Témoignages
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3">
              Ils nous font confiance
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-md transition-shadow duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {t.name}
                    </p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Prêt à concrétiser votre projet ?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Rejoignez les milliers de Tunisiens qui ont choisi CréditTunisie
            pour financer leurs projets de vie.
          </p>
          {user ? (
            <Link
              to={`/${user.role}/dashboard`}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors duration-200 shadow-xl"
            >
              Accéder à mon espace
            </Link>
          ) : (
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors duration-200 shadow-xl"
              >
                Créer un compte
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors duration-200"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">
                  CréditTunisie
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                La plateforme de référence pour vos demandes de crédit en ligne
                en Tunisie. Simple, rapide et sécurisé.
              </p>
              <div className="flex gap-3">
                {/* Facebook */}
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links: Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Société
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "À propos de nous", href: "/about" },
                  { label: "Contactez-nous", href: "/contact" },
                  { label: "Comment ça marche", href: "/how" },
                  { label: "Nos crédits", href: "/credits" },
                  { label: "Simulation de crédit", href: "/simulate" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Contact
              </h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 mt-0.5 text-blue-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Avenue Habib Bourguiba, Tunis 1000, Tunisie</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-blue-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>+216 71 000 000</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-blue-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>contact@credittunisie.tn</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>
              © {new Date().getFullYear()} CréditTunisie. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
