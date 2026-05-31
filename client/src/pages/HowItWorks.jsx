export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Comment ça marche</h1>
      <div className="space-y-8">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">1</div>
          <div>
            <h2 className="text-lg font-semibold">Inscrivez-vous</h2>
            <p className="text-gray-600">Créez un compte en quelques clics avec vos informations personnelles.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
          <div>
            <h2 className="text-lg font-semibold">Téléversez vos documents</h2>
            <p className="text-gray-600">Fournissez votre CIN, justificatif de revenu et autres pièces demandées.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">3</div>
          <div>
            <h2 className="text-lg font-semibold">Faites votre demande</h2>
            <p className="text-gray-600">Remplissez le formulaire avec le montant et la durée souhaités. Recevez une simulation instantanée.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">4</div>
          <div>
            <h2 className="text-lg font-semibold">Attendez la décision</h2>
            <p className="text-gray-600">Notre équipe examine votre dossier et vous notifie de la décision.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">5</div>
          <div>
            <h2 className="text-lg font-semibold">Recevez votre crédit</h2>
            <p className="text-gray-600">Une fois approuvé, le montant est décaissé et vous commencez à rembourser selon l’échéancier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}