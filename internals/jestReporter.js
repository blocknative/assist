/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const kill = require('kill-port')
const Web3 = require('web3')
const { spawn } = require('child_process')
const convertLib = require('../src/__tests__/res/ConvertLib.json')
const { args, port, accounts } = require('./ganacheConfig.js')

class Reporter {
  constructor(globalConfig) {
    this._globalConfig = globalConfig
  }

  // checks if jest was run with --watch or --watchall
  watching() {
    return this._globalConfig.watch || this._globalConfig.watchAll
  }

  // start a ganache instance before test run starts
  async onRunStart() {
    console.log(`Starting Ganache on port ${port}`)
    await kill(port)
    this.ganacheProcess = spawn('./node_modules/.bin/ganache-cli', args)

    this.ganacheProcess.on('close', code => {
      if (code !== 0 && code !== 137) {
        console.log(`Ganache process closed with code ${code}`)
        process.exit(code)
      }
      !this.watching() && process.exit(code)
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
        process.exit(code)
      }
      !this.watching() && process.exit(code)
    })

    // Wait until ganache is running
    await new Promise(resolve => {
      this.ganacheProcess.stdout.setEncoding('utf8')
      this.ganacheProcess.stdout.on('data', chunk => {
        if (chunk.includes('Listening')) {
          console.log(`Ganache running on port ${chunk.split(':')[1]}`)
          resolve()
        }
      })
    })

    // Deploy a contract for truffle testing
    this.web3 = new Web3(`ws://localhost:${port}`)
    const convertLibWeb3 = await new this.web3.eth.Contract(convertLib.abi)
    convertLibWeb3
      .deploy({ data: convertLib.bytecode })
      .send({ from: accounts[0], gasLimit: 1500000 })

    // Ganache setup done, tests will now execute
  }

  // On completion kill the ganache instance and exit the test run
  async onRunComplete() {
    this.web3.currentProvider.connection.close()
    kill(port)
      .then(() => !this.watching() && process.exit(0))
      .catch(() => console.error(`Failed to kill ganache on port ${port}`))
  }
}

module.exports = Reporter
