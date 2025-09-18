import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export async function GET() {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const settings = await prisma.setting.findMany();
    
    const settingsObj = settings?.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, unknown>) || {};
    
    return NextResponse.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    
    // Return default settings if database is not available
    const defaultSettings = {
      general: {
        namaInstansi: 'PPID Kabupaten Garut',
        logo: '/logo-garut.svg',
        favicon: '/logo-garut.svg',
        email: 'ppid@garutkab.go.id',
        telepon: '(0262) 123456',
        alamat: 'Jl. Pembangunan No. 1, Garut',
        websiteTitle: 'PPID Kabupaten Garut',
        websiteDescription: 'Pejabat Pengelola Informasi dan Dokumentasi',
        marqueeEnabled: false,
        marqueeText: 'Selamat datang di PPID Kabupaten Garut - Layanan Informasi Publik yang Transparan'
      },
      applications: {
        enabled: true,
        apps: []
      },
      header: {
        menuItems: [
          { label: 'Beranda', url: '/', hasDropdown: false, dropdownItems: [] },
          { label: 'Profil PPID', url: '/profil', hasDropdown: false, dropdownItems: [] },
          { label: 'Informasi Publik', url: '/informasi', hasDropdown: false, dropdownItems: [] },
          { label: 'Permohonan', url: '/permohonan', hasDropdown: false, dropdownItems: [] }
        ]
      },
      footer: {
        quickLinks: [],
        socialMedia: { facebook: '', twitter: '', instagram: '', youtube: '' }
      },
      hero: {
        title: 'Selamat Datang di PPID Kabupaten Garut',
        subtitle: 'Pejabat Pengelola Informasi dan Dokumentasi',
        description: 'Layanan informasi publik yang transparan dan akuntabel',
        backgroundImage: '',
        ctaText: 'Ajukan Permohonan',
        ctaUrl: '/permohonan',
        slides: []
      }
    };
    
    return NextResponse.json({
      success: true,
      data: defaultSettings
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const body = await request.json();
    console.log('Saving settings:', body);
    
    // Handle both single setting and bulk settings update
    if (body.key && body.value !== undefined) {
      // Single setting update
      const result = await prisma.setting.upsert({
        where: { key: body.key },
        update: { value: JSON.stringify(body.value) },
        create: { key: body.key, value: JSON.stringify(body.value) }
      });
      console.log(`Saved setting ${body.key}:`, result);
    } else {
      // Bulk settings update
      const validKeys = ['general', 'header', 'footer', 'hero', 'applications'];
      const updates = [];
      
      for (const [key, value] of Object.entries(body)) {
        if (validKeys.includes(key)) {
          updates.push(
            prisma.setting.upsert({
              where: { key },
              update: { value: JSON.stringify(value) },
              create: { key, value: JSON.stringify(value) }
            })
          );
        }
      }
      
      if (updates.length === 0) {
        return NextResponse.json({
          error: 'No valid settings provided'
        }, { status: 400 });
      }
      
      const results = await Promise.all(updates);
      console.log('Bulk save results:', results);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return NextResponse.json({
        success: false,
        error: 'Database tidak tersedia. Silakan coba lagi nanti.'
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Gagal menyimpan pengaturan'
    }, { status: 500 });
  }
}