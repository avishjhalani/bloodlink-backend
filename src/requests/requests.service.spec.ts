import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { PrismaServices } from '../../prisma/prisma.service';
import { NotificationService } from '../notifications/notifications.service';
import { getQueueToken } from '@nestjs/bull';

describe('RequestsService', () => {
  let service: RequestsService;
  let prismaMock: any;
  let queueMock: any;
  let notificationsServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      bloodRequest: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      donorNotification: {
        createMany: jest.fn(),
      },
    };

    queueMock = {
      add: jest.fn(),
    };

    notificationsServiceMock = {
      notifyAllDonors: jest.fn(),
      notifyDonor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: PrismaServices,
          useValue: prismaMock,
        },
        {
          provide: NotificationService,
          useValue: notificationsServiceMock,
        },
        {
          provide: getQueueToken('notifications'),
          useValue: queueMock,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findCompatible', () => {
    it('should return correct compatible recipient blood types for an O- donor', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        bloodType: 'O-',
      });

      prismaMock.bloodRequest.findMany.mockResolvedValue([
        { id: 101, bloodType: 'A+' },
        { id: 102, bloodType: 'O-' },
      ]);

      const result = await service.findCompatible(1);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(prismaMock.bloodRequest.findMany).toHaveBeenCalledWith({
        where: {
          status: 'active',
          NOT: { requesterId: 1 },
          bloodType: {
            in: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: { name: true, phone: true },
          },
          notifications: {
            where: { donorId: 1 },
          },
        },
      });

      expect(result).toHaveLength(2);
    });

    it('should return correct compatible recipient blood types for an A+ donor', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        bloodType: 'A+',
      });

      prismaMock.bloodRequest.findMany.mockResolvedValue([]);

      await service.findCompatible(2);

      expect(prismaMock.bloodRequest.findMany).toHaveBeenCalledWith({
        where: {
          status: 'active',
          NOT: { requesterId: 2 },
          bloodType: {
            in: ['A+', 'AB+'],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: { name: true, phone: true },
          },
          notifications: {
            where: { donorId: 2 },
          },
        },
      });
    });
  });
});
