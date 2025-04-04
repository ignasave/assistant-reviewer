import * as github from '@actions/github';
import { execSync } from 'child_process';
import * as core from '@actions/core';

export function getChangedFiles(): string[] {
  // Compara con main por defecto. Podés cambiar a develop u otro branch base si querés.
  const output = execSync('git diff --name-only origin/main').toString();
  return output
    .split('\n')
    .map((file) => file.trim())
    .filter((file) => file.endsWith('.tsx') || file.endsWith('.jsx'));
}

export async function postCommentToPR(body: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    core.setFailed('GITHUB_TOKEN not set');
    return;
  }

  const octokit = github.getOctokit(token);
  const context = github.context;

  const issueNumber = context.payload.pull_request?.number;

  if (!issueNumber) {
    core.warning('No pull request context found. Skipping comment.');
    return;
  }

  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    body,
  });
}