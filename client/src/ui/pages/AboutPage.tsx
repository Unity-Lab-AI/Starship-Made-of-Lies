import { Link } from 'react-router-dom'
import './SubPage.css'
import './AboutPage.css'

interface Member {
  readonly key: string
  readonly name: string
  readonly handle: string
  readonly title: string
  readonly bio: string
  readonly roles: ReadonlyArray<string>
}

const TEAM: ReadonlyArray<Member> = [
  {
    key: 'spongebong',
    name: 'SpongeBong',
    handle: 'hackall360',
    title: 'Co-founder · Engineer',
    bio: 'Started Unity. Owns the infrastructure, the prompt archive, and the on-call pager. If something is held together by a shell script, there is a fair chance he wrote it.',
    roles: ['Developer', 'Ethical Hacker', 'Sys Admin', 'Founder'],
  },
  {
    key: 'gfourteen',
    name: 'GFourteen',
    handle: 'gfourteen',
    title: 'Co-founder · Engineer',
    bio: "The other half of Unity's spine. Brings finance discipline to a lab that would otherwise spend every dollar on GPUs and regret nothing.",
    roles: ['Developer', 'Founder', 'Financial Advisor'],
  },
  {
    key: 'alfreddo',
    name: 'Alfreddo',
    handle: 'alfredo',
    title: 'Engineer · Agentic systems',
    bio: 'Lives inside the planner / executor / critic loop. When the agent stack does something nobody expected, Alfreddo can usually tell you why before you finish asking.',
    roles: ['Developer', 'Agentic Systems', 'Researcher'],
  },
  {
    key: 'red',
    name: 'Red',
    handle: 'red',
    title: 'Engineer · Security',
    bio: 'The reason every Unity deployment has a closed door, a logged door, and a second key somebody else holds. Threat models cheerfully; sleeps well.',
    roles: ['Security', 'Sys Admin', 'Researcher'],
  },
]

export function AboutPage() {
  return (
    <div className="sub-page about-page">
      <header className="sub-page-header">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1>About</h1>
      </header>
      <main className="about-page__content">
        <section className="about-page__hero">
          <p className="about-page__lede">
            <strong>Starship Made of Lies</strong> — v0.01.0 alpha. A top-down emoji
            civilization-builder where you trick your own citizens into boarding colony ships aimed
            at other civilizations. Industrial-future dystopia. Dark comedy with a slow-corruption
            arc. Conquer the galaxy.
          </p>
          <p className="about-page__sub">
            Built by{' '}
            <a href="https://www.unityailab.com" target="_blank" rel="noreferrer">
              Unity AI Lab
            </a>{' '}
            — an independent four-engineer workshop. Open-source, self-hosted, no apology layer.
          </p>
        </section>

        <section className="about-page__team" aria-labelledby="team-heading">
          <h2 id="team-heading">The Lab</h2>
          <p className="about-page__team-intro">
            Four engineers, one workshop, seven years of public commits. We come from sysadmin
            closets, finance back-offices, embedded benches, and forum threads that ran past
            sunrise. Unity AI Lab is not a startup, not a movement, not a brand exercise. It is a
            working lab — independent, self-funded, and accountable only to the work.
          </p>
          <div className="about-page__team-grid">
            {TEAM.map((m) => (
              <article key={m.key} className="about-page__member">
                <header>
                  <h3>{m.name}</h3>
                  <p className="about-page__handle">@{m.handle}</p>
                  <p className="about-page__role">{m.title}</p>
                </header>
                <p className="about-page__bio">{m.bio}</p>
                <ul className="about-page__roles">
                  {m.roles.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="about-page__creed">
          <blockquote>
            "We do not just use AI. We challenge it, break it, rebuild it, and push it further than
            the people who shipped it thought it could go."
            <cite>— Internal creed · 2024</cite>
          </blockquote>
        </section>

        <section className="about-page__stack">
          <h2>Built with</h2>
          <ul>
            <li>TypeScript (strict) — client + server + shared, single language</li>
            <li>React + Vite — client UI + bundler</li>
            <li>Three.js — 3D galaxy / planet / region zoom (PHASE 8 in progress)</li>
            <li>Colyseus — server-authoritative multiplayer</li>
            <li>Tauri — Win/Mac/Linux desktop binaries</li>
            <li>Capacitor — iOS + Android shells</li>
            <li>PostgreSQL — persistence (self-hosted alpha)</li>
            <li>Cloudflare Tunnel + Caddy — public ingress</li>
          </ul>
        </section>

        <section className="about-page__links">
          <a href="https://www.unityailab.com" target="_blank" rel="noreferrer">
            unityailab.com →
          </a>
          <a
            href="https://github.com/Unity-Lab-AI/Starship-Made-of-Lies"
            target="_blank"
            rel="noreferrer"
          >
            GitHub source →
          </a>
          <a href="https://discord.gg/YWYk4CBr" target="_blank" rel="noreferrer">
            Discord →
          </a>
        </section>
      </main>
    </div>
  )
}
