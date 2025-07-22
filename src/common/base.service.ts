import { PrismaService } from '../prisma/prisma.service';

export class BaseService {
  constructor(protected prisma: PrismaService) {}

  protected withCompanyFilter<T extends object>(
    where: T,
    companyId: string,
    isSuperAdmin = false,
  ): T {
    if (isSuperAdmin) return where;
    return { ...where, companyId } as T;
  }
}
