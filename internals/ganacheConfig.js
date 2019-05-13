const port = 8546
const accounts = [
  '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
  '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0'
]
const args = ['-i 5', `-p ${port}`, '-a 2', '--deterministic']
const safeMathAddress = '0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab'

module.exports = {
  args,
  port,
  accounts,
  safeMathAddress
}
