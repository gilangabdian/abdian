import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache sitemap selama 1 jam agar tidak membebani Render API

export async function GET() {
  try {
    const res = await fetch('https://qbdian-api.onrender.com/api/sitemap');
    
    if (!res.ok) {
      throw new Error(`Failed to fetch sitemap from API: ${res.status}`);
    }
    
    const xml = await res.text();
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        // Tambahkan header ini agar Google tahu ini boleh diindex, 
        // menimpa aturan default dari onrender.com jika terbawa
        'X-Robots-Tag': 'index, follow'
      },
    });
  } catch (error) {
    console.error('Sitemap fetch error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
