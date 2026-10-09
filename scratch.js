const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envStr = fs.readFileSync('.env.local', 'utf8');
const env = envStr.split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('id, email, username, verified').order('created_at', { ascending: false }).limit(3);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
run();
