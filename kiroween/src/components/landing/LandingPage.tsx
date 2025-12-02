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
          <button className={`${styles.ctaButton} button-primary`} onClick={handleGetStarted}>
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

      {/* Expanded Content Section - Inspired by modern design system */}
      <section className={styles.expandedContent}>
        <div className={styles.contentWrapper}>
          {/* Header */}
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>
              <span className={styles.titleAccent}>Ancient Powers</span>
              <span className={styles.titleMain}>Await Your Command</span>
            </h2>
            <p className={styles.contentSubtitle}>
              Three mystical paths converge in the darkness, each offering unique capabilities 
              to enhance your journey through the realm of productivity.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className={styles.cardsGrid}>
            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>📜</div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Necronomicon Notes</h3>
                <p className={styles.cardDescription}>
                  Chronicle your thoughts in an ancient tome that remembers all. 
                  Organize knowledge with mystical powers of search and organization.
                </p>
                <div className={styles.cardBadge}>Knowledge</div>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>👻</div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Ghost Writer</h3>
                <p className={styles.cardDescription}>
                  Let spectral whispers guide your words. AI-powered writing assistance 
                  that flows like ethereal mist through your thoughts.
                </p>
                <div className={styles.cardBadge}>Creation</div>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.cardIcon}>🪦</div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Graveyard Dashboard</h3>
                <p className={styles.cardDescription}>
                  Tend to your tasks in the sacred grounds where productivity rests. 
                  Track progress and honor completed work.
                </p>
                <div className={styles.cardBadge}>Productivity</div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🌙</div>
              <h4 className={styles.infoTitle}>Dark Mode First</h4>
              <p className={styles.infoText}>
                Built for those who work in the shadows, with careful attention to 
                eye comfort and mystical aesthetics.
              </p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⚡</div>
              <h4 className={styles.infoTitle}>Lightning Fast</h4>
              <p className={styles.infoText}>
                Optimized performance ensures your journey through the forest 
                remains smooth and uninterrupted.
              </p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🔮</div>
              <h4 className={styles.infoTitle}>AI Enhanced</h4>
              <p className={styles.infoText}>
                Ancient intelligence powers assist your every move, learning 
                from your patterns to better serve your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
