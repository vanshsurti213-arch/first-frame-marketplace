const fs = require('fs');
const glob = require('glob');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixFiles() {
  const files = glob.sync('src/app/api/**/*.ts', { cwd: __dirname, absolute: true });
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Fix sendEmail signature
    // sendEmail(email, "subject", body) -> sendEmail({ to: email, subject: "subject", html: body })
    // Regex to match sendEmail with 3 args
    // We have to be careful with multi-line.
    const sendEmailRegex = /sendEmail\(\s*([\s\S]*?),\s*([\s\S]*?),\s*([\s\S]*?)\s*\)/g;
    
    // Custom replace for sendEmail
    if (content.includes('sendEmail(')) {
       // Only replace if it doesn't already have an object {
       if (!content.includes('sendEmail({')) {
          content = content.replace(sendEmailRegex, (match, to, subject, html) => {
             return `sendEmail({ to: ${to}, subject: ${subject}, html: ${html} })`;
          });
          changed = true;
       }
    }

    // 2. Fix cc.creators?.email
    if (content.includes('cc.creators?.email')) {
       content = content.replace(/cc\.creators\?\.email/g, '(Array.isArray(cc.creators) ? cc.creators[0]?.email : (cc.creators as any)?.email)');
       changed = true;
    }

    // 3. Fix createServerSupabase() -> await createServerSupabase()
    if (content.includes('const authSupabase = createServerSupabase()')) {
       content = content.replace(/const authSupabase = createServerSupabase\(\)/g, 'const authSupabase = await createServerSupabase()');
       changed = true;
    }
    if (content.includes('const supabase = createServerSupabase()')) {
       content = content.replace(/const supabase = createServerSupabase\(\)/g, 'const supabase = await createServerSupabase()');
       changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  }

  // 4. Update utils.ts
  const utilsFile = path.join(srcDir, 'lib', 'utils.ts');
  let utilsContent = fs.readFileSync(utilsFile, 'utf8');
  if (!utilsContent.includes('sanitizeCreator')) {
    utilsContent += `\n\n/** Remove PII from creator object before returning to brand/creator */\nexport function sanitizeCreator(creator: any) {\n  if (!creator) return creator;\n  const { phone, instagram_handle, ...safe } = creator;\n  return safe;\n}\n`;
    fs.writeFileSync(utilsFile, utilsContent);
    console.log('Updated utils.ts');
  }
}

fixFiles();
