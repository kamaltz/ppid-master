import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const insertData = {
      pemohon_id: 12,
      rincian_informasi: body.rincian_informasi || 'Default info',
      tujuan_penggunaan: body.tujuan_penggunaan || 'Default purpose',
      cara_memperoleh_informasi: body.cara_memperoleh_informasi || 'Email',
      cara_mendapat_salinan: body.cara_mendapat_salinan || 'Email',
      status: 'Diajukan'
    };

    const { data, error } = await supabase
      .from('requests')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted successfully',
      data 
    });

  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}