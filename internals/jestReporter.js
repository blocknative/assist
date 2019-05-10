/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/no-extraneous-dependencies
const kill = require('kill-port')
const { spawn } = require('child_process')

const port = 8546

class Reporter {
  // Start a ganache instance
  async onRunStart() {
    await kill(port)
    this.ganacheProcess = spawn('./node_modules/.bin/ganache-cli', [
      '-i 5',
      `-p ${port}`
    ])

    // Wait until ganache is running before starting test run
    await new Promise(resolve => {
      this.ganacheProcess.stdout.setEncoding('utf8')
      this.ganacheProcess.stdout.on('data', chunk => {
        if (chunk.includes('Listening')) {
          console.log(`Ganache running on port ${chunk.split(':')[1]}`)
          resolve()
        }
      })
      this.ganacheProcess.on('close', () => {
        process.exit(0)
      })
      this.ganacheProcess.on('error', e => {
        console.error(`Ganache error: ${e}`)
        process.exit(1)
      })
    })
  }

  // Kill the ganache instance when run is complete
  async onRunComplete() {
    kill(port).catch(() =>
      console.log(`Failed to kill ganache on port ${port}`)
    )
  }
}

module.exports = Reporter
