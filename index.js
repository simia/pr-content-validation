const core = require('@actions/core');
const github = require('@actions/github');
const { context } = require('@actions/github/lib/utils');

try {
  const input = core.getInput('relese-notes-ignore-pattern')
  
  const client = new GitHub(core.getInput('token', {required: true}))
  
  console.log(github.context.payload)
  console.log(context.eventName)

  switch (context.eventName) {
    case 'pull_request':
      base = context.payload.pull_request?.base?.sha
      head = context.payload.pull_request?.head?.sha
      break
    case 'push':
      base = context.payload.before
      head = context.payload.after
      break
    default:
      core.setFailed(
        `This action only supports pull requests and pushes, ${context.eventName} events are not supported. ` +
          "Please submit an issue on this action's GitHub repo if you believe this in correct."
      )
  }

  console.log(base)
  console.log(head)

  const response = await client.repos.compareCommits({
    base,
    head,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo
  })

  const changedFiles = response.data.files

  console.log(changedFiles)

  const pullRequestBody = github.context.payload.pull_request?.body
    if (!pullRequestBody.includes(input)){
        throw new Error(`Must put ${input} in PR description`)
    }
} catch (error) {
  core.setFailed(error.message);
}
