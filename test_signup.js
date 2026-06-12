const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log("Testing signup...");
  const randomEmail = `test_${Date.now()}@example.com`;
  const randomUsername = `user_${Date.now()}`;
  
  const { data, error } = await supabase.auth.signUp({
    email: randomEmail,
    password: 'Password123!',
    options: {
      data: {
        firstName: 'Test',
        lastName: 'User',
        username: randomUsername,
        phone: '1234567890',
        twoFA: true,
        interests: ['crypto', 'forex']
      }
    }
  });

  if (error) {
    console.error("Signup failed:", error.message);
  } else {
    console.log("Signup succeeded!", data.user?.id);
  }
}

testSignup();
