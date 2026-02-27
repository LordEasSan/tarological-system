import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Settings, Layers, ShieldCheck, ArrowRight, Brain, Orbit } from 'lucide-react';

const features = [
  {
    icon: Settings,
    title: 'Configure Parameters',
    description: 'Define your parameter space θ ∈ Θ: archetype family, deck size, spread layout, meaning weights.',
    to: '/configure',
    color: 'from-mtps-accent to-mtps-accent-alt',
  },
  {
    icon: Layers,
    title: 'Generate Readings',
    description: 'Create parameterised tarot decks and visualise interactive spread layouts with card-flip animations.',
    to: '/generate',
    color: 'from-mtps-accent to-mtps-accent-alt',
  },
  {
    icon: ShieldCheck,
    title: 'Formal Verification',
    description: 'Run LTL model checking — safety, cosafety, liveness, coliveness — on every generated reading.',
    to: '/verify',
    color: 'from-mtps-teal to-emerald-600',
  },
  {
    icon: Brain,
    title: 'Philosophical Mode',
    description: 'Ask ontological questions — trajectory-space restructuring, attractor basins, and structural clarification.',
    to: '/philosophical',
    color: 'from-mtps-violet to-indigo-600',
  },
  {
    icon: Orbit,
    title: 'Cosmological Mode',
    description: 'Ask universal questions — archetypal configuration mapping, symbolic models, and emergence order.',
    to: '/cosmological',
    color: 'from-orange-500 to-amber-500',
  },
];

export function WelcomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full dark:bg-mtps-violet/10 bg-mtps-accent-alt/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full dark:bg-mtps-gold/5 bg-mtps-gold/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              id="tour-welcome-hero"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-mtps-gold mx-auto" />
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="gradient-text">Meta-Tarological</span>
              <br />
              <span className="dark:text-mtps-text text-mtps-text-light">
                Positivist System
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg dark:text-mtps-muted text-mtps-muted leading-relaxed mb-8">
              A formal framework for parameterised tarot-deck generation, narrative synthesis,
              and temporal-logic verification — where ancient symbolism meets mathematical rigour.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                id="tour-welcome-begin"
                to="/configure"
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
                  bg-gradient-to-r from-mtps-accent to-mtps-accent-alt text-white
                  hover:from-mtps-accent-alt hover:to-mtps-accent
                  shadow-lg shadow-mtps-accent/15 hover:shadow-mtps-accent/25
                  transition-all duration-300"
              >
                Begin Configuration
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/generate"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
                  dark:bg-mtps-card dark:text-mtps-silver dark:hover:bg-mtps-purple/40
                  bg-white text-mtps-text-light hover:bg-mtps-border-light
                  border dark:border-mtps-border border-mtps-border-light
                  transition-all duration-300"
              >
                Quick Generate
              </Link>

              <Link
                to="/philosophical"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
                  dark:bg-mtps-violet/20 dark:text-mtps-silver dark:hover:bg-mtps-violet/40
                  bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                  border dark:border-mtps-violet/30 border-indigo-200
                  transition-all duration-300"
              >
                <Brain className="w-4 h-4" />
                Philosophical Mode
              </Link>

              <Link
                to="/cosmological"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
                  dark:bg-orange-500/20 dark:text-mtps-silver dark:hover:bg-orange-500/40
                  bg-orange-50 text-orange-700 hover:bg-orange-100
                  border dark:border-orange-400/30 border-orange-200
                  transition-all duration-300"
              >
                <Orbit className="w-4 h-4" />
                Cosmological Mode
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section className="pb-20">
          <div id="tour-welcome-features" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              >
                <Link
                  to={feat.to}
                  className="group block p-6 rounded-2xl border transition-all duration-300
                    dark:border-mtps-border dark:bg-mtps-card/50 dark:hover:border-mtps-violet/40 dark:hover:bg-mtps-card
                    border-mtps-border-light bg-white hover:border-mtps-accent-alt/30 hover:bg-mtps-surface-light
                    hover:shadow-lg"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feat.color} mb-4
                    shadow-lg group-hover:scale-110 transition-transform`}>
                    <feat.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-display text-lg font-bold dark:text-mtps-text text-mtps-text-light mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm dark:text-mtps-muted text-mtps-muted leading-relaxed">
                    {feat.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-medium
                    dark:text-mtps-gold text-mtps-violet
                    group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mathematical Overview */}
        <section className="pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-8 rounded-2xl border dark:border-mtps-border dark:bg-mtps-card/30
              border-mtps-border-light bg-white/80"
          >
            <h2 className="font-display text-xl font-bold dark:text-mtps-gold text-mtps-purple mb-4">
              Formal Foundation
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm dark:text-mtps-muted text-mtps-muted">
              <div>
                <p className="mb-3 leading-relaxed">
                  The MTPS defines a tarot deck as a parameterised structure:
                </p>
                <code className="block p-3 rounded-lg dark:bg-mtps-deep dark:text-mtps-accent-alt
                  bg-mtps-surface-light text-mtps-violet text-xs font-mono">
                  D(θ) = ⟨ C, Σ, μ, ρ, A ⟩  where θ ∈ Θ
                </code>
                <p className="mt-3 text-xs">
                  C = cards, Σ = suits, μ = meaning function, ρ = spread, A = archetypes
                </p>
              </div>
              <div>
                <p className="mb-3 leading-relaxed">
                  Every reading undergoes LTL verification across four property classes:
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span><strong>Safety:</strong> G(φ) — invariants that must always hold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span><strong>Co-safety:</strong> F(φ) — properties that must eventually hold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span><strong>Liveness:</strong> GF(φ) — progress that recurs infinitely</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span><strong>Co-liveness:</strong> FG(φ) — eventual stability</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
