import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the hooks and context
const mockCreateInformasi = jest.fn();
const mockUpdateInformasi = jest.fn();
const mockDeleteInformasi = jest.fn();

jest.mock('../../src/hooks/useInformasiData', () => ({
  useInformasiData: () => ({
    informasi: [
      {
        id: 1,
        judul: 'Test Informasi',
        klasifikasi: 'informasi-berkala',
        ringkasan_isi_informasi: 'Test content',
        tanggal_posting: '2024-01-15',
        pejabat_penguasa_informasi: 'PPID Utama',
        file_attachments: JSON.stringify([{ name: 'test.pdf', url: '/uploads/test.pdf' }]),
        links: JSON.stringify([{ title: 'Test Link', url: 'https://example.com' }]),
        created_at: '2024-01-15T10:00:00Z'
      }
    ],
    isLoading: false,
    createInformasi: mockCreateInformasi,
    updateInformasi: mockUpdateInformasi,
    deleteInformasi: mockDeleteInformasi
  })
}));

jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    getUserRole: () => 'ADMIN',
    user: { email: 'admin@test.com' }
  })
}));

jest.mock('../../src/lib/roleUtils', () => ({
  ROLES: {
    ADMIN: 'ADMIN',
    PPID_UTAMA: 'PPID_UTAMA'
  },
  getRoleDisplayName: (role) => role === 'ADMIN' ? 'Admin' : 'PPID Utama'
}));

// Mock fetch
global.fetch = jest.fn((url) => {
  if (url === '/api/upload') {
    return Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        filename: 'test-file.pdf',
        originalName: 'test.pdf',
        size: 1024,
        url: '/uploads/test-file.pdf'
      })
    });
  }
  return Promise.resolve({
    json: () => Promise.resolve({
      success: true,
      data: [
        { id: 1, nama: 'Informasi Berkala', slug: 'informasi-berkala' }
      ]
    })
  });
});

import AdminInformasiPage from '../../src/app/admin/informasi/page';

