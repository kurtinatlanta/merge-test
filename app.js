const shell = require('shelljs');

const results = shell.exec(`git branch -a --list 'release/*'`, { silent: true });
console.log(JSON.stringify(results));
console.log(typeof results.stdout);

if (typeof results.stdout === 'string') {
  let branches = results.split('\n');
  const current = branches.filter((branch) => branch.indexOf('*') === 0)[0];

  branches = branches.map((branch) => {
    return branch.replace('*', ' ').trim();
  });

  branches.forEach((branch) => console.log((current && current.indexOf(branch) > 0) ? '>>' + branch : '  ' + branch));
}
