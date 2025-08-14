const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function setupPages() {
  try {
    console.log('Setting up pages table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-pages-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('Pages table setup completed successfully!');
    
    // Verify the setup
    const { data, error: selectError } = await supabase
      .from('pages')
      .select('*');
    
    if (selectError) {
      console.error('Error verifying setup:', selectError);
      return;
    }
    
    console.log(`Found ${data.length} pages in the database:`);
    data.forEach(page => {
      console.log(`- ${page.title} (/${page.slug})`);
    });
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupPages();