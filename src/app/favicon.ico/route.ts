import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/lib/prismaClient';

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: 'general' }
    });
    
    if (settings?.value) {
      const generalSettings = JSON.parse(settings.value);
      if (generalSettings.favicon) {
        const timestamp = Date.now();
        const faviconUrl = `${generalSettings.favicon}?v=${timestamp}&cache=false`;
        
        return NextResponse.redirect(new URL(faviconUrl, request.url), {
          status: 302,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    }
    
    return NextResponse.redirect(new URL('/logo-garut.svg', request.url));
  } catch (error) {
    console.error('Error serving favicon:', error);
    return NextResponse.redirect(new URL('/logo-garut.svg', request.url));
  }
}