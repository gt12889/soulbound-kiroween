import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../hooks/useAudio';
import styles from './LandingPage.module.css';

/**
 * Landing page with hero section and project details
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { playUIClick } = useAudio();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<'enhance' | 'organize'>('enhance');
  const animationRef = useRef<HTMLDivElement>(null);

  // Scroll-based animation progress
  useEffect(() => {
    const handleScroll = () => {
      if (animationRef.current) {
        const rect = animationRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = animationRef.current.offsetHeight;
        
        // Calculate progress (0 to 1) as element scrolls through viewport
        const progress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + elementHeight)
        ));
        
        setScrollProgress(progress);
      }
      
      // Parallax effect
      const offset = window.scrollY * 0.5;
      setParallaxOffset(offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    playUIClick();
    navigate('/login');
  };

  return (
    <div className={styles.landingPage}>
      {/* Hero Section with Video Background */}
      <section className={styles.hero}>
        {/* Video Background */}
        <div className={styles.videoContainer}>
          <video
            className={styles.heroVideo}
            autoPlay
            loop
            muted
            playsInline
            poster="/trees.png"
          >
            <source src="/landing.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Video Overlay for better text readability */}
          <div className={styles.videoOverlay}></div>
        </div>

        {/* Hero Content - Overlays the video */}
        <div 
          className={styles.heroContent}
          style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
        >
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
        
        {/* Floating elements with parallax */}
        <div className={styles.floatingElements}>
          <div 
            className={`${styles.floatingIcon} ${styles.float1}`}
            style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
          >🍂</div>
          <div 
            className={`${styles.floatingIcon} ${styles.float2}`}
            style={{ transform: `translateY(${parallaxOffset * 0.4}px)` }}
          >🌙</div>
          <div 
            className={`${styles.floatingIcon} ${styles.float3}`}
            style={{ transform: `translateY(${parallaxOffset * 0.15}px)` }}
          >🦉</div>
          <div 
            className={`${styles.floatingIcon} ${styles.float4}`}
            style={{ transform: `translateY(${parallaxOffset * 0.35}px)` }}
          >🌿</div>
        </div>
      </section>

      {/* Expanded Content Section - Ancient Powers */}
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

          {/* Feature Cards Grid with Animated Slides */}
          <div className={styles.cardsGrid}>
            <AnimatedSlide delay={0}>
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
            </AnimatedSlide>

            <AnimatedSlide delay={200}>
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
            </AnimatedSlide>

            <AnimatedSlide delay={400}>
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
            </AnimatedSlide>
          </div>

          {/* Additional Info Section */}
          <div className={styles.infoSection}>
            <AnimatedSlide delay={0}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>🌙</div>
                <h4 className={styles.infoTitle}>Dark Mode First</h4>
                <p className={styles.infoText}>
                  Built for those who work in the shadows, with careful attention to 
                  eye comfort and mystical aesthetics.
                </p>
              </div>
            </AnimatedSlide>
            <AnimatedSlide delay={200}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>⚡</div>
                <h4 className={styles.infoTitle}>Lightning Fast</h4>
                <p className={styles.infoText}>
                  Optimized performance ensures your journey through the forest 
                  remains smooth and uninterrupted.
                </p>
              </div>
            </AnimatedSlide>
            <AnimatedSlide delay={400}>
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>🔮</div>
                <h4 className={styles.infoTitle}>AI Enhanced</h4>
                <p className={styles.infoText}>
                  Ancient intelligence powers assist your every move, learning 
                  from your patterns to better serve your needs.
                </p>
              </div>
            </AnimatedSlide>
          </div>
        </div>
      </section>

      {/* Strategy Section - Powers of the Forest */}
      <section className={styles.strategySection}>
        <div className={styles.strategyContent}>
          {/* Tab Navigation */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabsList}>
              <div 
                className={styles.tabBubble}
                style={{ 
                  width: '50%',
                  left: activeTab === 'enhance' ? '3px' : 'calc(50% + 3px)'
                }}
              />
              <button
                className={`${styles.tabTrigger} ${activeTab === 'enhance' ? styles.tabActive : ''}`}
                onClick={() => {
                  playUIClick();
                  setActiveTab('enhance');
                }}
                aria-label="View Enhancement features"
              >
                Enhance
              </button>
              <button
                className={`${styles.tabTrigger} ${activeTab === 'organize' ? styles.tabActive : ''}`}
                onClick={() => {
                  playUIClick();
                  setActiveTab('organize');
                }}
                aria-label="View Organization features"
              >
                Organize
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'enhance' && (
                <AnimatedSlide delay={0}>
                  <div className={styles.strategyLists}>
                    <div className={styles.listsHeading}>
                      <h2 className={styles.strategyTitle}>Amplify Your Creative Powers</h2>
                    </div>
                    <ul className={styles.strategyItems}>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>1<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>AI Writing Assistant</h3>
                          <p className={styles.itemDescription}>
                            Let the Ghost Writer guide your words with intelligent suggestions that flow naturally from your thoughts.
                          </p>
                        </div>
                      </li>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>2<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Mystical Note-Taking</h3>
                          <p className={styles.itemDescription}>
                            Chronicle your thoughts in the Necronomicon with advanced markdown, tagging, and block-based editing.
                          </p>
                        </div>
                      </li>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>3<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Mystic Oracle Readings</h3>
                          <p className={styles.itemDescription}>
                            Receive divine insights and connect with historical minds through the Ghost Archive for wisdom.
                          </p>
                        </div>
                      </li>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>4<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Spirit Companion</h3>
                          <p className={styles.itemDescription}>
                            Evolve your personal companion who celebrates victories and encourages you through challenges.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </AnimatedSlide>
              )}

              {activeTab === 'organize' && (
                <AnimatedSlide delay={0}>
                  <div className={styles.strategyLists}>
                    <div className={styles.listsHeading}>
                      <h2 className={styles.strategyTitle}>Master Your Dark Domain</h2>
                    </div>
                    <ul className={styles.strategyItems}>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>1<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Task Graveyard</h3>
                          <p className={styles.itemDescription}>
                            Tend to your tasks with priority levels, tags, and Pomodoro timers in the sacred graveyard.
                          </p>
                        </div>
                      </li>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>2<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Cursed Calendar</h3>
                          <p className={styles.itemDescription}>
                            Track events, deadlines, and schedules with mystical calendar views and scheduling powers.
                          </p>
                        </div>
                      </li>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>3<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Eternal Flames & Deeds</h3>
                          <p className={styles.itemDescription}>
                            Monitor your streaks, track achievements, and integrate GitHub activity to visualize your journey.
                          </p>
                        </div>
                      </li>
                      <li className={styles.strategyItem}>
                        <span className={styles.itemNumber}>
                          <span className={styles.numberDeco}>(</span>4<span className={styles.numberDeco}>)</span>
                        </span>
                        <div className={styles.itemContent}>
                          <h3 className={styles.itemTitle}>Global Search Portal</h3>
                          <p className={styles.itemDescription}>
                            Instantly find any note, task, or calendar event across the entire realm with powerful search.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </AnimatedSlide>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Section - Join the Forest */}
      <section className={styles.editorialSection}>
        <div className={styles.editorialImage}>
          <div className={styles.videoWrapper}>
            <video
              className={styles.editorialVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src="/flower.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className={styles.editorialText}>
          <div className={styles.editorialContent}>
            <AnimatedSlide delay={0}>
              <h2 className={styles.editorialSubheading}>Dark Forest Ecosystem</h2>
            </AnimatedSlide>
            <AnimatedSlide delay={200}>
              <h3 className={styles.editorialHeading}>
                Join the creators, thinkers, and dreamers who thrive in the shadows.
              </h3>
            </AnimatedSlide>
            <AnimatedSlide delay={400}>
              <button 
                className={`${styles.shimmerButton} button-primary`}
                onClick={handleGetStarted}
              >
                <span className={styles.shimmer}></span>
                <span className={styles.buttonInner}>Begin Your Journey</span>
              </button>
            </AnimatedSlide>
          </div>
        </div>
      </section>

      {/* Scroll-Controlled Animation Section */}
      <section ref={animationRef} className={styles.animationSection}>
        <div className={styles.animationWrapper}>
          <div 
            className={styles.animationCircle}
            style={{
              transform: `scale(${0.5 + scrollProgress * 0.5}) rotate(${scrollProgress * 360}deg)`,
              opacity: 0.3 + scrollProgress * 0.7
            }}
          >
            <div className={styles.innerCircle}>
              <span className={styles.circleIcon}>🌙</span>
            </div>
          </div>
          <div className={styles.animationText}>
            <h2 
              className={styles.animationTitle}
              style={{ 
                opacity: scrollProgress,
                transform: `translateY(${(1 - scrollProgress) * 50}px)`
              }}
            >
              Journey Through The Shadows
            </h2>
            <p 
              className={styles.animationDescription}
              style={{ 
                opacity: Math.max(0, scrollProgress - 0.2),
                transform: `translateY(${(1 - scrollProgress) * 30}px)`
              }}
            >
              As you scroll deeper into the forest, ancient powers awaken. 
              The path reveals itself to those who dare venture forward.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            {/* Brand Column */}
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogo}>🌲 The Dark Forest</h3>
              <p className={styles.footerTagline}>
                Where productivity meets mystery
              </p>
              <div className={styles.footerSocial}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
                  🐙
                </a>
                <a href="#" className={styles.socialLink} aria-label="Discord">
                  💬
                </a>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  🐦
                </a>
              </div>
            </div>

            {/* Features Column */}
            <div className={styles.footerColumn}>
              <h4 className={styles.footerHeading}>Features</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/necronomicon-notes'); }}>Necronomicon Notes</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/ghost-writer'); }}>Ghost Writer</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/graveyard-dashboard'); }}>Task Graveyard</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/cursed-calendar'); }}>Cursed Calendar</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className={styles.footerColumn}>
              <h4 className={styles.footerHeading}>Resources</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/terminal-tarot'); }}>Mystic Oracle</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/achievements'); }}>Achievements</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Documentation</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Keyboard Shortcuts</a></li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className={styles.footerColumn}>
              <h4 className={styles.footerHeading}>Get Started</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign In</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Create Account</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>About</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              © {new Date().getFullYear()} The Dark Forest. All rights reserved.
            </p>
            <p className={styles.footerCredit}>
              Crafted with 🌙 in the shadows
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

/**
 * Animated Slide Component - Fades in when scrolled into view
 */
interface AnimatedSlideProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedSlide: React.FC<AnimatedSlideProps> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`${styles.animatedSlide} ${isVisible ? styles.slideVisible : ''}`}
    >
      {children}
    </div>
  );
};

export default LandingPage;
