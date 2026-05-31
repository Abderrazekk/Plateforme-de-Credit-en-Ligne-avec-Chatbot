export default function Credits() {
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Nos crédits</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Crédit auto</h2>
          <p className="text-gray-600 mb-2">Financez votre voiture neuve ou d’occasion jusqu’à 50 000 TND.</p>
          <ul className="text-sm text-gray-500 list-disc pl-4">
            <li>Taux : 8,5 %</li>
            <li>Durée : 12 à 60 mois</li>
          </ul>
        </div>
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Crédit travaux</h2>
          <p className="text-gray-600 mb-2">Rénovez votre maison avec un financement sur mesure.</p>
          <ul className="text-sm text-gray-500 list-disc pl-4">
            <li>Taux : 8,5 %</li>
            <li>Durée : 6 à 48 mois</li>
          </ul>
        </div>
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Crédit études</h2>
          <p className="text-gray-600 mb-2">Financez vos études ou celles de vos enfants.</p>
          <ul className="text-sm text-gray-500 list-disc pl-4">
            <li>Taux : 8,5 %</li>
            <li>Durée : 6 à 36 mois</li>
          </ul>
        </div>
        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Crédit santé</h2>
          <p className="text-gray-600 mb-2">Couvrez vos dépenses médicales imprévues.</p>
          <ul className="text-sm text-gray-500 list-disc pl-4">
            <li>Taux : 8,5 %</li>
            <li>Durée : 3 à 24 mois</li>
          </ul>
        </div>
      </div>
    </div>
  );
}