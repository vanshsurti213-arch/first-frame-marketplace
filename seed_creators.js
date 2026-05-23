const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

function parseEnv() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      env[key] = val;
    }
  });
  return env;
}

const env = parseEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const data = [
  { email: 'arpita.mahajan1983@gmail.com', phone: '6283272325', address: 'GATE 2,chandigarh university, gharuan.', name: 'Arpita Mahajan', handle: 'arpita.mahajan' },
  { email: 'Suryaja.mowade02@gmail.com', phone: '918830641894', address: 'Shapoorji pallonji joyville, tower 7, 503 Hadapsar', name: 'Suryaja Mowade', handle: 'suryaja.mowade' },
  { email: 'khuranavaishnavi9@gmail.com', phone: '9474250449', address: 'Gate 2 Chandigarh University, Ludhiana-Chandigarh NH, 140413', name: 'Vaishnavi Khurana', handle: 'khuranavaishnavi' },
  { email: 'uppalsiyawork01@gmail.com', phone: '9821460614', address: 'Hno 478, second floor,Urban estate sector 7, Gurgaon, Haryana 122001', name: 'Siya Uppal', handle: 'uppalsiya' },
  { email: 'negarmansuri.01@gmail.com', phone: '6359621401', address: '359 jantanagar ramol road near municipality school, Ahmedabad', name: 'Negar Mansuri', handle: 'negarmansuri' },
  { email: 'shashankirawat0108@gmail.com', phone: '917863077481', address: 'C-6 rajlaxmi society , near kamla nagar talav, ajwa road - 390019', name: 'Shashanki Rawat', handle: 'shashankirawat' },
  { email: 'vimidsilva@gmail.com', phone: '9579679158', address: 'Virar (w), Umbergothan, shirlaiwadi, post office. - 401301', name: 'Vimi Dsilva', handle: 'vimidsilva' },
  { email: 'kavyaduraisamy2@gmail.com', phone: '9894660476', address: '5,Kurinchi nagar extension, Avinashiappa layout 2nd street, Sheriff colony, Tirupur - 641604', name: 'Kavya Duraisamy', handle: 'kavyaduraisamy' },
  { email: 'mahig8936@gmail.com', phone: '9165209554', address: '559 part 1 bear chl 114 hospital , scheme 114 indore - 452010', name: 'Mahi G', handle: 'mahig8936' },
  { email: 'aniyaparihar1@gmail.com', phone: '9999999999', address: '13/2 Indra colony Janipur Jammu 180007 - 180007', name: 'Aniya Parihar', handle: 'aniyaparihar' },
  { email: 'rutara05@gmail.com', phone: '9619800799', address: '902/9th floor New SRA building Dr.Ambedkar building Bharat Nagar near serendipity building Bandra East Mumbai - 400051', name: 'Ruta Ra', handle: 'rutara05' },
  { email: 'aryahi.s.barde@gmail.com', phone: '9167013638', address: 'Vartak nagar shri Vinayak society 7/52 thane west - 400606', name: 'Aryahi Barde', handle: 'aryahi.barde' },
  { email: 'ayusingh9876@gmail.com', phone: '9606132803', address: '315/A amba bhavan 1st cross bylappa circle kalyan nagar near St Mary’s school T Dasarahalli Bengaluru 57 - 560057', name: 'Ayu Singh', handle: 'ayusingh' },
  { email: 'Asthaajmera2205@gmail.com', phone: '919875283100', address: 'A-84(saral), sanjay colony Bhilwara,rajasthan 311001 - 311001', name: 'Astha Ajmera', handle: 'asthaajmera' },
  { email: 'mahajanipshita.36@gmail.com', phone: '9596039307', address: 'Address:wd no.32 rakhwala paddhar, santra morh,near shiv mandir, talab tillo jammu pin code - 180002', name: 'Ipshita Mahajan', handle: 'mahajanipshita' },
  { email: 'aadrikaworks@gmail.com', phone: '8810645041', address: '2011 B Windsor Paradise 2, Rajnagar Extension, Ghaziabad - 201017', name: 'Aadrika Works', handle: 'aadrikaworks' },
  { email: 'jewellopes1206@gmail.com', phone: '8446544951', address: 'Pragati house, lopes sawmill, malodi main road, virar west, agashi, umbergothan, shirlaywadi - 401301', name: 'Jewel Lopes', handle: 'jewellopes' },
  { email: 'collab.ridhima@gmail.com', phone: '9045239898', address: 'Flat no 404 omkaar apartments jeoni mandi near water works - 282004', name: 'Ridhima Collab', handle: 'collab.ridhima' },
  { email: 'akankshasingh8516@gmail.com', phone: '7973065625', address: 'House no.3274 Sector - 27/d Chandigarh - 160019', name: 'Akanksha Singh', handle: 'akankshasingh' },
  { email: 'goonchachhibber@gmail.com', phone: '919810461466', address: 'D-27 First FloorAnand Vihar Near arya samaj mandir - 110092', name: 'Gooncha Chhibber', handle: 'goonchachhibber' },
  { email: 'aishwaryabatchu1@gmail.com', phone: '9676689991', address: 'Plot 8/2, Vivekananda nagar colony, Kukatpally, Hyderabad 500072 - 500072', name: 'Aishwarya Batchu', handle: 'aishwaryabatchu' },
  { email: 'maanikadhawan10@gmail.com', phone: '917838482225', address: '136 first floor ambica vihar paschim vihar new delhi - 110087', name: 'Maanika Dhawan', handle: 'maanikadhawan' },
  { email: 'yashikavermax@gmail.com', phone: '8630240147', address: 'T-2,402 Madhuban greens near MIT COLLEGE - 244001', name: 'Yashika Verma', handle: 'yashikavermax' },
  { email: 'khushijha104@gmail.com', phone: '9911760940', address: 'Jss medical college bannimantap mysuru karnatka 570015 - 570015', name: 'Khushi Jha', handle: 'khushijha104' },
  { email: 'rehmatsandhu85@gmail.com', phone: '7341151204', address: 'Falcon View Sector 66-A Y tower 1104 Mohali, Punjab. - 140306', name: 'Rehmat Sandhu', handle: 'rehmatsandhu' },
  { email: 'sumedhagoel28@gmail.com', phone: '9971754389', address: '5A flat no.5, 1st floor Savitri Nagar, New Delhi - 110017', name: 'Sumedha Goel', handle: 'sumedhagoel' },
  { email: 'rhythmxgupta@gmail.com', phone: '6280659570', address: '#3867/1 Sector 47-D, Chandigarh - 160047', name: 'Rhythm Gupta', handle: 'rhythmxgupta' },
  { email: 'rishi122370@gmail.com', phone: '8005522820', address: '10/147,, radhakrishna Colony,, behind radhakrishna talkeis Ichalakaranji, Hatkanangale, - 416115', name: 'Rishi', handle: 'rishi122370' },
];

async function seed() {
  const payload = data.map(d => ({
    name: d.name,
    email: d.email,
    phone: d.phone,
    instagram_handle: d.handle,
    followers_count: Math.floor(Math.random() * 50000) + 5000,
    profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    default_address: d.address,
    is_approved: true,
    niche: ['Fashion', 'Lifestyle']
  }));

  const { error } = await supabase.from('creators').insert(payload);
  
  if (error) {
    console.error("Failed to seed creators:", error);
  } else {
    console.log("Successfully seeded 28 creators back into the database!");
  }
}

seed();
