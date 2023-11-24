const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

const generateChangelog = () => {
  const rawCommits = execSync('git log --pretty=format:"%s"').toString().split('\n');
  let changelogPath = path.join(__dirname, 'CHANGELOG.md');
  let changelogContent = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath).toString() : '';

  let currentVersion = packageJson.version.split('.').map(Number);
  let versionString = `v${currentVersion.join('.')}`;
  let versionHeader = `## ${versionString}\n\n`;

  if (!changelogContent.includes(versionHeader)) {
    changelogContent = versionHeader + changelogContent;
  }

  rawCommits.forEach(commit => {
    let [issueNumber, message] = commit.split(' ', 2);
    let commitType = message.split(' ').pop();
    let jiraLink = `https://jira.action-media.ru/browse/${issueNumber}`;

    if (['major', 'minor', 'patch'].includes(commitType)) {
      let index = ['major', 'minor', 'patch'].indexOf(commitType);
      currentVersion[index]++;
      for (let i = index + 1; i < currentVersion.length; i++) {
        currentVersion[i] = 0;
      }
      versionString = `v${currentVersion.join('.')}`;
      versionHeader = `## ${versionString}\n\n`;

      if (!changelogContent.includes(versionHeader)) {
        changelogContent = versionHeader + changelogContent;
      }
    }

    if (changelogContent.includes(versionHeader)) {
      let insertPoint = changelogContent.indexOf(versionHeader) + versionHeader.length;
      let commitEntry = `- ${message} ([${issueNumber}](${jiraLink}))\n`;
      changelogContent = changelogContent.slice(0, insertPoint) + commitEntry + changelogContent.slice(insertPoint);
    }
  });

  fs.writeFileSync(changelogPath, changelogContent);
};

generateChangelog();
