import React from 'react';
import './App.css';
import { CryptoWatch } from './components/CryptoWatch';

type Project = {
  description: string;
  eyebrow: string;
  href?: string;
  name: string;
  external?: boolean;
};

const projects: Project[] = [
  {
    name: 'Samuel John Band',
    eyebrow: 'Music',
    description: 'Songs, shows, and the latest from Samuel John Band.',
    href: 'https://www.samueljohnband.com',
    external: true,
  },
  {
    name: 'JohnsPocket',
    eyebrow: 'Personal finance',
    description: 'A thoughtful new way to understand and organize everyday finances.',
    href: 'https://d27kbz92cmt76g.cloudfront.net/',
    external: true,
  },
  {
    name: 'Stage Plot Alpha',
    eyebrow: 'Tools for musicians',
    description: 'A practical and free stage-plot builder designed to make show-day communication easier.',
    href: 'https://centering-rex-464821-q4.web.app/',
    external: true,
  },
  {
    name: 'Crypto Watch',
    eyebrow: 'Live experiment',
    description: 'A real-time view of crypto prices powered by public market data.',
    href: '#/crypto',
  },
];

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const GitHubIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.3-2.3-.3-4.6-1.1-4.6-5A3.9 3.9 0 0 1 7 8.3c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1.1a9.7 9.7 0 0 1 5.2 0c1.9-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.8c0 3.8-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.5c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z" />
  </svg>
);

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const content = (
    <>
      <div className="project-card__topline">
        <span className="project-card__number">0{index + 1}</span>
        <span className="project-card__eyebrow">{project.eyebrow}</span>
      </div>
      <div className="project-card__body">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
      </div>
      <div className="project-card__action">
        {project.href ? (
          <>
            <span>{project.external ? 'Visit project' : 'Open project'}</span>
            <ArrowIcon />
          </>
        ) : (
          <span className="project-card__soon">Coming Soon</span>
        )}
      </div>
    </>
  );

  if (!project.href) {
    return <article className="project-card project-card--soon">{content}</article>;
  }

  return (
    <a
      className="project-card"
      href={project.href}
      {...(project.external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {content}
    </a>
  );
};

const HomePage = () => (
  <div className="site-shell">
    <header className="site-header">
      <a className="wordmark" href="#/" aria-label="Samuel John home">
        SJ<span>.</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#projects">Projects</a>
        <a href="https://github.com/samueljanderson756" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </nav>
    </header>

    <main>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__content">
          <p className="hero__eyebrow">Musician · Software Engineer</p>
          <h1 id="hero-heading">Samuel John</h1>
          <p className="hero__bio">
            I’m a musician and software engineer creating applications for the stage and for the web.
          </p>
          <a className="button button--primary" href="#projects">
            Explore my work
            <ArrowIcon />
          </a>
        </div>
        <div className="hero__portrait">
          <img
            alt="Samuel John performing live with an acoustic guitar"
            decoding="async"
            fetchPriority="high"
            src="/samuel-john-live.jpeg"
          />
        </div>
      </section>

      <section className="projects-section" id="projects" aria-labelledby="projects-heading">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Selected work</p>
            <h2 id="projects-heading">Things I’m building</h2>
          </div>
          <p>Music, useful tools, and experiments..</p>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard project={project} index={index} key={project.name} />
          ))}
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div>
        <span className="footer-mark">SJ.</span>
        <p>Making okayish things, one idea at a time.</p>
      </div>
      <a className="github-link" href="https://github.com/samueljanderson756" target="_blank" rel="noreferrer">
        <GitHubIcon />
        GitHub
      </a>
    </footer>
  </div>
);

const useHashRoute = () => {
  const [route, setRoute] = React.useState(window.location.hash);

  React.useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
};

export const App = () => {
  const route = useHashRoute();
  return route === '#/crypto' ? <CryptoWatch /> : <HomePage />;
};
