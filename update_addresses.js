const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vnshcacvlqpxqtbxzzsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2hjYWN2bHFweHF0Ynh6enNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQzODc2MCwiZXhwIjoyMDk1MDE0NzYwfQ.L9WH-qfc2DY9fJHD0jgXquFTmfEo32OR8Ztcpn5Aj38';
const supabase = createClient(supabaseUrl, supabaseKey);

const data = [
  { email: 'arpita.mahajan1983@gmail.com', phone: '6283272325', address: 'GATE 2,chandigarh university, gharuan.' },
  { email: 'Suryaja.mowade02@gmail.com', phone: '918830641894', address: 'Shapoorji pallonji joyville, tower 7, 503 Hadapsar' },
  { email: 'khuranavaishnavi9@gmail.com', phone: '9474250449', address: 'Gate 2 Chandigarh University, Ludhiana-Chandigarh NH, 140413' },
  { email: 'uppalsiyawork01@gmail.com', phone: '9821460614', address: 'Hno 478, second floor,Urban estate sector 7, Gurgaon, Haryana 122001' },
  { email: 'negarmansuri.01@gmail.com', phone: '6359621401', address: '359 jantanagar ramol road near municipality school, Ahmedabad' },
  { email: 'shashankirawat0108@gmail.com', phone: '917863077481', address: 'C-6 rajlaxmi society , near kamla nagar talav, ajwa road - 390019' },
  { email: 'vimidsilva@gmail.com', phone: '9579679158', address: 'Virar (w), Umbergothan, shirlaiwadi, post office. - 401301' },
  { email: 'kavyaduraisamy2@gmail.com', phone: '9894660476', address: '5,Kurinchi nagar extension, Avinashiappa layout 2nd street, Sheriff colony, Tirupur - 641604' },
  { email: 'mahig8936@gmail.com', phone: '9165209554', address: '559 part 1 bear chl 114 hospital , scheme 114 indore - 452010' },
  { email: 'aniyaparihar1@gmail.com', phone: '#ERROR!', address: '13/2 Indra colony Janipur Jammu 180007 - 180007' },
  { email: 'rutara05@gmail.com', phone: '9619800799', address: '902/9th floor New SRA building Dr.Ambedkar building Bharat Nagar near serendipity building Bandra East Mumbai - 400051' },
  { email: 'aryahi.s.barde@gmail.com', phone: '9167013638', address: 'Vartak nagar shri Vinayak society 7/52 thane west - 400606' },
  { email: 'ayusingh9876@gmail.com', phone: '9606132803', address: '315/A amba bhavan 1st cross bylappa circle kalyan nagar near St Mary’s school T Dasarahalli Bengaluru 57 - 560057' },
  { email: 'Asthaajmera2205@gmail.com', phone: '919875283100', address: 'A-84(saral), sanjay colony Bhilwara,rajasthan 311001 - 311001' },
  { email: 'mahajanipshita.36@gmail.com', phone: '9596039307', address: 'Address:wd no.32 rakhwala paddhar, santra morh,near shiv mandir, talab tillo jammu pin code - 180002 City: jammu State: j & k Pin Code:- 180002 Ph No.:- 9596039307 - 180002' },
  { email: 'aadrikaworks@gmail.com', phone: '8810645041', address: '2011 B Windsor Paradise 2, Rajnagar Extension, Ghaziabad - 201017' },
  { email: 'jewellopes1206@gmail.com', phone: '8446544951', address: 'Pragati house, lopes sawmill, malodi main road, virar west, agashi, umbergothan, shirlaywadi - 401301' },
  { email: 'collab.ridhima@gmail.com', phone: '9045239898', address: 'Flat no 404 omkaar apartments jeoni mandi near water works - 282004' },
  { email: 'akankshasingh8516@gmail.com', phone: '7973065625', address: 'House no.3274 Sector - 27/d Chandigarh - 160019' },
  { email: 'goonchachhibber@gmail.com', phone: '919810461466', address: 'D-27 First FloorAnand Vihar Near arya samaj mandir - 110092' },
  { email: 'aishwaryabatchu1@gmail.com', phone: '9676689991', address: 'Plot 8/2, Vivekananda nagar colony, Kukatpally, Hyderabad 500072 - 500072' },
  { email: 'maanikadhawan10@gmail.com', phone: '917838482225', address: '136 first floor ambica vihar paschim vihar new delhi - 110087' },
  { email: 'yashikavermax@gmail.com', phone: '8630240147', address: 'T-2,402 Madhuban greens near MIT COLLEGE - 244001' },
  { email: 'khushijha104@gmail.con', phone: '9911760940', address: 'Jss medical college bannimantap mysuru karnatka 570015 - 570015' },
  { email: 'rehmatsandhu85@gmail.com', phone: '7341151204', address: 'Falcon View Sector 66-A Y tower 1104 Mohali, Punjab. - 140306' },
  { email: 'sumedhagoel28@gmail.con', phone: '9971754389', address: '5A flat no.5, 1st floor Savitri Nagar, New Delhi - 110017' },
  { email: 'rhythmxgupta@gmail.com', phone: '6280659570', address: '#3867/1 Sector 47-D, Chandigarh - 160047' },
  { email: 'rishi122370@gmail.com', phone: '8005522820', address: '10/147,, radhakrishna Colony,, behind radhakrishna talkeis Ichalakaranji, Hatkanangale, - 416115' },
];

async function updateAddresses() {
  for (const item of data) {
    const { email, address } = item;
    // We update by exact email match (case insensitive if needed, but let's try exact first)
    const { data: updated, error } = await supabase
      .from('creators')
      .update({ default_address: address })
      .ilike('email', email);
    
    if (error) {
      console.error(`Failed for ${email}:`, error.message);
    } else {
      console.log(`Updated address for: ${email}`);
    }
  }
}

updateAddresses();
