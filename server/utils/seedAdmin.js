import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      const adminData = {
        nom: process.env.ADMIN_NOM || 'Admin',
        prenom: process.env.ADMIN_PRENOM || 'Principal',
        email: process.env.ADMIN_EMAIL || 'admin@credit.tn',
        telephone: process.env.ADMIN_TELEPHONE || '22123456',
        password: process.env.ADMIN_PASSWORD || 'Admin1234',
        role: 'admin',
      };

      await User.create(adminData);
      console.log('✅ Admin par défaut créé avec succès');
    } else {
      console.log('ℹ️  Un admin existe déjà, aucune création automatique');
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'admin : ${error.message}`);
  }
};

export default seedAdmin;