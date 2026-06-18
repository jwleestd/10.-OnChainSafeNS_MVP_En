import { errorResponse, successResponse, withErrorHandler } from '@/lib/api-response';
import { resetE2eMemoryData } from '@/lib/e2e-memory-prisma';

export const dynamic = 'force-dynamic';

async function resetHandler() {
  if (process.env.E2E_MEMORY_DB !== '1') {
    return errorResponse('NOT_FOUND', 'Not found', 404);
  }

  resetE2eMemoryData();
  return successResponse({ reset: true });
}

export const POST = withErrorHandler(resetHandler);
