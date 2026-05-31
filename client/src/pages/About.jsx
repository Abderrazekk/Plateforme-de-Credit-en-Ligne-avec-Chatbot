import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animation-fade-in">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* En-tête / Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-gray-900 sm:text-5xl tracking-tight mb-6">
            Simplifier l'accès au crédit, <br className="hidden sm:block" />
            <span className="text-blue-600">100% en ligne.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Chez <span className="font-bold text-gray-800">E-Crédit</span>, nous transformons l'expérience d'emprunt. 
            Fini les formalités administratives interminables et les délais d'attente obscurs. 
            Nous vous offrons une plateforme sécurisée, transparente et rapide pour réaliser vos projets.
          </p>
        </div>

        {/* Section Mission & Vision */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Notre objectif est de démocratiser l'accès au financement en Tunisie en digitalisant 
                l'intégralité du processus. De la simulation de votre mensualité jusqu'au décaissement, 
                tout se fait depuis votre écran, en quelques clics.
              </p>
              <ul className="space-y-3">
                {[
                  "Traitement accéléré des demandes",
                  "Zéro papier, gestion documentaire sécurisée",
                  "Transparence totale sur les taux et échéances"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 font-medium">
                    <svg className="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-600 p-10 md:p-16 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-700 rounded-full opacity-50 blur-2xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Votre Assistant Dédié</h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                  Parce que le monde de la finance peut sembler complexe, notre plateforme intègre 
                  un assistant virtuel intelligent disponible 24h/24 et 7j/7 pour répondre à toutes 
                  vos questions et vous guider pas à pas.
                </p>
                <Link
                  to="/chat"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
                >
                  Découvrir notre Chatbot
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section Nos Valeurs / Pourquoi nous ? */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi choisir E-Crédit ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carte 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité Absolue</h3>
              <p className="text-gray-600">
                Vos données personnelles et financières sont cryptées et stockées en toute sécurité. 
                Nous respectons les normes de confidentialité les plus strictes.
              </p>
            </div>

            {/* Carte 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparence</h3>
              <p className="text-gray-600">
                Pas de frais cachés. Vous générez vos échéanciers en PDF et suivez l'état de vos 
                remboursements en temps réel depuis votre espace client.
              </p>
            </div>

            {/* Carte 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Notifications Proactives</h3>
              <p className="text-gray-600">
                Recevez des alertes SMS et Email pour chaque étape de votre dossier et restez 
                informé de vos prochaines échéances sans y penser.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à concrétiser vos projets ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de clients qui ont déjà fait confiance à notre plateforme 
            pour financer leur avenir de manière simple et rapide.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-900/50"
            >
              Créer mon compte
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 border border-gray-700 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}