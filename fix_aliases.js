const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            replaceInDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.json')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Match "@/" that are at the start of a quote or after a space/quote
            // Simplest is to replace all "@/" but we should be careful.
            // In these files, "@/" is almost certainly the alias.
            const newContent = content.replace(/from "@\//g, 'from "@chaibuilder/')
                                      .replace(/import "@\//g, 'import "@chaibuilder/')
                                      .replace(/import\("@\//g, 'import("@chaibuilder/')
                                      .replace(/from '@\//g, "from '@chaibuilder/")
                                      .replace(/import '@\//g, "import '@chaibuilder/")
                                      .replace(/import\('@\//g, "import('@chaibuilder/");
            
            // Also handle index.css and others where it might be "@tailwind" or similar
            // But we specifically want the ones starting with @/
            
            // Re-run with more aggressive regex for other cases like in constants or themes if any
            // Actually, let's just do a blanket replace of any "@/" in strings?
            // " @/..." or "'@/..." or "`@/..."
            
            let finalContent = newContent.replace(/(["'`])@\//g, '$1@chaibuilder/');

            if (content !== finalContent) {
                fs.writeFileSync(filePath, finalContent);
                console.log(`Updated ${filePath}`);
            }
        }
    });
}

const chaiSrc = path.join(__dirname, 'chaibuilder', 'src');
if (fs.existsSync(chaiSrc)) {
    replaceInDir(chaiSrc);
    console.log('REPLACED ALL @/ WITH @chaibuilder/ IN chaibuilder/src');
} else {
    console.log('chaibuilder/src does not exist');
}
