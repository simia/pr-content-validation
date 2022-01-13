const core = require('@actions/core');
const github = require('@actions/github');
const { context, GitHub } = require('@actions/github/lib/utils');

async function run() {
  try {
    const input = core.getInput('relese-notes-ignore-pattern')
    const releaseNotesFilename = core.getInput('release-notes-file')
    const client = new GitHub({ auth: core.getInput('token', { required: true }) })
    
    const request = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number
    }
    console.log(`Getting PR #${request.pull_number} from ${request.owner}/${request.repo}`)

      const result = await client.rest.pulls.get(request)

    client.rest.checks.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      name: "Check Created by API",
      head_sha: result.head.sha,
      status: "completed",
      conclusion: "success",
      output: {
        title: "Check Created by API",
        summary: `dupa`
      }
    })
    //console.log(result)

    // console.log(context.payload.issue?.pull_request)
    // console.log(context.payload.pull_request)

    switch (context.eventName) {
      case 'pull_request':
      case 'pull_request_review_comment':
        base = context.payload.pull_request?.base?.sha
        head = context.payload.pull_request?.head?.sha
        break
      case 'issue':
        base = context.payload.issue.pull_request?.base?.sha
        head = context.payload.issue.pull_request?.head?.sha
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
    
    console.log(context.payload.comment)
    const pullRequestBody = github.context.payload.pull_request?.body
    if (!pullRequestBody.includes(input)) {
      throw new Error(`Must put \"${input}\" in PR description or update release notes file \"${releaseNotesFilename}\"`)
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()