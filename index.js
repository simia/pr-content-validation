const core = require('@actions/core');
const github = require('@actions/github');
const { context, GitHub } = require('@actions/github/lib/utils');

try {
  const input = core.getInput('relese-notes-ignore-pattern')

  const client = new GitHub(core.getInput('token', { required: true }))
  
  console.log(github.context.payload)
  console.log(github.context.eventName)
  
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
      throw "Only push and pull_request is supported"
  }

  console.log(base)
  console.log(head)

  response = (async function(client){
    const response = await client.rest.repos.compareCommits({
      base,
      head,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    })
    return response
  })(client)

  const changedFiles = response.data.files

  console.log(changedFiles)

  const pullRequestBody = github.context.payload.pull_request?.body
  if (!pullRequestBody.includes(input)) {
    throw new Error(`Must put ${input} in PR description`)
  }
} catch (error) {
  core.setFailed(error.message);
}
