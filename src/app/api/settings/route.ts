import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';
// import jwt from 'jsonwebtoken'; // Temporarily disabled

export async function GET() {
  try {
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
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil pengaturan'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable authentication after testing
    console.log('Settings API called - auth temporarily disabled');

    const body = await request.json();
    
    // Handle both single setting and bulk settings update
    if (body.key && body.value !== undefined) {
      // Single setting update
      await prisma.setting.upsert({
        where: { key: body.key },
        update: { value: JSON.stringify(body.value) },
        create: { key: body.key, value: JSON.stringify(body.value) }
      });
    } else {
      // Bulk settings update
      const validKeys = ['general', 'header', 'footer', 'hero'];
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
      
      await Promise.all(updates);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Pengaturan berhasil disimpan'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal menyimpan pengaturan'
    }, { status: 500 });
  }
}