interface ExecuteJobOptions<T> {
  name: string

  items: T[]

  processor: (item: T) => Promise<void>
}

export async function executeJob<T>({
  name,
  items,
  processor,
}: ExecuteJobOptions<T>) {
  console.log(`Starting job: ${name}`)

  const results = await Promise.allSettled(items.map((item) => processor(item)))

  const successCount = results.filter(
    (result) => result.status === "fulfilled"
  ).length

  const failedResults = results.filter((result) => result.status === "rejected")

  failedResults.forEach((result) => {
    if (result.status === "rejected") {
      console.error(`[${name}]`, result.reason)
    }
  })

  console.log(
    `
Job Completed: ${name}

Success: ${successCount}
Failed: ${failedResults.length}
    `
  )

  return {
    success: successCount,
    failed: failedResults.length,
  }
}
