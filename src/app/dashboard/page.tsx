import { Suspense } from 'react'
import DashboardClient from '@/components/DashboardClient'
import { mockGCPData, mockMonthlyTrend } from '@/data/mock/gcp-data'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        initialGcpData={mockGCPData}
        initialTrend={mockMonthlyTrend}
      />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-[#4ade80] font-mono text-sm animate-pulse">
        Initialising cost monitor...
      </div>
    </div>
  )
}
