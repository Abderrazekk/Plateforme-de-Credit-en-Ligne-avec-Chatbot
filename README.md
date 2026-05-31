# 🏦 Plateforme de Crédit en Ligne avec Chatbot IA

Une application web complète et sécurisée pour la gestion des crédits en ligne. Cette plateforme intègre des simulations financières, des tableaux de bord multi-rôles (Administrateur / Client), et un chatbot d'assistance interactif basé sur l'Intelligence Artificielle (Architecture RAG).

---

## ✨ Fonctionnalités Principales

* **👥 Espaces Multi-Rôles :** Tableaux de bord dédiés pour les clients (suivi des demandes, historique des paiements) et les administrateurs (gestion des utilisateurs, examen et validation des prêts).
* **🧮 Simulation de Crédit :** Outil de calcul instantané pour estimer les mensualités, les taux d'intérêt et les pénalités éventuelles.
* **🤖 Assistant Virtuel IA (Chatbot) :** Un chatbot intelligent basé sur une architecture RAG (Retrieval-Augmented Generation) capable de répondre aux questions des clients de manière précise en utilisant une base de connaissances métier.
* **📄 Gestion Documentaire :** Upload sécurisé des documents justificatifs, vérification, et génération automatique de contrats au format PDF.
* **🔔 Système de Notifications :** Alertes en temps réel pour l'état des demandes de crédit et les rappels d'échéances de paiement.

---

## 🛠️ Stack Technique

### Frontend (Client)
* **Framework :** React.js (Vite)
* **Styling :** Tailwind CSS
* **State Management :** Context API

### Backend (Serveur principal)
* **Environnement :** Node.js & Express.js
* **Base de données :** MongoDB & Mongoose
* **Authentification :** JWT (JSON Web Tokens)
* **Gestion des fichiers :** Multer
* **Génération PDF :** PDFKit / Puppeteer

### Intelligence Artificielle (Serveur Chatbot)
* **API / Framework :** Python & FastAPI
* **Orchestration LLM :** LangChain
* **Modèle de Langage :** API Groq (LLaMA-3.1-8b-instant)
* **Embeddings & Vector Store :** Ollama (nomic-embed-text) & FAISS

---

## 📂 Architecture du Projet

Le projet est divisé en trois micro-services principaux pour séparer la logique client, serveur et intelligence artificielle :

```text
credit-en-ligne/
│
├── client/          # Interface utilisateur (React/Vite)
├── server/          # API Principale (Node.js/Express)
└── zchatbot/        # API du Chatbot RAG (Python/FastAPI)

🚀 Installation & Démarrage en local
Prérequis
Assurez-vous d'avoir installé les éléments suivants sur votre machine :

Node.js (v16 ou supérieur)

Python (v3.9 ou supérieur)

MongoDB (Local ou cluster Atlas)

Ollama (Pour faire tourner le modèle d'embedding en local)

Une clé API Groq pour générer les réponses du chatbot.

1. Cloner le dépôt
git clone [https://github.com/Abderrazekk/Plateforme-de-Credit-en-Ligne-avec-Chatbot.git](https://github.com/Abderrazekk/Plateforme-de-Credit-en-Ligne-avec-Chatbot.git)
cd Plateforme-de-Credit-en-Ligne-avec-Chatbot

2. Démarrer le Serveur Backend (Node.js)
cd server
npm install
npm start


3. Démarrer le Frontend (React)
Ouvrez un nouveau terminal :
cd client
npm install
npm run dev


4. Démarrer le Chatbot IA (Python)
Assurez-vous qu'Ollama est en cours d'exécution sur votre machine, puis téléchargez le modèle d'embedding :
ollama pull nomic-embed-text
cd zchatbot

# Créer et activer un environnement virtuel (recommandé)
python -m venv venv
venv\Scripts\activate  # Sur Windows
# source venv/bin/activate  # Sur Mac/Linux

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env et y ajouter votre GROQ_API_KEY
echo GROQ_API_KEY=votre_cle_api_groq_ici > .env

# Lancer l'API FastAPI
python chatbot.py

L'API du chatbot sera accessible sur http://localhost:8000.



📝 Auteur
Abderrazekk * GitHub : @Abderrazekk
