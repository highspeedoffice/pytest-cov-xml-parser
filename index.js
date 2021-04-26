const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const xml2js = require('xml2js');
var escape = require('markdown-escape');

function parseIt(file) {
  var parser = new xml2js.Parser();
  var data = fs.readFileSync(file);
  let parsed = parser.parseString(data);
  if (!parsed) {
    throw{message: 'File is not XML'}
  }
  let newMessage = '### :white_check_mark: Result of Pytest Coverage\n'
  newMessage += '| Name | Lines | Coverage (%) |\n| :--- | ----: | ----: |\n'
  parser.resultObject.coverage.packages[0].package.forEach((p) => {
    p.classes[0].class.forEach((c) => {
      if(c['$']['line-rate'] < 1) {
        newMessage += `| ${escape(c['$'].filename)} | ${c.lines[0].line.length} | ${Math.round(parseFloat(c['$']['line-rate']) * 100)} |\n`;
      }
    });
  });
  return newMessage;
}

async function run() {
  if (github.context.eventName !== 'pull_request') {
    core.info('Comment only will be created on pull requests!')
    return;
  }
  try {
    const file = core.getInput('file');
    const githubToken = core.getInput('token');
    if (!fs.existsSync(file)) {
      throw {message: `File ${file} does not exist`};
    }
    let msg = parseIt(file);
    const context = github.context
    const pullRequestNumber = context.payload.pull_request ? context.payload.pull_request.number : 0

    const octokit = github.getOctokit(githubToken)

    // Now decide if we should issue a new comment or edit an old one
    const {data: comments} = await octokit.issues.listComments({
      ...context.repo,
      issue_number: pullRequestNumber
    })

    const comment = comments.find((comment) => {
      return (
        comment.user.login === 'github-actions[bot]' &&
        comment.body.startsWith(
          '### :white_check_mark: Result of Pytest Coverage\n'
        )
      )
    })

    if (comment) {
      await octokit.issues.updateComment({
        ...context.repo,
        comment_id: comment.id,
        body: msg
      })
    } else {
      await octokit.issues.createComment({
        ...context.repo,
        issue_number: pullRequestNumber,
        body: msg
      })
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run();
