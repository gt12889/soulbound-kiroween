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


    </div>
  );
};

export default LandingPage;
