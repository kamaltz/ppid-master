export const prisma = {
  admin: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  pemohon: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  ppid: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
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
    create: jest.fn(),
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
    create: jest.fn(),
    findMany: jest.fn()
  },
  chatSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  kategoriiInformasi: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  page: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Reset all mocks before each test
beforeEach(() => {
  Object.values(prisma).forEach(model => {
    Object.values(model).forEach(method => {
      if (typeof method === 'function' && method.mockReset) {
        method.mockReset();
      }
    });
  });
});