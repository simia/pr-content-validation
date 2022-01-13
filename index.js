const core = require('@actions/core');
const github = require('@actions/github');
const { context, GitHub } = require('@actions/github/lib/utils');

async function run() {
  try {
    const input = core.getInput('relese-notes-ignore-pattern')
    const releaseNotesFilename = core.getInput('release-notes-file')
    const client = new GitHub({ auth: core.getInput('token', { required: true }) })
    
    switch (context.eventName) {
      case 'pull_request':
      case 'pull_request_review_comment':
        base = context.payload.pull_request?.base?.sha
        head = context.payload.pull_request?.head?.sha
        break
      default:
        throw "Only push and pull_request is supported"
    }

    const response = await client.rest.repos.compareCommits({
      base,
      head,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    })

    const changedFiles = response.data.files
    const foundReleaseNotes = changedFiles.find(file => file.filename == releaseNotesFilename)
    if (foundReleaseNotes) {
      return
    }
    
    const pullRequestBody = github.context.payload.pull_request?.body
    if (!pullRequestBody.includes(input)) {
      throw new Error(`Must put \"${input}\" in PR description or update release notes file \"${releaseNotesFilename}\"`)
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()