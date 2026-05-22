// GCP Service types
export interface CloudRunService {
  id: string
  name: string
  region: string
  currentRevision: string
  totalRevisions: number
  inactiveRevisions: number
  cpuAllocation: 'always' | 'request-only'
  minInstances: number
  maxInstances: number
  monthlyCost: number
  requestsPerDay: number
  avgCpuUtilization: number
}

export interface StorageBucket {
  id: string
  name: string
  location: string
  storageClass: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE'
  sizeGB: number
  objectCount: number
  lastAccessedDaysAgo: number
  monthlyCost: number
  hasLifecycleRules: boolean
  readOperationsPerMonth: number
}

export interface BigQueryDataset {
  id: string
  name: string
  location: string
  tables: BigQueryTable[]
  monthlyQueryCost: number
  monthlyStorageCost: number
}

export interface BigQueryTable {
  id: string
  name: string
  sizeGB: number
  isPartitioned: boolean
  isClustered: boolean
  lastModifiedDaysAgo: number
  avgDailyQueryScansGB: number
}

export interface GCPData {
  projectId: string
  projectName: string
  billingPeriod: string
  totalMonthlyCost: number
  projectedMonthCost: number
  cloudRun: CloudRunService[]
  storage: StorageBucket[]
  bigquery: BigQueryDataset[]
  lastRefreshed: string
}

// Recommendation types
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type ServiceType = 'Cloud Run' | 'Cloud Storage' | 'BigQuery'

export interface Recommendation {
  id: string
  service: ServiceType
  priority: Priority
  title: string
  description: string
  action: string
  estimatedMonthlySaving: number
  estimatedEffort: 'low' | 'medium' | 'high'
  resourceId: string
}

export interface AnalysisResult {
  summary: string
  totalPotentialSaving: number
  recommendations: Recommendation[]
  generatedAt: string
}

// Chart types
export interface MonthlySpend {
  month: string
  cloudRun: number
  storage: number
  bigquery: number
  total: number
}
