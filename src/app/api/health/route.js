const postmark = require('postmark');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

export async function GET() {
  const results = {};

  // Check Postmark
  try {
    const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    const server = await client.getServer();
    results.postmark = { ok: true, serverName: server.Name };
  } catch (err) {
    results.postmark = { ok: false, error: err.message };
  }

  // Check Supabase
  try {
    const supabase = createSupabaseClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    const { count, error } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    results.supabase = { ok: true, subscriberCount: count };
  } catch (err) {
    results.supabase = { ok: false, error: err.message };
  }

  const allOk = Object.values(results).every(r => r.ok);
  return Response.json(results, { status: allOk ? 200 : 500 });
}
