import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Supabase Edge Function: fetch-place-photo
 *
 * Receives a list of Google photo URLs, downloads them server-side
 * (bypassing browser CORS restrictions), and uploads them permanently
 * to Supabase Storage.
 *
 * Request body: { photoUrls: string[], restaurantId: string }
 * Response:     { photos: string[] }  <-- permanent Supabase Storage URLs
 */
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Use service role to bypass RLS for storage uploads
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { photoUrls, restaurantId } = await req.json() as {
            photoUrls: string[];
            restaurantId: string;
        };

        if (!photoUrls || photoUrls.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No photoUrls provided' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const permanentUrls: string[] = [];
        const uploadErrors: string[] = [];

        // Process up to 5 photos max to avoid timeouts
        const urlsToProcess = photoUrls.slice(0, 5);

        for (let i = 0; i < urlsToProcess.length; i++) {
            const googleUrl = urlsToProcess[i];

            try {
                // 1. Download the photo from Google (server-side, no CORS issues)
                const response = await fetch(googleUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; HelloFoodie/1.0)',
                    },
                });

                if (!response.ok) {
                    uploadErrors.push(`Failed to fetch photo ${i}: ${response.status}`);
                    continue;
                }

                const contentType = response.headers.get('content-type') || 'image/jpeg';
                const imageBlob = await response.arrayBuffer();

                // 2. Build a stable file path in the 'images' bucket
                const ext = contentType.includes('png') ? 'png' : 'jpg';
                const filePath = `restaurants/${restaurantId}/photo_${i}.${ext}`;

                // 3. Upload to Supabase Storage (upsert to overwrite if re-running)
                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, imageBlob, {
                        contentType,
                        upsert: true,
                    });

                if (uploadError) {
                    uploadErrors.push(`Storage upload error for photo ${i}: ${uploadError.message}`);
                    continue;
                }

                // 4. Get the permanent public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                permanentUrls.push(publicUrl);
            } catch (photoErr) {
                uploadErrors.push(`Error processing photo ${i}: ${(photoErr as Error).message}`);
            }
        }

        console.log(`[fetch-place-photo] restaurantId=${restaurantId} → ${permanentUrls.length} uploaded, ${uploadErrors.length} errors`);
        if (uploadErrors.length > 0) {
            console.warn('[fetch-place-photo] Errors:', uploadErrors);
        }

        return new Response(
            JSON.stringify({ photos: permanentUrls, errors: uploadErrors }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        console.error('[fetch-place-photo] Fatal error:', err);
        return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
