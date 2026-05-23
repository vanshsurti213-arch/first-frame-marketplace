const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
function parseEnv() {
  try {
    const content = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
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
    return env;
  } catch (e) {
    console.error('Could not read .env.local file');
    return {};
  }
}

const env = parseEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const creatorsList = [
  { name: 'Ridhima Mangal', handle: '@_.riddhiimaa._', niches: ['Beauty', 'Fashion', 'UGC Ads', 'Unboxing', 'Travel'], videoFile: 'ridhima.mp4' },
  { name: 'Sumedha Goel', handle: '@sumeedhhaa', niches: ['Fashion', 'Beauty', 'Food'], videoFile: 'SUMEDHA.mp4' },
  { name: 'Rhythm Gupta', handle: '@rhhytthhmm', niches: ['Fashion', 'Beauty', 'Lifestyle'], videoFile: 'RHYTHM.mp4' },
  { name: 'Siya Uppal', handle: '@siyauppall', niches: ['Fashion', 'Beauty'], videoFile: 'siya.MP4' },
  { name: 'Jewel Lopes', handle: '@jewel_lopes', niches: ['Fashion', 'Lifestyle', 'Beauty', 'Travel'], videoFile: 'jewel.mp4' },
  { name: 'Aniya Parihar', handle: '@blush_berry24', niches: ['Beauty', 'Fashion', 'Food', 'Unboxing'], videoFile: 'aniya parihar.mp4' },
  { name: 'Rishika Jain', handle: '@rishika.jain17', niches: ['Fashion', 'Lifestyle', 'Beauty'], videoFile: 'RISHIKA.mp4' },
  { name: 'Riya Maheshwari', handle: '@therirrijournal', niches: ['Beauty', 'Fitness', 'Fashion', 'Lifestyle', 'UGC Ads', 'Travel'], videoFile: 'riya.mp4' },
  { name: 'Yashika Verma', handle: '@yashika_vermaaa', niches: ['Beauty', 'Lifestyle', 'Fashion', 'Comedy'], videoFile: 'YASHIKA.mp4' },
  { name: 'Negar Mansuri', handle: '@negarmansuri_', niches: ['Beauty', 'Fashion', 'UGC Ads', 'Lifestyle'], videoFile: 'negarmansuri.mp4' },
  { name: 'Aryahi Barde', handle: '@aaryahibarde', niches: ['Beauty', 'Fashion', 'Lifestyle'], videoFile: 'aaryahi barade.mp4' },
  { name: 'Rehmat Sandhu', handle: '@remsandhu', niches: ['Fashion', 'Lifestyle', 'Travel'], videoFile: 'REM.mp4' },
  { name: 'Ananya Mehta', handle: '@punanyamehta', niches: ['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Home', 'Family', 'Travel', 'UGC Ads', 'Unboxing', 'Lifestyle', 'Comedy'], videoFile: 'ananya.mp4' },
  { name: 'Suryaja Mowade', handle: '@thisissuryjja', niches: ['Beauty', 'Fashion', 'Fitness', 'Food', 'Lifestyle', 'UGC Ads', 'Travel', 'Comedy'], videoFile: 'suryajaya.mp4' },
  { name: 'Ayushi Singh', handle: '@ayushisingh.png', niches: ['UGC Ads', 'Lifestyle', 'Fashion'], videoFile: 'Aayushi Singh.mp4' },
  { name: 'Maanika Dhawan', handle: '@maanikadhawan', niches: ['Fashion', 'Beauty', 'Lifestyle'], videoFile: 'MAANIKA.mp4' },
  { name: 'Shiwanshi Pandey', handle: '@ugcwithshiw', niches: ['Tech', 'Fitness', 'UGC Ads'], videoFile: 'shiwanshi pandey.mp4' },
  { name: 'Shashanki Rawat', handle: '@shashanki_rawat', niches: ['Beauty', 'Skincare', 'UGC Ads', 'Fashion'], videoFile: 'shashanki.mp4' },
  { name: 'Rutuja Dhotre', handle: '@__taraaaaaa_', niches: ['Fashion', 'Lifestyle', 'Dance', 'Skincare'], videoFile: 'TARA.mp4' },
  { name: "Vimi D'silva", handle: '@with_weandme', niches: ['Beauty', 'Fashion', 'Lifestyle', 'UGC Ads'], videoFile: 'vimi.mp4' },
  { name: 'Gooncha Chhibber', handle: '@gunchachhibber', niches: ['Skincare', 'Fashion', 'Lifestyle'], videoFile: 'GUNCHA.mp4' },
  { name: 'Kavya Duraisamy', handle: '@glowcheck_with_k', niches: ['Beauty', 'Skincare', 'Lifestyle'], videoFile: 'KAVYA.mp4' },
  { name: 'Arpita Mahajan', handle: '@arpitaaa.mahajan', niches: ['Lifestyle', 'Campus'], videoFile: 'arpita.MP4' },
  { name: 'Aadrika Acharya', handle: '@aadrikaa_acharya', niches: ['Travel', 'Beauty', 'Lifestyle'], videoFile: 'AADRIKA.mp4' },
  { name: 'Ipshita Mahajan', handle: '@ipshita_07__', niches: ['Lifestyle', 'Vlog', 'Fashion'], videoFile: 'IPSHITA MAHAJAN.mp4' },
  { name: 'Akanksha Singh', handle: '@akanksha.x', niches: ['Beauty', 'Fashion', 'Lifestyle'], videoFile: 'AAKANSHA.mp4' },
  { name: 'Astha Ajmera', handle: '@allabout.astha', niches: ['Skincare', 'Beauty', 'Makeup'], videoFile: 'ASTHA.mp4' },
  { name: 'Mahi Gupta', handle: '@mahiig_23', niches: ['Fashion', 'Beauty', 'Home', 'Travel', 'UGC Ads', 'Lifestyle'], videoFile: 'mahi.mp4' },
  { name: 'Sehajpreet Kaur', handle: '@sehajpreet_126', niches: ['Lifestyle', 'Campus'], videoFile: 'sehajpreet.MOV' },
  { name: 'Khushi', handle: '@hasikhushie', niches: ['UGC Ads', 'Beauty', 'Lifestyle'], videoFile: 'KHUSHI.mp4' }
];

