import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPage(slug: string) {
  try {
    console.log('Looking for page with slug:', slug);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching page:', error);
      return null;
    }
    
    console.log('Found page:', data);
    return data;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{page.title}</h1>
          <div 
            className="content-display"
            style={{
              lineHeight: '1.6',
              fontSize: '16px'
            }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
          <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
            Dipublikasikan: {new Date(page.created_at).toLocaleDateString('id-ID')}
            {page.updated_at !== page.created_at && (
              <span className="ml-4">
                Diperbarui: {new Date(page.updated_at).toLocaleDateString('id-ID')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}