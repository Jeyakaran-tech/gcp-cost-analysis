import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { mockGCPData } from '@/data/mock/gcp-data' // swap for real GCP API call later
import { AnalysisResult, GCPData } from '@/types'

const client = new Anthropic()

function buildPrompt(data: GCPData): string {
  return `You are a GCP cost optimisation expert. Analyse this Google Cloud Platform usage data and return actionable cost-saving recommendations.

PROJECT: ${data.projectName} (${data.projectId})
BILLING PERIOD: ${data.billingPeriod}
TOTAL SPEND: $${data.totalMonthlyCost} MTD / $${data.projectedMonthCost} projected

=== CLOUD RUN SERVICES ===
${data.cloudRun.map(s => `
Service: ${s.name} (${s.region})
  - Monthly cost: $${s.monthlyCost}
  - CPU allocation: ${s.cpuAllocation}
  - Min instances: ${s.minInstances}
  - Total revisions: ${s.totalRevisions}, Inactive: ${s.inactiveRevisions}
  - Avg CPU utilization: ${s.avgCpuUtilization}%
  - Requests/day: ${s.requestsPerDay}
`).join('')}

=== CLOUD STORAGE BUCKETS ===
${data.storage.map(b => `
Bucket: ${b.name} (${b.location})
  - Monthly cost: $${b.monthlyCost}
  - Storage class: ${b.storageClass}
  - Size: ${b.sizeGB} GB, Objects: ${b.objectCount}
  - Last accessed: ${b.lastAccessedDaysAgo} days ago
  - Lifecycle rules: ${b.hasLifecycleRules ? 'YES' : 'NONE'}
  - Read ops/month: ${b.readOperationsPerMonth}
`).join('')}

=== BIGQUERY DATASETS ===
${data.bigquery.map(d => `
Dataset: ${d.name} (${d.location})
  - Query cost: $${d.monthlyQueryCost}/mo, Storage: $${d.monthlyStorageCost}/mo
  - Tables:
  ${d.tables.map(t => `    - ${t.name}: ${t.sizeGB}GB, partitioned=${t.isPartitioned}, clustered=${t.isClustered}, scans ${t.avgDailyQueryScansGB}GB/day`).join('\n')}
`).join('')}

Respond ONLY with a valid JSON object (no markdown, no backticks) in this exact structure:
{
  "summary": "2-3 sentence executive summary of the cost situation",
  "totalPotentialSaving": <number in USD per month>,
  "recommendations": [
    {
      "id": "rec-001",
      "service": "Cloud Run" | "Cloud Storage" | "BigQuery",
      "priority": "critical" | "high" | "medium" | "low",
      "title": "Short action title",
      "description": "1-2 sentence explanation of the issue",
      "action": "Specific step to take",
      "estimatedMonthlySaving": <number>,
      "estimatedEffort": "low" | "medium" | "high",
      "resourceId": "the resource name/id"
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}

Rules:
- Order recommendations by estimatedMonthlySaving descending
- Be specific — reference actual resource names and numbers from the data
- Only include recommendations with clear, actionable steps
- Limit to maximum 8 recommendations
- estimatedMonthlySaving must be realistic based on actual costs in the data`
}

export async function POST() {
  try {
    // Phase 1: uses mock data
    // Phase 2: replace mockGCPData with real GCP API calls
    const gcpData = mockGCPData

    const prompt = buildPrompt(gcpData)

    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    })

    if (message.stop_reason === 'max_tokens') {
      throw new Error('Response truncated: max_tokens too low for this dataset')
    }

    const rawText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('')

    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, '').trim()
    const analysis: AnalysisResult = JSON.parse(clean)

    return NextResponse.json({
      gcpData,
      analysis,
    })
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
