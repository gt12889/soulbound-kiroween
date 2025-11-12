import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio';
import styles from './LandingPage.module.css';

/**
 * Landing page with hero section and project details
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { playUIClick } = useAudio();

  const handleGetStarted = () => {
    playUIClick();
    navigate('/login');
  };

  const features = [
    {
      icon: '📖',
      title: 'Ancient Library',
      description: 'A forgotten library deep in the woods where AI spirits help you write',
      path: '/necronomicon-notes',
    },
    {
      icon: '⚰️',
      title: 'Forgotten Graveyard',
      description: 'Where abandoned tasks rest beneath the moonlight',
      path: '/graveyard-dashboard',
    },
    {
      icon: '🔮',
      title: 'Mystic Clearing',
      description: 'A sacred space where tarot reveals your code\'s destiny',
      path: '/terminal-tarot',
    },
  ];

  const handleFeatureClick = (path: string) => {
    playUIClick();
    navigate(path);
  };

  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.forestEntrance}>🌲🌲🌲</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>The Dark Forest</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A mystical realm where productivity dwells in shadow
          </p>
          <p className={styles.heroDescription}>
            Three paths lie before you, each leading to ancient powers. 
            Choose wisely, traveler, for the forest remembers all who enter.
          </p>
          <button className={styles.ctaButton} onClick={handleGetStarted}>
            <span className={styles.ctaIcon}>🌙</span>
            <span>Enter the Forest</span>
          </button>
        </div>
        
        {/* Floating elements - Forest atmosphere */}
        <div className={styles.floatingElements}>
          <div className={`${styles.floatingIcon} ${styles.float1}`}>🍂</div>
          <div className={`${styles.floatingIcon} ${styles.float2}`}>🌙</div>
          <div className={`${styles.floatingIcon} ${styles.float3}`}>🦉</div>
          <div className={`${styles.floatingIcon} ${styles.float4}`}>🌿</div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Three Paths Through the Woods</h2>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div
              key={feature.path}
              className={styles.featureCard}
              onClick={() => handleFeatureClick(feature.path)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <div className={styles.featureArrow}>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.aboutContent}>
          <h2 className={styles.sectionTitle}>About This Project</h2>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutCard}>
              <h3 className={styles.aboutCardTitle}>🎨 Gothic Aesthetic</h3>
              <p className={styles.aboutCardText}>
                Immerse yourself in a dark, mystical interface with ambient animations, 
                dripping ink effects, and ethereal soundscapes.
              </p>
            </div>
            <div className={styles.aboutCard}>
              <h3 className={styles.aboutCardTitle}>🤖 AI-Powered</h3>
              <p className={styles.aboutCardText}>
                Get intelligent writing suggestions that materialize like whispers from beyond, 
                helping you craft better content.
              </p>
            </div>
            <div className={styles.aboutCard}>
              <h3 className={styles.aboutCardTitle}>🌙 Moon Phase Tracking</h3>
              <p className={styles.aboutCardText}>
                Track your tasks alongside accurate astronomical moon phases, 
                adding a celestial dimension to your productivity.
              </p>
            </div>
            <div className={styles.aboutCard}>
              <h3 className={styles.aboutCardTitle}>💾 Local Storage</h3>
              <p className={styles.aboutCardText}>
                All your data stays private in your browser with full export capabilities. 
                No cloud, no tracking, just you and your work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className={styles.techStack}>
        <h2 className={styles.sectionTitle}>Built With Modern Tech</h2>
        <div className={styles.techGrid}>
          <div className={styles.techBadge}>React 19</div>
          <div className={styles.techBadge}>TypeScript</div>
          <div className={styles.techBadge}>Vite</div>
          <div className={styles.techBadge}>CSS Modules</div>
          <div className={styles.techBadge}>React Router</div>
          <div className={styles.techBadge}>isomorphic-git</div>
        </div>
        <p className={styles.techNote}>
          Developed with <span className={styles.highlight}>Kiro AI</span> for the Kiro AI Hackathon
        </p>
      </section>

      {/* Footer CTA */}
      <section className={styles.footerCta}>
        <h2 className={styles.footerTitle}>The forest awaits, traveler...</h2>
        <button className={styles.ctaButton} onClick={handleGetStarted}>
          <span className={styles.ctaIcon}>🌲</span>
          <span>Step Into the Woods</span>
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
