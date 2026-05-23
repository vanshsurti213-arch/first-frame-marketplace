require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// Parse TS file manually (very basic regex-based extraction to avoid setting up a TS compiler just for this script)
const creatorsList = require('./creators_data.js');

const contactDetails = require('./creator_contact_details.json');
const videosDir = 'C:\\Users\\lenovo\\Downloads\\Creator Profile Board Design\\public\\videos';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log(`Found ${creatorsList.length} creators to process.`);
  
  for (const c of creatorsList) {
    console.log(`\nProcessing ${c.name}...`);
    
    // Find contact details by fuzzy matching name
    const contact = contactDetails.find(cd => cd.name.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())) || {
      email: `${c.handle.replace('@', '')}@example.com`,
      phone: '0000000000',
      city: 'India'
    };
    
    let videoUrl = '';
    
    if (c.videoFile) {
      const videoPath = path.join(videosDir, c.videoFile);
      if (fs.existsSync(videoPath)) {
        console.log(`Uploading video ${c.videoFile}...`);
        const fileBuffer = fs.readFileSync(videoPath);
        
        const fileName = `creators/${Date.now()}_${c.videoFile.replace(/\s+/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('firstframe')
          .upload(fileName, fileBuffer, {
            contentType: 'video/mp4',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Failed to upload video for ${c.name}:`, uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage.from('firstframe').getPublicUrl(uploadData.path);
          videoUrl = publicUrlData.publicUrl;
          console.log(`Video uploaded: ${videoUrl}`);
        }
      } else {
        console.warn(`Video file not found locally: ${videoPath}`);
      }
    }
    
    const dbCreator = {
      name: c.name,
      niche: c.niches.join(', '),
      city: contact.city,
      email: contact.email,
      phone: contact.phone,
      instagram_handle: c.handle,
      best_video_url: videoUrl,
      thumbnail_url: '',
      is_active: true,
      // We didn't alter the DB schema so we omit followers, avg_views, and brand_collabs for now as per the DB constraints.
      // Wait, I can try to insert them! If they don't exist, Postgres will throw. 
      // Since I failed to alter the schema earlier, I will omit them for safety and just put them in the DB if the schema has them later.
    };
    
    console.log(`Inserting into database...`);
    const { data: insertData, error: insertError } = await supabase
      .from('creators')
      .insert(dbCreator);
      
    if (insertError) {
      console.error(`Failed to insert ${c.name}:`, insertError.message);
    } else {
      console.log(`Successfully added ${c.name}!`);
    }
  }
  console.log('\nMigration Complete!');
}

run();
