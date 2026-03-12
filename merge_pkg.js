const fs = require('fs');

const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const chaiPkg = JSON.parse(fs.readFileSync('chaibuilder/package.json', 'utf8'));

const merge = (target, source) => {
  for (const [key, value] of Object.entries(source)) {
    if (!target[key]) {
      target[key] = value;
    } else {
      // Compare versions? For now just take source if it's newer or different
      // Simple heuristic: if it's in chai but already in root, keep root's if it's fine
      // But chai might need its specific version.
      // Let's just overwrite for now as chai is "best for editor"
      target[key] = value;
    }
  }
};

merge(rootPkg.dependencies, chaiPkg.dependencies);
if (chaiPkg.devDependencies) {
    if (!rootPkg.devDependencies) rootPkg.devDependencies = {};
    merge(rootPkg.devDependencies, chaiPkg.devDependencies);
}

fs.writeFileSync('package.json', JSON.stringify(rootPkg, null, 2));
console.log('Merged package.json');
