import { PrismaService } from '../prisma/prisma.service';

export class BaseService {
  constructor(protected prisma: PrismaService) {}
}
