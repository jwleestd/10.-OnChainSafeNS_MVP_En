import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { validateAddress, isValidChain } from '@/lib/validators';
import { getUserSession } from '@/lib/auth';
import { FraudLookupResponse } from '@/types';
import { ERROR_MESSAGES } from '@/lib/constants';
import type { RiskLevel, SupportedChain } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/fraud/lookup
 * QRY-FRAUD-001~003: 사기 주소 조회
 */
async function fraudLookupHandler(req: NextRequest) {
  const session = await getUserSession();
  if (!session) {
    return errorResponse('UNAUTHORIZED', ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  const user = await prisma.user.findUnique({ where: { userId: session.userId } });
  if (!user || !user.emailVerified) {
    return errorResponse('FORBIDDEN', ERROR_MESSAGES.EMAIL_REQUIRED, 403);
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');

  if (!address || !chain) {
    return errorResponse('VALIDATION_ERROR', '주소와 체인은 필수 입력값입니다', 400);
  }

  if (!isValidChain(chain)) {
    return errorResponse('VALIDATION_ERROR', '지원하지 않는 체인입니다', 400);
  }

  const addressCheck = validateAddress(address, chain);
  if (!addressCheck.valid) {
    return errorResponse('VALIDATION_ERROR', addressCheck.error!, 400);
  }

  const fraudRecord = await prisma.fraudAddress.findFirst({
    where: {
      address: address,
      chain: chain,
    },
  });

  if (!fraudRecord) {
    // 미등록 주소 시 200 + 빈 결과 반환 (QRY-FRAUD-002)
    return successResponse<FraudLookupResponse>({
      found: false,
      address,
      chain,
    });
  }

  // QRY-FRAUD-003: source_type 폴백 처리
  const sourceTypeLabel = fraudRecord.sourceType || '출처 미확인';

  return successResponse<FraudLookupResponse>({
    found: true,
    address: fraudRecord.address,
    chain: fraudRecord.chain as SupportedChain,
    risk_level: fraudRecord.riskLevel as RiskLevel,
    report_count: fraudRecord.reportCount,
    source_type: sourceTypeLabel,
    status: fraudRecord.status,
    first_reported_at: fraudRecord.firstReportedAt.toISOString(),
  });
}

export const GET = withErrorHandler(fraudLookupHandler);
