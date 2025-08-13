import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/lib/supabaseClient';

export async function GET() {
  const tests = [];
  
  try {
    // Test 1: Environment Variables
    tests.push({
      name: 'Environment Variables',
      status: process.env.SUPABASE_URL && process.env.SUPABASE_KEY ? 'PASS' : 'FAIL',
      details: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_KEY
      }
    });

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.from('pemohon').select('count').limit(1);
      tests.push({
        name: 'Supabase Connection',
        status: error ? 'FAIL' : 'PASS',
        details: error ? error.message : 'Connected'
      });
    } catch (err: any) {
      tests.push({
        name: 'Supabase Connection',
        status: 'FAIL',
        details: err.message
      });
    }

    // Test 3: Tables Exist
    const tables = ['pemohon', 'permintaan_informasi'];
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        tests.push({
          name: `Table: ${table}`,
          status: error ? 'FAIL' : 'PASS',
          details: error ? error.message : 'Exists'
        });
      } catch (err: any) {
        tests.push({
          name: `Table: ${table}`,
          status: 'FAIL',
          details: err.message
        });
      }
    }

    // Test 4: Insert Test
    try {
      const { data: pemohonData } = await supabase.from('pemohon').select('id').limit(1).single();
      if (pemohonData) {
        const { data, error } = await supabase
          .from('permintaan_informasi')
          .insert({
            pemohon_id: pemohonData.id,
            rincian_informasi: 'Test insert',
            tujuan_penggunaan: 'Testing',
            status: 'Diajukan'
          })
          .select()
          .single();

        if (!error && data) {
          await supabase.from('permintaan_informasi').delete().eq('id', data.id);
          tests.push({
            name: 'CRUD Test',
            status: 'PASS',
            details: 'Insert/Delete OK'
          });
        } else {
          tests.push({
            name: 'CRUD Test',
            status: 'FAIL',
            details: error?.message || 'Failed'
          });
        }
      } else {
        tests.push({
          name: 'CRUD Test',
          status: 'FAIL',
          details: 'No pemohon data'
        });
      }
    } catch (err: any) {
      tests.push({
        name: 'CRUD Test',
        status: 'FAIL',
        details: err.message
      });
    }

    const passCount = tests.filter(t => t.status === 'PASS').length;
    const totalTests = tests.length;

    return NextResponse.json({
      summary: {
        total: totalTests,
        passed: passCount,
        failed: totalTests - passCount,
        status: passCount === totalTests ? 'ALL_PASS' : 'SOME_FAILED'
      },
      tests
    });

  } catch (error: any) {
    return NextResponse.json({
      summary: { status: 'CRITICAL_ERROR' },
      error: error.message,
      tests
    });
  }
}