import { motion } from "motion/react";
import { Link } from "react-router";
import { Scan, Brain, Shield, Zap, ArrowRight, CheckCircle2, Video } from "lucide-react";

export function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "IA Avancée",
      description: "Reconnaissance faciale haute précision avec deep learning",
    },
    {
      icon: Zap,
      title: "Temps Réel",
      description: "Détection instantanée et enregistrement automatique",
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Cryptage des données et respect de la confidentialité",
    },
  ];

  const benefits = [
    "Gain de temps jusqu'à 90% sur la prise de présence",
    "Précision de reconnaissance supérieure à 90%",
    "Analyse et rapports automatisés",
    "Interface intuitive et facile d'utilisation",
    "Support video et webcam",
    "Historique complet et exportation des données",
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 overflow-hidden">
        <div className="max-w-[90rem] w-full mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 max-w-6xl mx-auto"
            >
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  Gestion de Présence
                </span>
                <br />
                <span className="text-white">Nouvelle Génération</span>
              </h1>

              <p className="max-w-5xl mx-auto text-xl text-gray-300 leading-relaxed">
                Automatisez la gestion des présences avec notre système intelligent de reconnaissance faciale.
                Précis, rapide et sécurisé.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link
                  to="/live"
                  className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all"
                >
                  <span>Reconnaissance Live</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/video"
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/50 hover:scale-105 transition-all"
                >
                  <Video className="w-5 h-5" />
                  <span>Analyse Vidéo</span>
                </Link>
              </div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-12 relative"
            >
              <div className="relative max-w-6xl mx-auto">
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl" />
                
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Caméra active</span>
                    </div>
                  </div>
                  
                  {/* Camera preview simulation */}
                  <div className="aspect-[21/8] bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scan className="w-24 h-24 text-blue-400/30" />
                    </div>
                    {/* Scan lines */}
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                      animate={{ y: [0, 400, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Technologie de pointe
            </h2>
            <p className="text-xl text-gray-400">
              Des performances exceptionnelles pour une gestion optimale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Card */}
                  <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Pourquoi MPresence AI ?
              </h2>
              <p className="text-xl text-gray-400">
                Une solution complète et performante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 shadow-2xl shadow-blue-500/30"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Prêt à moderniser votre gestion de présence ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Commencez dès maintenant et découvrez la puissance de l'IA
            </p>
            <Link
              to="/live"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
            >
              <Scan className="w-5 h-5" />
              <span>Lancer la reconnaissance faciale</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}