import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/lib/supabaseClient';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('pemohon')
      .select('id, nama, email')
      .limit(1);
    
    if (error) {
      console.error('Supabase test error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      data 
    });
    
  } catch (error: any) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}