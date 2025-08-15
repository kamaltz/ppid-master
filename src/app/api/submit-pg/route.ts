import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../lib/lib/postgresClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const query = `
      INSERT INTO requests (pemohon_id, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      12,
      body.rincian_informasi || 'Default info',
      body.tujuan_penggunaan || 'Default purpose',
      body.cara_memperoleh_informasi || 'Email',
      body.cara_mendapat_salinan || 'Email',
      'Diajukan'
    ];

    const result = await pool.query(query, values);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted to PostgreSQL',
      data: result.rows[0]
    });

  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}