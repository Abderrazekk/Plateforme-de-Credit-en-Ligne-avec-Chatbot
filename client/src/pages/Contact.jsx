export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Contact</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <p className="text-gray-600">
          Pour toute question, vous pouvez nous joindre par les moyens suivants :
        </p>
        <div>
          <span className="font-semibold">Téléphone :</span> +216 71 234 567
        </div>
        <div>
          <span className="font-semibold">Email :</span> contact@credittunisie.tn
        </div>
        <div>
          <span className="font-semibold">Adresse :</span> 12 Avenue Habib Bourguiba, Tunis 1000
        </div>
        <div>
          <span className="font-semibold">Horaires :</span> Lundi – Vendredi, 8h – 17h
        </div>
      </div>
    </div>
  );
}