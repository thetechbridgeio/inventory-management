// This file would be used in a real application to set up a cron job
// for sending low stock emails automatically at 6 PM IST

/*
import { CronJob } from 'cron'
import { sendLowStockEmail } from './email'

// Schedule the job to run at 6 PM IST (12:30 PM UTC)
const job = new CronJob('0 30 12 * * *', async () => {
  try {
    console.log('Running scheduled low stock email job')
    await sendLowStockEmail()
    console.log('Low stock email sent successfully')
  } catch (error) {
    console.error('Error sending scheduled low stock email:', error)
  }
})

export function startScheduler() {
  job.start()
  console.log('Low stock email scheduler started')
}
*/

