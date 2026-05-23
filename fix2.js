const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/**/*.ts', { cwd: __dirname, absolute: true });
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // The broken pattern looks like:
  // html: someFunction(args })
  //      );
  // or
  // html: someFunction(args }) );
  
  // Regex to find `html: functionName(args })` and the trailing `);`
  // We'll capture everything after `html: ` up to `})` 
  const badPattern = /html:\s*(.*?)\s*\}\)\s*\r?\n\s*\);/g;
  
  if (badPattern.test(content)) {
     content = content.replace(badPattern, (match, htmlContent) => {
        // htmlContent is like `creatorAddedToCampaign(..., portalUrl`
        // We need to add the closing `)` to the function, and then close the sendEmail with `});`
        return `html: ${htmlContent}) });`;
     });
     changed = true;
  }

  // Also check if there's an inline one: `html: functionName(args }) );`
  const badPatternInline = /html:\s*(.*?)\s*\}\)\s*\);/g;
  if (badPatternInline.test(content)) {
     content = content.replace(badPatternInline, (match, htmlContent) => {
        return `html: ${htmlContent}) });`;
     });
     changed = true;
  }

  // Check if we have another variation
  // Like `html: \`...\` }) \n );`
  const badPatternStr = /html:\s*(`[\s\S]*?`|'[^']*'|"[^"]*")\s*\}\)\s*\r?\n\s*\);/g;
  if (badPatternStr.test(content)) {
     content = content.replace(badPatternStr, (match, str) => {
         return `html: ${str} });`;
     });
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed syntax in', file);
  }
}
