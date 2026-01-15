import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { TagRouter } from '@/components/tags/TagRouter';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  const { data: tag } = await supabaseAdmin
    .from('tags')
    .select(`
      *,
      dog:dogs(name, breed, photo_url)
    `)
    .eq('tag_code', code)
    .single();

  if (!tag) {
    return { title: 'Tag Not Found - K9 ProTrain' };
  }

  if (tag.status === 'deactivated') {
    return { title: 'Tag Deactivated - K9 ProTrain' };
  }

  if (!tag.dog) {
    return { title: 'Tag Not Assigned - K9 ProTrain' };
  }

  return {
    title: `${tag.dog.name} - K9 ProTrain`,
    description: `${tag.dog.name} the ${tag.dog.breed}`,
    openGraph: {
      title: `${tag.dog.name} - K9 ProTrain`,
      description: `${tag.dog.name} the ${tag.dog.breed}`,
      images: tag.dog.photo_url ? [tag.dog.photo_url] : [],
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { code } = await params;

  // Fetch tag with related data
  const { data: tag, error } = await supabaseAdmin
    .from('tags')
    .select(`
      *,
      dog:dogs(
        id,
        name,
        breed,
        color,
        photo_url,
        weight,
        age_years,
        age_months,
        microchip_id,
        notes,
        lost_mode_enabled,
        lost_pet_settings,
        family:families(
          id,
          name,
          primary_contact_id,
          primary_contact:users!families_primary_contact_id_fkey(
            id,
            name,
            phone,
            email
          )
        )
      ),
      facility:facilities(
        id,
        name,
        phone,
        email
      )
    `)
    .eq('tag_code', code)
    .single();

  if (error || !tag) {
    notFound();
  }

  // Log the scan (server-side)
  await supabaseAdmin.from('tag_scans').insert({
    tag_id: tag.id,
    is_authenticated: false, // Will be updated client-side if user is logged in
    action_taken: 'page_view',
  });

  return <TagRouter tag={tag} />;
}
