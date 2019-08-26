const shell = require('shelljs');

const sortBranches = (a, b) => {
  if (a.major < b.major) {
    // a is less than b
    return -1;
  }
  else if (a.major > b.major) {
    // a is greater than b
    return 1;
  }
  else if (a.major === b.major) {
    if (a.minor < b.minor) {
      // a is less than b
      return -1;
    }
    else if (a.minor > b.minor) {
      // a is greater than b
      return 1;
    }
    else if (a.minor === b.minor) {
      if (a.patch < b.patch) {
        // a is less than b
        return -1;
      }
      else if (a.patch > b.patch) {
        // a is greater than b
        return 1;
      }
      else if (a.patch === b.patch) {
        // a and b are equal
        return 0;
      }
    }
  }
};

const onlyDigits = /^\d+$/;

const results = shell.exec(`git branch -a --list 'release/*'`, { silent: true });
console.log(JSON.stringify(results));

if (typeof results.stdout === 'string') {
  let branches = results.split('\n');
  const current = branches.filter((branch) => branch.indexOf('*') === 0)[0].replace('*', ' ').trim();

  branches = branches
    .filter((branch) => !!branch)
    .map((branch) => {
      const branchParts = branch.split('/');
      const [ major, minor, patch ] = branchParts[1].split('.');

      return {
        name: branch.replace('*', ' ').trim(),
        major: onlyDigits.test(major) ? parseInt(major, 10) : major,
        minor: onlyDigits.test(minor) ? parseInt(minor, 10) : minor,
        patch: onlyDigits.test(patch) ? parseInt(patch, 10) : patch
      };
    });

  branches = branches.sort(sortBranches);

  branches.forEach((branch) => console.log(current === branch.name ? branch.name + ' <--' : branch.name));

  const currentIndex = branches.map((branch, index) => branch.name === current ? index : undefined).filter((branch) => !isNaN(branch))[0];
  const previous = Math.max(0, currentIndex - 1);
  const next = Math.min(branches.length, currentIndex + 1);

  console.log(`Branch to merge from: ${'remotes/origin/' + branches[previous].name}`);
  console.log(`Previous branch: ${JSON.stringify(branches[previous])}`);
  console.log(`Next branch: ${JSON.stringify(branches[next])}`);

  if (previous < currentIndex) {
    const previousBranch = 'remotes/origin/' + branches[previous].name;
    const mergeResults = shell.exec(`git merge -Xours -m 'Automerge from ${previousBranch}' --log ${previousBranch}`, { silent: true });
    console.log(mergeResults);

    if (mergeResults.code) {
      console.error(mergeResults.stdout);
      return 128;
    }
    else {
      if (mergeResults.stdout === 'Already up to date.\n') {
        console.log('No merge');
      }
      else {
        console.log('Code merged. Pushing to origin.');
        shell.exec('git push origin');
      }
    }
  }
}
