import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      data: data,
      error: error
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error
    });
  }
}

export async function POST() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .insert([{
        title: 'Test Page',
        slug: 'test-' + Date.now(),
        content: '<p>Test content</p>',
        status: 'draft'
      }])
      .select()
      .single();
    
    return NextResponse.json({
      success: !error,
      data: data,
      error: error
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error
    });
  }
}