const core = require('@actions/core');
const github = require('@actions/github');

try {
  const input = core.getInput('relese-notes-ignore-pattern')
    const pullRequestBody = github.context.payload.pull_request?.body
    if (!pullRequestBody.includes(input)){
        throw new Error('Must put ${ input } in PR description')
    }
} catch (error) {
  core.setFailed(error.message);
}
