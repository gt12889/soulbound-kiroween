/**
 * Coverage Visualizer Component
 * Shows test coverage analysis with visual insights
 */

import React from 'react';
import type { CoverageAnalysis } from '../../../services/testGenerationService';
import styles from './CoverageVisualizer.module.css';

interface CoverageVisualizerProps {
  analysis: CoverageAnalysis;
}

export const CoverageVisualizer: React.FC<CoverageVisualizerProps> = ({ analysis }) => {
  const coverageDiff = analysis.projectedCoverage - analysis.currentCoverage;
  const isImproving = coverageDiff > 0;

  return (
    <div className={styles.coverageVisualizer}>
      <div className={styles.header}>
        <h3 className={styles.title}>🕷️ Coverage Analysis</h3>
      </div>

      <div className={styles.coverageComparison}>
        <div className={styles.coverageBar}>
          <div className={styles.barLabel}>Current Coverage</div>
          <div className={styles.barContainer}>
            <div
              className={styles.barFill}
              style={{
                width: `${analysis.currentCoverage}%`,
                backgroundColor: analysis.currentCoverage < 50 ? '#ff4444' : analysis.currentCoverage < 80 ? '#ffaa00' : '#00ff00',
              }}
            >
              <span className={styles.barValue}>{analysis.currentCoverage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className={styles.coverageBar}>
          <div className={styles.barLabel}>Projected Coverage</div>
          <div className={styles.barContainer}>
            <div
              className={styles.barFill}
              style={{
                width: `${analysis.projectedCoverage}%`,
                backgroundColor: analysis.projectedCoverage < 50 ? '#ff4444' : analysis.projectedCoverage < 80 ? '#ffaa00' : '#00ff00',
              }}
            >
              <span className={styles.barValue}>{analysis.projectedCoverage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className={styles.improvement}>
          <span className={styles.improvementLabel}>Improvement:</span>
          <span className={`${styles.improvementValue} ${isImproving ? styles.positive : styles.negative}`}>
            {isImproving ? '+' : ''}{coverageDiff.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className={styles.riskAssessment}>
        <div className={styles.riskHeader}>
          <span className={styles.riskLabel}>Overall Risk:</span>
          <span className={`${styles.riskBadge} ${styles[analysis.riskAssessment.overallRisk]}`}>
            {analysis.riskAssessment.overallRisk.toUpperCase()}
          </span>
        </div>

        {analysis.riskAssessment.highRiskAreas.length > 0 && (
          <div className={styles.highRiskAreas}>
            <div className={styles.sectionTitle}>High Risk Areas:</div>
            <ul className={styles.riskList}>
              {analysis.riskAssessment.highRiskAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.recommendations}>
          <div className={styles.sectionTitle}>Recommendations:</div>
          <ul className={styles.recommendationList}>
            {analysis.riskAssessment.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.gaps.length > 0 && (
        <div className={styles.gaps}>
          <div className={styles.sectionTitle}>Test Gaps ({analysis.gaps.length}):</div>
          <div className={styles.gapList}>
            {analysis.gaps.map((gap, index) => (
              <div key={index} className={`${styles.gapItem} ${styles[gap.riskLevel]}`}>
                <div className={styles.gapHeader}>
                  <span className={styles.gapType}>{gap.testType}</span>
                  <span className={`${styles.gapRisk} ${styles[gap.riskLevel]}`}>
                    {gap.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className={styles.gapScenario}>{gap.scenario}</div>
                <div className={styles.gapRecommendation}>{gap.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

