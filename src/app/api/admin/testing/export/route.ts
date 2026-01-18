import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'ctlilley19/K9-ProTrain';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report } = body;

    if (!report) {
      return NextResponse.json({ error: 'No report data' }, { status: 400 });
    }

    // Format the report as markdown for Claude Code to read
    const markdown = formatReportAsMarkdown(report);

    // If GitHub token is configured, commit to repo
    if (GITHUB_TOKEN) {
      try {
        await commitToGitHub(markdown, report);
        return NextResponse.json({
          success: true,
          method: 'github',
          message: 'Feedback committed to GitHub! Claude Code can now read feedback/TESTING-FEEDBACK-LATEST.md',
        });
      } catch (ghError) {
        console.error('GitHub commit failed:', ghError);
        // Fall back to download
      }
    }

    // Fallback: Return as downloadable file
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="TESTING-FEEDBACK-LATEST.md"',
      },
    });
  } catch (error) {
    console.error('Error exporting test report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

async function commitToGitHub(markdown: string, report: unknown) {
  const filePath = 'feedback/TESTING-FEEDBACK-LATEST.md';
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

  // Get current file SHA (needed for updates)
  let sha: string | undefined;
  try {
    const getResponse = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }
  } catch {
    // File doesn't exist yet, that's fine
  }

  // Commit the file
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update testing feedback - ${new Date().toISOString()}`,
      content: Buffer.from(markdown).toString('base64'),
      branch: GITHUB_BRANCH,
      ...(sha && { sha }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${error}`);
  }

  // Also commit the JSON version
  const jsonPath = 'feedback/TESTING-FEEDBACK-LATEST.json';
  const jsonApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${jsonPath}`;

  let jsonSha: string | undefined;
  try {
    const getJsonResponse = await fetch(`${jsonApiUrl}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (getJsonResponse.ok) {
      const data = await getJsonResponse.json();
      jsonSha = data.sha;
    }
  } catch {
    // File doesn't exist
  }

  await fetch(jsonApiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Update testing feedback JSON - ${new Date().toISOString()}`,
      content: Buffer.from(JSON.stringify(report, null, 2)).toString('base64'),
      branch: GITHUB_BRANCH,
      ...(jsonSha && { sha: jsonSha }),
    }),
  });
}

function formatReportAsMarkdown(report: {
  generated_at: string;
  summary: {
    total: number;
    not_tested: number;
    testing: number;
    passed: number;
    failed: number;
    blocked: number;
  };
  features: Array<{
    id: string;
    name: string;
    path: string;
    category: string;
    status: string;
    notes: string | null;
    tested_by: string | null;
    tested_at: string | null;
    tab?: string;
    section?: string;
    component?: string;
    file?: string;
    description?: string;
  }>;
}): string {
  const lines: string[] = [];

  lines.push('# K9 ProTrain Testing Feedback');
  lines.push('');
  lines.push(`> Generated: ${report.generated_at}`);
  lines.push('> This file is auto-generated from the Admin Testing Portal');
  lines.push('> Claude Code should read this file and execute the requested changes');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total Features:** ${report.summary.total}`);
  lines.push(`- **Passed:** ${report.summary.passed}`);
  lines.push(`- **Failed:** ${report.summary.failed}`);
  lines.push(`- **Blocked:** ${report.summary.blocked}`);
  lines.push(`- **Testing:** ${report.summary.testing}`);
  lines.push(`- **Not Tested:** ${report.summary.not_tested}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Action Items - Failed and Blocked features with notes
  const actionItems = report.features.filter(
    f => (f.status === 'failed' || f.status === 'blocked') && f.notes
  );

  if (actionItems.length > 0) {
    lines.push('## ACTION REQUIRED - Issues to Fix');
    lines.push('');
    lines.push('These items have failed testing and include notes describing what needs to be fixed:');
    lines.push('');

    for (const item of actionItems) {
      lines.push(`### ${item.name}`);
      lines.push('');
      lines.push(`- **Status:** ${item.status.toUpperCase()}`);
      lines.push(`- **Page Path:** \`${item.path}\``);
      if (item.file) {
        lines.push(`- **Source File:** \`${item.file}\``);
      }
      if (item.tab) {
        lines.push(`- **Tab:** ${item.tab}`);
      }
      if (item.section) {
        lines.push(`- **Section/Area:** ${item.section}`);
      }
      if (item.component) {
        lines.push(`- **Component:** \`${item.component}\``);
      }
      lines.push(`- **Category:** ${item.category}`);
      if (item.description) {
        lines.push(`- **Description:** ${item.description}`);
      }
      if (item.tested_at) {
        lines.push(`- **Tested:** ${item.tested_at}`);
      }
      lines.push('');
      lines.push('**What to Fix:**');
      lines.push('');
      lines.push(item.notes || '');
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // Enhancement Requests - Features with notes that passed but have suggestions
  const enhancements = report.features.filter(
    f => f.status === 'passed' && f.notes
  );

  if (enhancements.length > 0) {
    lines.push('## ENHANCEMENTS - Suggestions for Improvement');
    lines.push('');
    lines.push('These items passed but have suggestions for improvement:');
    lines.push('');

    for (const item of enhancements) {
      lines.push(`### ${item.name}`);
      lines.push('');
      lines.push(`- **Page Path:** \`${item.path}\``);
      if (item.file) {
        lines.push(`- **Source File:** \`${item.file}\``);
      }
      if (item.tab) {
        lines.push(`- **Tab:** ${item.tab}`);
      }
      if (item.section) {
        lines.push(`- **Section/Area:** ${item.section}`);
      }
      if (item.component) {
        lines.push(`- **Component:** \`${item.component}\``);
      }
      lines.push(`- **Category:** ${item.category}`);
      lines.push('');
      lines.push('**Enhancement:**');
      lines.push('');
      lines.push(item.notes || '');
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // All Features by Category
  lines.push('## Full Feature List');
  lines.push('');

  // Group by category
  const byCategory: Record<string, typeof report.features> = {};
  for (const feature of report.features) {
    if (!byCategory[feature.category]) {
      byCategory[feature.category] = [];
    }
    byCategory[feature.category].push(feature);
  }

  for (const [category, features] of Object.entries(byCategory)) {
    lines.push(`### ${category}`);
    lines.push('');
    lines.push('| Feature | Path | Status | Notes |');
    lines.push('|---------|------|--------|-------|');

    for (const f of features) {
      const status = getStatusEmoji(f.status);
      const notes = f.notes ? f.notes.substring(0, 50) + (f.notes.length > 50 ? '...' : '') : '-';
      lines.push(`| ${f.name} | \`${f.path}\` | ${status} | ${notes.replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'passed':
      return '✅ Passed';
    case 'failed':
      return '❌ Failed';
    case 'blocked':
      return '⚠️ Blocked';
    case 'testing':
      return '🔄 Testing';
    default:
      return '⭕ Not Tested';
  }
}
