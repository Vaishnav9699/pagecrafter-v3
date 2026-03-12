const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            replaceInDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            const newContent = content.replace(/import.meta.env/g, 'process.env');
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent);
                console.log(`Updated env in ${filePath}`);
            }
        }
    });
}

const chaiSrc = path.join(__dirname, 'chaibuilder', 'src');
if (fs.existsSync(chaiSrc)) {
    replaceInDir(chaiSrc);
    console.log('REPLACED import.meta.env WITH process.env IN chaibuilder/src');
}