describe('AdminInformasiPage - CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Informasi', () => {
    it('creates informasi with title and modified date', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      fireEvent.click(screen.getByText('Tambah Informasi'));
      
      await waitFor(() => {
        expect(screen.getByLabelText('Judul')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Judul'), 'New Test Informasi');
      
      const dateInput = screen.getByLabelText('Tanggal Posting');
      await user.clear(dateInput);
      await user.type(dateInput, '2024-02-01');

      await user.selectOptions(screen.getByLabelText('Kategori'), 'informasi-berkala');
      await user.type(screen.getByLabelText('Isi Informasi'), 'Test content');

      fireEvent.click(screen.getByText('Simpan'));

      await waitFor(() => {
        expect(mockCreateInformasi).toHaveBeenCalledWith(
          expect.objectContaining({
            judul: 'New Test Informasi',
            tanggal_posting: '2024-02-01'
          })
        );
      });
    });

    it('creates informasi with file attachment', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      fireEvent.click(screen.getByText('Tambah Informasi'));
      
      await waitFor(() => {
        expect(screen.getByText('Pilih File')).toBeInTheDocument();
      });

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByRole('button', { name: /pilih file/i })
        .parentElement.querySelector('input[type="file"]');
      
      await user.upload(fileInput, file);
      
      await user.type(screen.getByLabelText('Judul'), 'Test with File');
      await user.selectOptions(screen.getByLabelText('Kategori'), 'informasi-berkala');
      await user.type(screen.getByLabelText('Isi Informasi'), 'Content');

      fireEvent.click(screen.getByText('Simpan'));

      await waitFor(() => {
        expect(mockCreateInformasi).toHaveBeenCalledWith(
          expect.objectContaining({
            files: expect.arrayContaining([
              expect.objectContaining({
                name: 'test.pdf',
                url: '/uploads/test-file.pdf'
              })
            ])
          })
        );
      });
    });

    it('creates informasi with custom URL', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      fireEvent.click(screen.getByText('Tambah Informasi'));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Judul link (contoh: Dokumen Pendukung)')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('Judul'), 'Test with Link');
      await user.selectOptions(screen.getByLabelText('Kategori'), 'informasi-berkala');
      await user.type(screen.getByLabelText('Isi Informasi'), 'Content');
      
      await user.type(screen.getByPlaceholderText('Judul link (contoh: Dokumen Pendukung)'), 'Custom Link');
      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://custom.com');

      fireEvent.click(screen.getByText('Simpan'));

      await waitFor(() => {
        expect(mockCreateInformasi).toHaveBeenCalledWith(
          expect.objectContaining({
            links: [{ title: 'Custom Link', url: 'https://custom.com' }]
          })
        );
      });
    });
  });

  describe('Edit Informasi', () => {
    it('loads existing data for editing', async () => {
      render(<AdminInformasiPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Informasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Informasi')).toBeInTheDocument();
        expect(screen.getByText('File yang sudah ada:')).toBeInTheDocument();
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    });

    it('updates informasi with new data', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Informasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Informasi')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Test Informasi');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Informasi');

      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(mockUpdateInformasi).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            judul: 'Updated Informasi'
          })
        );
      });
    });

    it('removes existing file', async () => {
      render(<AdminInformasiPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Informasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));
      
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });

      const removeButton = screen.getByTitle('Hapus file');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('File yang sudah ada:')).not.toBeInTheDocument();
      });
    });

    it('adds new file to existing informasi', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Informasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));
      
      await waitFor(() => {
        expect(screen.getByText('Pilih File')).toBeInTheDocument();
      });

      const file = new File(['new test'], 'new-file.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByRole('button', { name: /pilih file/i })
        .parentElement.querySelector('input[type="file"]');
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText('File baru yang akan diupload:')).toBeInTheDocument();
        expect(screen.getByText('new-file.pdf')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(mockUpdateInformasi).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            files: expect.arrayContaining([
              expect.objectContaining({ name: 'test.pdf' }), // existing
              expect.objectContaining({ name: 'new-file.pdf' }) // new
            ])
          })
        );
      });
    });
  });

  describe('Delete Informasi', () => {
    it('deletes informasi with confirmation', async () => {
      window.confirm = jest.fn(() => true);
      
      render(<AdminInformasiPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Informasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Hapus'));

      expect(window.confirm).toHaveBeenCalledWith(
        'Yakin ingin menghapus informasi "Test Informasi"? Tindakan ini tidak dapat dibatalkan.'
      );

      await waitFor(() => {
        expect(mockDeleteInformasi).toHaveBeenCalledWith(1);
      });
    });

    it('cancels delete when confirmation rejected', async () => {
      window.confirm = jest.fn(() => false);
      
      render(<AdminInformasiPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Informasi')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Hapus'));

      expect(mockDeleteInformasi).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Files Support', () => {
    it('handles multiple file uploads', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      fireEvent.click(screen.getByText('Tambah Informasi'));
      
      await waitFor(() => {
        expect(screen.getByText('Pilih File')).toBeInTheDocument();
      });

      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      ];
      
      const fileInput = screen.getByRole('button', { name: /pilih file/i })
        .parentElement.querySelector('input[type="file"]');
      
      await user.upload(fileInput, files);
      
      await waitFor(() => {
        expect(screen.getByText('file1.pdf')).toBeInTheDocument();
        expect(screen.getByText('file2.docx')).toBeInTheDocument();
      });
    });

    it('removes individual files from multiple selection', async () => {
      const user = userEvent.setup();
      render(<AdminInformasiPage />);
      
      fireEvent.click(screen.getByText('Tambah Informasi'));
      
      const files = [
        new File(['test1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'file2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      ];
      
      const fileInput = screen.getByRole('button', { name: /pilih file/i })
        .parentElement.querySelector('input[type="file"]');
      
      await user.upload(fileInput, files);
      
      await waitFor(() => {
        expect(screen.getByText('file1.pdf')).toBeInTheDocument();
        expect(screen.getByText('file2.docx')).toBeInTheDocument();
      });

      // Remove first file
      const removeButtons = screen.getAllByTitle('Hapus file');
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('file1.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('file2.docx')).toBeInTheDocument();
      });
    });
  });
});