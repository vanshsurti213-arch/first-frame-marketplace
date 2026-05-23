const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function parseEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"')) val = val.slice(1, -1);
      env[key] = val;
    }
  });
  return env;
}
const env = parseEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  console.log('Updating bucket size limit...');
  const { data: bucket, error: bucketError } = await supabase.storage.updateBucket('creator-videos', {
    fileSizeLimit: 500 * 1024 * 1024 // 500MB
  });
  if (bucketError) console.error('Bucket Error:', bucketError.message);
  else console.log('Bucket limit increased successfully.');

  const filesToRetry = [
    { name: 'Siya Uppal', handle: '@siyauppall', file: 'siya.MP4' },
    { name: 'Sehajpreet Kaur', handle: '@sehajpreet_126', file: 'sehajpreet.MOV' }
  ];

  for (const c of filesToRetry) {
    const filePath = path.join('c:\\Users\\lenovo\\Downloads', c.file);
    if (!fs.existsSync(filePath)) continue;
    console.log(`Uploading ${c.file}...`);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${Date.now()}_${c.file.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('creator-videos')
      .upload(fileName, fileBuffer, { contentType: 'video/mp4', upsert: true });
      
    if (error) {
      console.error(`Failed ${c.file}:`, error.message);
    } else {
      const { data: publicUrlData } = supabase.storage.from('creator-videos').getPublicUrl(fileName);
      const url = publicUrlData.publicUrl;
      console.log(`Uploaded! URL: ${url}`);
      
      const email = `${c.handle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@example.com`;
      await supabase.from('creators').update({ best_video_url: url }).eq('email', email);
      console.log(`Updated ${c.name}`);
    }
  }
}

fix();
