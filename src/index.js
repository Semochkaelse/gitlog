const { execSync } = require('child_process');
const fs = require('fs');

const generateChangelog = () => {
  const rawCommits = execSync('git log --pretty=format:"%h %s %ad" --date=short').toString().split('\n');
  let changelog = "# Changelog\n\n";
  let currentVersion = "";
  let versionContents = {
    enhancements: [],
    fixes: [],
    closedIssues: [],
    mergedPRs: []
  };

  const addToVersionContent = (type, message) => {
    if (!versionContents[type].includes(message)) {
      versionContents[type].push(message);
    }
  };

  rawCommits.forEach(commit => {
    const [hash, message, date] = commit.split(' ');
    if (message.startsWith('v')) {
      if (currentVersion) {
        changelog += formatVersionContent(currentVersion, versionContents);
        versionContents = { enhancements: [], fixes: [], closedIssues: [], mergedPRs: [] };
      }
      currentVersion = message + " (" + date + ")";
    } else if (message.startsWith('feat')) {
      addToVersionContent('enhancements', message);
    } else if (message.startsWith('fix')) {
      addToVersionContent('fixes', message);
    } 
  });

  if (currentVersion) {
    changelog += formatVersionContent(currentVersion, versionContents);
  }

  fs.writeFileSync('CHANGELOG.md', changelog);
};

const formatVersionContent = (version, contents) => {
  let formatted = `## ${version}\n`;
  formatted += "Full Changelog\n\n";
  formatted += formatSection("Implemented enhancements:", contents.enhancements);
  formatted += formatSection("Fixed bugs:", contents.fixes);
  formatted += formatSection("Closed issues:", contents.closedIssues);
  formatted += formatSection("Merged pull requests:", contents.mergedPRs);
  return formatted;
};

const formatSection = (title, items) => {
  if (items.length === 0) return '';
  return `${title}\n${items.map(item => `- ${item}`).join('\n')}\n\n`;
};

generateChangelog();