const VALID_NICHES = ['Beauty', 'Lifestyle', 'Tech', 'Fashion', 'Food', 'Fitness'];
const DOWNLOADS_DIR = 'c:\\Users\\lenovo\\Downloads';

function getValidNiche(niches) {
  for (const n of niches) {
    if (VALID_NICHES.includes(n)) return n;
  }
  return 'Lifestyle'; // Default fallback
}

async function uploadVideo(videoFile) {
  if (!videoFile) return null;
  const filePath = path.join(DOWNLOADS_DIR, videoFile);
  if (!fs.existsSync(filePath)) {
    console.warn(`Video file not found: ${filePath}`);
    return null;
  }

  const fileName = `${Date.now()}_${videoFile.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  console.log(`Uploading ${fileName}...`);
  
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from('creator-videos')
    .upload(fileName, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (error) {
    console.error(`Failed to upload ${videoFile}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('creator-videos')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

async function run() {
  console.log(`Starting import of ${creatorsList.length} creators...`);
  
  for (const creator of creatorsList) {
    console.log(`\nProcessing: ${creator.name}`);
    
    // Check if creator already exists by email
    const email = `${creator.handle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@example.com`;
    
    const { data: existing } = await supabase
      .from('creators')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existing) {
      console.log(`Creator ${creator.name} already exists. Skipping.`);
      continue;
    }

    const videoUrl = await uploadVideo(creator.videoFile);

    const newCreator = {
      name: creator.name,
      niche: getValidNiche(creator.niches),
      city: 'India', // Defaulting since we don't have this data
      email: email,
      phone: '9999999999',
      instagram_handle: creator.handle,
      best_video_url: videoUrl,
      is_active: true
    };

    const { error } = await supabase
      .from('creators')
      .insert(newCreator);

    if (error) {
      console.error(`Error inserting ${creator.name}:`, error.message);
    } else {
      console.log(`✅ Successfully added ${creator.name}`);
    }
  }
  
  console.log('\nImport complete!');
}

run();
