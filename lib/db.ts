import { supabase } from './lib/supabaseClient';

export async function query(sql: string, params: any[] = []) {
  try {
    // For simple queries, use Supabase client
    if (sql.includes('SELECT * FROM pages')) {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
    
    if (sql.includes('INSERT INTO pages')) {
      const [title, slug, content, status] = params;
      console.log('Inserting page:', { title, slug, content: content?.substring(0, 50), status });
      
      const { data, error } = await supabase
        .from('pages')
        .insert([{ 
          title, 
          slug, 
          content: content || '', 
          status: status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Insert successful:', data);
      return { insertId: data.id };
    }
    
    if (sql.includes('UPDATE pages')) {
      const [title, slug, content, status, id] = params;
      const { error } = await supabase
        .from('pages')
        .update({ title, slug, content, status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      return { affectedRows: 1 };
    }
    
    if (sql.includes('DELETE FROM pages')) {
      const [id] = params;
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { affectedRows: 1 };
    }
    
    if (sql.includes('SELECT id FROM pages WHERE slug')) {
      const [slug, excludeId] = params;
      let query = supabase.from('pages').select('id').eq('slug', slug);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    
    if (sql.includes('SELECT * FROM pages WHERE slug')) {
      const [slug] = params;
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published');
      
      if (error) throw error;
      return data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}