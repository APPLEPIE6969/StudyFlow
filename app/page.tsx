
"use client"

import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-glow-purple rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-glow-blue rounded-full blur-3xl opacity-40"></div>
      </div>

      <Navbar />

      <main className="relative z-10 grow flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 px-4 md:pt-24 md:pb-32 lg:px-10">
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wide mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t("common.new_feature")}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 max-w-4xl">
              {t("landing.hero_title")} <br className="hidden md:block" />
              <span className="text-gradient hover:animate-pulse transition-all cursor-default">{t("landing.hero_subtitle")}</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
              {t("landing.hero_desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/dashboard" className="flex h-12 md:h-14 px-8 items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-white text-base md:text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 hover:shadow-primary/40">
                <span className="mr-2">{t("landing.get_started")}</span>
                <span className="material-symbols-outlined">rocket_launch</span>
              </Link>
              <Link href="/demo" className="flex h-12 md:h-14 px-8 items-center justify-center rounded-xl bg-white dark:bg-surface-dark-lighter border border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-900 dark:text-white text-base md:text-lg font-bold transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-white/5">
                <span className="mr-2">{t("landing.view_demo")}</span>
                <span className="material-symbols-outlined">play_circle</span>
              </Link>
            </div>

            {/* Hero Visual / Dashboard Preview */}
            <div className="mt-16 w-full max-w-5xl relative group perspective-1000">
              <div className="absolute -inset-1 bg-linear-to-r from-primary via-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:rotate-x-2">
                {/* Placeholder for dashboard UI with overlay */}
                <div className="aspect-video w-full bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-6xl opacity-20">dashboard</span>
                  </div>
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-background-dark via-transparent to-transparent opacity-80"></div>

                  {/* Floating Assistant Message */}
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-left pointer-events-none">
                    <div className="glass-panel inline-block p-4 rounded-xl max-w-md animate-float">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="size-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                          <span className="material-symbols-outlined text-[14px] text-white">smart_toy</span>
                        </div>
                        <span className="text-xs font-bold text-slate-300">StudyFlow AI</span>
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {t("landing.ai_assistant_message")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-16 text-center">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6">{t("landing.trusted_by")}</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-xl font-bold font-display text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-default">MIT</span>
                <span className="text-xl font-bold font-display text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-default">Stanford</span>
                <span className="text-xl font-bold font-display text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-default">Harvard</span>
                <span className="text-xl font-bold font-display text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-default">Berkeley</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 md:px-10 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 md:text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">{t("landing.features_title")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">{t("landing.features_desc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 hover:bg-slate-800/50 transition-colors group border-t-4 border-t-primary hover:-translate-y-1 duration-300">
                <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                  <span className="material-symbols-outlined text-3xl">quiz</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">{t("landing.feature_1_title")}</h3>
                  <p className="text-slate-400 leading-relaxed">{t("landing.feature_1_desc")}</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative z-10 p-8 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-sm h-full hover:bg-white/10 transition-colors group overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">psychology_alt</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">{t("landing.feature_2_title")}</h3>
                  <p className="text-slate-400 leading-relaxed">{t("landing.feature_2_desc")}</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 hover:bg-slate-800/50 transition-colors group border-t-4 border-t-purple-500 hover:-translate-y-1 duration-300">
                <div className="size-14 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/10">
                  <span className="material-symbols-outlined text-3xl">trending_up</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">{t("landing.feature_3_title")}</h3>
                  <p className="text-slate-400 leading-relaxed">{t("landing.feature_3_desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Large Visual Breaker */}
        <section className="w-full py-10 px-4">
          <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative h-[400px] md:h-[500px] flex items-center justify-center group">
            {/* Abstract Background instead of Image */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-900 via-slate-900 to-black"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

            <div className="relative z-10 max-w-2xl text-center md:text-left md:mr-auto md:ml-20 px-6">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">{t("landing.community_title")}</h2>
              <p className="text-lg text-slate-300 mb-8 drop-shadow-md">{t("landing.community_desc")}</p>
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-xl">
                {t("landing.community_button")}
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-10 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10 glass-panel border border-slate-700 p-10 md:p-16 rounded-3xl shadow-2xl">
            <span className="material-symbols-outlined text-6xl text-primary mb-6 animate-bounce-slow">verified</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">{t("landing.cta_title")}</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">{t("landing.cta_desc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="flex h-12 px-8 items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-bold transition-all hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1">
                {t("landing.get_started")}
              </Link>
              <button className="flex h-12 px-8 items-center justify-center rounded-xl bg-transparent border border-slate-600 hover:border-white text-white text-base font-bold transition-all hover:-translate-y-1">
                {t("landing.view_pricing")}
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">{t("landing.trial_text")}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#131118] border-t border-surface-dark-lighter py-12 px-4 md:px-10 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <span className="font-bold text-white text-lg">StudyFlow</span>
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
            <Link className="hover:text-primary transition-colors" href="/privacy">{t("common.privacy")}</Link>
            <Link className="hover:text-primary transition-colors" href="/terms">{t("common.terms")}</Link>
            <Link className="hover:text-primary transition-colors" href="mailto:support@studyflow.app">{t("common.support")}</Link>
          </div>
          <div>
            © 2024 StudyFlow Inc.
          </div>
        </div>
      </footer>
    </div>
  )
}
