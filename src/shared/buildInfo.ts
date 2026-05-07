import { errorMessage } from './result';

export interface BuildInfo {
  version: string;
  compiledCommit: string;
  publishedCommit: string;
  repoUrl: string;
  paypalUrl: string;
}

const commitApiUrl =
  'https://api.github.com/repos/baditaflorin/trust-no-one-anonymizer/commits/main';

interface GitHubCommitResponse {
  sha?: string;
}

export async function resolveBuildInfo(): Promise<BuildInfo> {
  let publishedCommit = __APP_COMMIT__;

  try {
    const response = await fetch(commitApiUrl, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (response.ok) {
      const json = (await response.json()) as GitHubCommitResponse;
      if (json.sha) publishedCommit = json.sha.slice(0, 12);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info(`Commit metadata fallback: ${errorMessage(error)}`);
    }
  }

  return {
    version: __APP_VERSION__,
    compiledCommit: __APP_COMMIT__,
    publishedCommit,
    repoUrl: __REPO_URL__,
    paypalUrl: __PAYPAL_URL__,
  };
}
