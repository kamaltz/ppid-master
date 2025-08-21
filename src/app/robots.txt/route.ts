import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const robots = `User-agent: *
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /pemohon/
Disallow: /uploads/
Disallow: /_next/
Disallow: /search?*
Allow: /
Allow: /profil
Allow: /informasi

Sitemap: https://ppid.garutkab.go.id/sitemap.xml

# Block security scanners
User-agent: sqlmap
Disallow: /

User-agent: nikto
Disallow: /

User-agent: nmap
Disallow: /

User-agent: burp
Disallow: /

User-agent: zap
Disallow: /

User-agent: acunetix
Disallow: /

User-agent: nessus
Disallow: /

User-agent: openvas
Disallow: /

User-agent: wpscan
Disallow: /

User-agent: dirb
Disallow: /

User-agent: gobuster
Disallow: /

User-agent: hydra
Disallow: /

# Block old browsers
User-agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)
Disallow: /

User-agent: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)
Disallow: /

User-agent: Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)
Disallow: /`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}