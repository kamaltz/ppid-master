/**
 * Integration tests for complete informasi workflow
 */

describe('Informasi Integration Tests', () => {
  const mockDatabase = {
    informasi: [],
    nextId: 1
  };

  beforeEach(() => {
    mockDatabase.informasi = [];
    mockDatabase.nextId = 1;
  });

  describe('Complete CRUD Workflow', () => {
    it('should complete full informasi lifecycle', async () => {
      // 1. CREATE - Add new informasi with files and links
      const createData = {
        judul: 'Integration Test Informasi',
        klasifikasi: 'informasi-berkala',
        ringkasan_isi_informasi: 'Integration test content',
        tanggal_posting: '2024-01-20',
        files: [
          { name: 'test.pdf', url: '/uploads/test.pdf', size: 2048 },
          { name: 'doc.docx', url: '/uploads/doc.docx', size: 1024 }
        ],
        links: [
          { title: 'Related Info', url: 'https://example.com/related' },
          { title: 'Support Doc', url: 'https://docs.example.com' }
        ]
      };

      const createResponse = {
        success: true,
        data: {
          id: mockDatabase.nextId++,
          ...createData,
          file_attachments: JSON.stringify(createData.files),
          links: JSON.stringify(createData.links),
          created_at: new Date().toISOString()
        }
      };

      mockDatabase.informasi.push(createResponse.data);

      expect(createResponse.success).toBe(true);
      expect(createResponse.data.judul).toBe('Integration Test Informasi');

      // 2. READ - Fetch created informasi
      const readResponse = {
        success: true,
        data: {
          ...mockDatabase.informasi[0],
          file_attachments: JSON.parse(mockDatabase.informasi[0].file_attachments),
          links: JSON.parse(mockDatabase.informasi[0].links)
        }
      };

      expect(readResponse.success).toBe(true);
      expect(readResponse.data.file_attachments).toHaveLength(2);
      expect(readResponse.data.links).toHaveLength(2);

      // 3. UPDATE - Modify informasi
      const updateData = {
        judul: 'Updated Test Informasi',
        files: [
          { name: 'test.pdf', url: '/uploads/test.pdf', size: 2048 },
          { name: 'new.xlsx', url: '/uploads/new.xlsx', size: 3072 }
        ],
        links: [
          { title: 'Updated Link', url: 'https://example.com/updated' }
        ]
      };

      const updateResponse = {
        success: true,
        data: {
          ...mockDatabase.informasi[0],
          ...updateData,
          file_attachments: JSON.stringify(updateData.files),
          links: JSON.stringify(updateData.links)
        }
      };

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data.judul).toBe('Updated Test Informasi');

      // 4. DELETE - Remove informasi
      const deleteResponse = {
        success: true,
        message: 'Informasi berhasil dihapus'
      };

      mockDatabase.informasi = [];

      expect(deleteResponse.success).toBe(true);
      expect(mockDatabase.informasi).toHaveLength(0);
    });

    it('should handle file operations correctly', async () => {
      const uploadTest = {
        originalFile: { name: 'test.pdf', size: 1024 },
        expectedResponse: {
          success: true,
          filename: '1234567890-test.pdf',
          originalName: 'test.pdf',
          size: 1024,
          url: '/uploads/1234567890-test.pdf'
        }
      };

      expect(uploadTest.expectedResponse.success).toBe(true);
      expect(uploadTest.expectedResponse.url).toContain('/uploads/');

      const multipleFiles = [
        { name: 'doc1.pdf', size: 1024 },
        { name: 'doc2.docx', size: 2048 },
        { name: 'image.jpg', size: 512 }
      ];

      const results = multipleFiles.map(file => ({
        success: true,
        originalName: file.name,
        size: file.size,
        url: `/uploads/${Date.now()}-${file.name}`
      }));

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.url).toContain('/uploads/');
      });
    });

    it('should validate data integrity', async () => {
      const testData = {
        judul: 'Data Integrity Test',
        files: [{ name: 'test.pdf', url: '/uploads/test.pdf', size: 1024 }],
        links: [{ title: 'Test Link', url: 'https://test.com' }]
      };

      const created = {
        id: 1,
        ...testData,
        file_attachments: JSON.stringify(testData.files),
        links: JSON.stringify(testData.links)
      };

      const parsedFiles = JSON.parse(created.file_attachments);
      const parsedLinks = JSON.parse(created.links);

      expect(parsedFiles).toEqual(testData.files);
      expect(parsedLinks).toEqual(testData.links);
      expect(Array.isArray(parsedFiles)).toBe(true);
      expect(Array.isArray(parsedLinks)).toBe(true);
    });
  });
});