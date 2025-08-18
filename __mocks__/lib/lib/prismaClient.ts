export const prisma = {
  admin: {
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([{
      id: 1,
      nama: 'Admin Test',
      email: 'admin@test.com',
      created_at: new Date('2025-01-01')
    }]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  pemohon: {
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([{
      id: 1,
      nama: 'Pemohon Test',
      email: 'pemohon@test.com',
      nik: '123456789',
      created_at: new Date('2025-01-01')
    }]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  ppid: {
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([{
      id: 1,
      nama: 'PPID Test',
      email: 'ppid@test.com',
      role: 'PPID_UTAMA',
      created_at: new Date('2025-01-01')
    }]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  request: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn()
  },
  permintaan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn()
  },
  informasiPublik: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  keberatan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  kategori: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn()
  },
  activityLog: {
    create: jest.fn().mockResolvedValue({ id: 1 }),
    findMany: jest.fn(),
    count: jest.fn()
  },
  setting: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn()
  },
  tanggapan: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  requestResponse: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      message: 'Test message',
      user_name: 'Test User',
      created_at: new Date()
    }),
    findMany: jest.fn()
  },
  chatSession: {
    create: jest.fn(),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn()
  },
  kategoriiInformasi: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  page: {
    findMany: jest.fn().mockImplementation((args) => {
      if (args?.where?.status) {
        return Promise.resolve([{ id: 1, title: 'Published Page', status: args.where.status }]);
      }
      return Promise.resolve([{ id: 1, title: 'Test Page', status: 'published' }]);
    }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Reset all mocks before each test
beforeEach(() => {
  Object.values(prisma).forEach(model => {
    Object.values(model).forEach(method => {
      if (typeof method === 'function' && method.mockClear) {
        method.mockClear();
      }
    });
  });
});