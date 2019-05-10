/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/no-extraneous-dependencies
const kill = require('kill-port')
const { spawn } = require('child_process')

const port = 8546

class Reporter {
  // Start a ganache instance
  async onRunStart() {
    console.log(`Starting Ganache on port ${port}`)
    this.ganacheProcess = spawn('./node_modules/.bin/ganache-cli', [
      '-i 5',
      `-p ${port}`
    ])

    this.ganacheProcess.on('close', code => {
      if (code !== 0) console.log(`Ganache process closed with code ${code}`)
      process.exit(code)
    })
    this.ganacheProcess.on('error', code => {
      console.error(`ERROR: Ganache exited with code ${code}`)
      process.exit(code)
    })
    this.ganacheProcess.on('exit', code => {
      if (code === 1) {
        console.error(`ERROR: Ganache exited with code ${code}`)
        console.error(
          `Is there already a process already running on port ${port}?`
        )
      }
      process.exit(code)
    })

    // Wait until ganache is running before starting test run
    await new Promise(resolve => {
      this.ganacheProcess.stdout.setEncoding('utf8')
      this.ganacheProcess.stdout.on('data', chunk => {
        if (chunk.includes('Listening')) {
          console.log(`Ganache running on port ${chunk.split(':')[1]}`)
          resolve()
        }
      })
    })
  }

  // Kill the ganache instance when run is complete
  async onRunComplete() {
    kill(port).catch(() =>
      console.error(`Failed to kill ganache on port ${port}`)
    )
  }
}

module.exports = Reporter
