import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatTND } from '../../utils/formatCurrency';

export default function OverduePayments() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/overdue')
      .then(res => setOverdue(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Gestion des retards de paiement</h1>
      {overdue.length === 0 ? (
        <p className="text-gray-600">Aucun paiement en retard.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jours retard</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pénalité</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overdue.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 bg-red-50">
                  <td className="px-4 py-3 text-sm">
                    {item.client?.nom} {item.client?.prenom}<br/>
                    <span className="text-xs text-gray-500">{item.client?.telephone}</span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{item.objet}</td>
                  <td className="px-4 py-3 text-sm">{new Date(item.dateEcheance).toLocaleDateString('fr-TN')}</td>
                  <td className="px-4 py-3 font-medium">{formatTND(item.montant)}</td>
                  <td className="px-4 py-3 text-red-600 font-bold">{item.joursRetard} jours</td>
                  <td className="px-4 py-3">{formatTND(item.penalite)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/loans/${item.loanId}`} className="text-blue-600 hover:underline text-xs">
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}