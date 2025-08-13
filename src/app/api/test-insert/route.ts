import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/lib/supabaseClient';

export async function POST() {
  try {
    // Get first pemohon ID
    const { data: pemohonData } = await supabase
      .from('pemohon')
      .select('id')
      .limit(1)
      .single();
    
    if (!pemohonData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No pemohon found in database'
      });
    }
    
    const testData = {
      pemohon_id: pemohonData.id,
      rincian_informasi: 'Test permintaan',
      tujuan_penggunaan: 'Test purpose',
      cara_memperoleh_informasi: 'Email',
      cara_mendapat_salinan: 'Email',
      status: 'Diajukan',
      tanggal_permintaan: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('permintaan_informasi')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.error('Direct insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        full: error
      });
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Insert failed',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}