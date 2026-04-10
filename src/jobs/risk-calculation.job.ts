import { RiskAssessmentService } from '@/services/risk-assessment.service';
import { logger } from '@/config/logger';

/**
 * Batch Risk Calculation Job
 *
 * Processes all active enrollments through the AI risk prediction engine.
 * Designed to be triggered via API endpoint (manual or external cron).
 *
 * Usage:
 *   POST /api/v1/risk-assessments/calculate-batch
 *   Or: import and call runBatchRiskCalculation() directly
 */
export async function runBatchRiskCalculation() {
  const startTime = Date.now();

  logger.info('[RiskJob] ═══════════════════════════════════════');
  logger.info('[RiskJob] Starting batch risk calculation...');
  logger.info('[RiskJob] ═══════════════════════════════════════');

  try {
    const result = await RiskAssessmentService.calculateBatchRiskScores();
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

    logger.info('[RiskJob] ═══════════════════════════════════════');
    logger.info(`[RiskJob] Batch completed in ${durationSec}s`);
    logger.info(`[RiskJob]   Processed: ${result.processed}`);
    logger.info(`[RiskJob]   High Risk: ${result.highRisk}`);
    logger.info(`[RiskJob]   Medium Risk: ${result.mediumRisk}`);
    logger.info(`[RiskJob]   Low Risk: ${result.lowRisk}`);
    logger.info(`[RiskJob]   Errors: ${result.errors}`);
    logger.info('[RiskJob] ═══════════════════════════════════════');

    return {
      success: true,
      durationSeconds: Number(durationSec),
      ...result,
    };
  } catch (error: any) {
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.error(`[RiskJob] Batch failed after ${durationSec}s: ${error.message}`);
    throw error;
  }
}
