import * as core from '@actions/core'
import * as github from '@actions/github'


async function run(): Promise<void> {
  try {
    const input: string = core.getInput('relese-notes-ignore-pattern')
    const pullRequestBody = github.context.payload.pull_request?.body
    if (!pullRequestBody.includes(input)){
        throw new Error('Must put ${ input } in PR description')
    }

  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()