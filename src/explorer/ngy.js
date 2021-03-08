import { SDK_NODE } from './globalConfig.js'

const { Nordic Energy } = require('@nordicenergy-js/core')
const { ChainID, ChainType } = require('@nordicenergy-js/utils')
const stakingAPIs = require('./stakingAPIs.json')

const shardID = 0

console.log({ SDK_NODE })
const ngySDK = new Nordic Energy(
  // rpc url
  SDK_NODE,
  {
    // chainType set to Nordic Energy
    chainType: ChainType.NordicEnergy,
    // chainType set to ngyLocal
    chainId:
      SDK_NODE !== 'https://api.s0.b.nordicenergy.io'
        ? ChainID.ngyMainnet
        : ChainID.ngyTestnet,
    shardID,
  }
)

const GAS_PRICE = new ngySDK.utils.Unit(1).asGwei().toHex() // 1Gwei

stakingAPIs.map(mod => {
  let modname = mod.name.split(' ')[0]
  let methodsObj = {}
  mod.methods.map(method => {
    let name = method.startsWith('ngy_') ? method.slice(4) : method
    methodsObj[name] = function() {
      return ngySDK.messenger
        .send(method, Array.from(arguments))
        .then(result => result.getRaw)
    }
  })
  ngySDK.blockchain[modname] = methodsObj
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function walletInit() {
  let retry = 0
  while (!window.nordicenergy && retry++ < 2) await sleep(1000)
  if (!window.nordicenergy) throw { message: 'Please install wallet' }
}

let address = null
async function login() {
  await walletInit()
  let account = await window.nordicenergy.getAccount()
  address = account.address
  return account
  //return {address:'net16xh2u9r4677egx4x3s0u966ave90l37hh7wq72'}
}

async function logout() {
  await walletInit()
  address = null
  return window.nordicenergy.forgetIdentity()
}

function delegate(from, to, amount) {
  let tx = ngySDK.stakings
    .delegate({
      delegatorAddress: from,
      validatorAddress: to,
      amount: new ngySDK.utils.Unit(amount).asWei().toHex(),
    })
    .setTxParams({
      gasPrice: GAS_PRICE,
      gasLimit: '0x0927c0',
      chainId: ngySDK.chainId,
    })
    .build()
  tx.setFromAddress(from)
  window.dtx = tx
  return tx
}

function withdrawReward(from) {
  let tx = ngySDK.stakings
    .collectRewards({
      delegatorAddress: from,
    })
    .setTxParams({
      gasPrice: GAS_PRICE,
      gasLimit: '0x0927c0',
      chainId: ngySDK.chainId,
    })
    .build()
  tx.setFromAddress(from)
  window.rtx = tx
  return tx
}

function undelegate(from, to, amount) {
  let tx = ngySDK.stakings
    .undelegate({
      delegatorAddress: from,
      validatorAddress: to,
      amount: new ngySDK.utils.Unit(amount).asWei().toHex(),
    })
    .setTxParams({
      gasPrice: GAS_PRICE,
      gasLimit: '0x0927c0',
      chainId: ngySDK.chainId,
    })
    .build()
  tx.setFromAddress(from)
  window.udtx = tx
  return tx
}

function transfer(from, to, amount) {
  let tx = ngySDK.transactions.newTx({
    from,
    //  token send to
    to,
    // amount to send
    value: new ngySDK.utils.Unit(amount).asWei().toHex(),
    // gas limit, you can use string
    gasLimit: '210000',
    // send token from shardID
    shardID: 0,
    // send token to toShardID
    toShardID: 0,
    // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to blockchain network.
    gasPrice: GAS_PRICE,
  })
  window.tx = tx
  return tx
}

function contract(
  abi,
  to,
  options = {
    from: address ? ngySDK.crypto.fromBech32(address) : '',
    gas: '210000',
    gasPrice: GAS_PRICE,
  }
) {
  let contract = ngySDK.contracts.createContract(abi, to, options)
  if (window.nordicenergy)
    contract.wallet.signTransaction = window.nordicenergy.signTransaction // or importPrivate
  let decodeParameters = (abi, hexdata) => {
    if (0 === abi.length) return []
    let params = contract.abiCoder.decodeParameters(abi, hexdata)
    params.length = abi.length
    /* for (let i = 0; i < abi.length; i++) {
      if (abi[i].type.startsWith('address'))
        params[i] = ngySDK.crypto.toBech32(params[i]);
    }*/
    return Array.from(params)
  }
  for (let name in contract.abiModel.getMethods()) {
    let method = contract.abiModel.getMethod(name)
    method.decodeInputs = hexData => decodeParameters(method.inputs, hexData)
    method.decodeOutputs = hexData => decodeParameters(method.outputs, hexData)
  }

  contract.decodeInput = hexData => {
    const no0x = hexData.startsWith('0x') ? hexData.slice(2) : hexData
    const sig = no0x.slice(0, 8).toLowerCase()
    const method = contract.abiModel.getMethod('0x' + sig)
    if (!method) {
      return false
    }

    const argv = method.decodeInputs('0x' + no0x.slice(8))
    const obj = contract.methods['0x' + sig](...argv)

    for (let i = 0; i < obj.params.length; i++) {
      if (obj.abiItem.inputs[i].type === 'address') {
        obj.params[i] = ngySDK.crypto.toBech32(obj.params[i])
      } else if (obj.abiItem.inputs[i].type === 'address[]') {
        obj.params[i] = obj.params[i].map(a => ngySDK.crypto.toBech32(a))
      }
    }

    obj.toString = () => {
      let str = obj.abiItem.name + '('
      for (let i = 0; i < obj.params.length; i++) {
        if (i > 0) str += ', '
        str += obj.params[i]
      }
      str += ')'
      return str
    }
    return obj
  }

  return contract
}

function contractDeploy(abi, code, _arguments) {
  let contractObj = contract(abi, '0x')
  return contractObj.deploy({
    data: code,
    arguments: _arguments,
  })
}

async function txSignSend(tx) {
  await window.nordicenergy.signTransaction(tx)
  let ret = await tx.sendTransaction()
  if (ret[1] != tx.id) throw { message: ret[1] }
  return tx
}

export default {
  ngySDK,
  login,
  logout,
  transfer,
  delegate,
  undelegate,
  withdrawReward,
  txSignSend,
  contract,
  contractDeploy,
}
