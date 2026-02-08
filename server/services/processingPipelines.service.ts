import { db } from '../db/index';
import { processingPipelines } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function listProcessingPipelines() {
  const pipelineList = await db.query.processingPipelines.findMany({
    where: isNull(processingPipelines.deletedAt),
  });

  return pipelineList;
}

export async function getProcessingPipelineById(pipelineId: string) {
  const pipeline = await db.query.processingPipelines.findFirst({
    where: and(eq(processingPipelines.id, pipelineId), isNull(processingPipelines.deletedAt)),
  });

  if (!pipeline) {
    throw new NotFoundError('Processing pipeline not found');
  }

  return pipeline;
}
