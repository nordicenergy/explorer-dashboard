import { AbiCoder } from '@nordicenergy-js/contract'
import { SDK_NODE } from '../explorer/globalConfig.js'
import * as ngy from '../explorer/ngy'
import {
  isNRC20Deploy,
  getTxNRC20Method,
  getNRC20ContractProps,
} from './NRC20Utils'
import { fetchSuggestions } from './suggestSignature'
import { displayAmount } from '@/utils/displayAmount'

const { ngySDK } = ngy.default

const isMainnet = () => SDK_NODE !== 'https://api.s0.b.nordicenergy.io'
const url = isMainnet()
  ? 'https://api.s0.t.nordicenergy.io'
  : 'https://api.s0.b.nordicenergy.io'

export async function traceTx(txhash) {
  const body = `{
        "jsonrpc":"2.0",
        "id":0,
        "method":"debug_traceTransaction",
        "params":["${txhash}", {"tracer": "callTracer"}]
    }`
  const msg = await fetch(url, {
    headers: { 'content-type': 'application/json' },
    body,
    method: 'POST',
  })
  const json = await msg.json()

  console.log({ trace: JSON.parse(JSON.stringify(json.result)) })
  return json
}

const decimals = NRC20Props => param => {
  if (param.name === 'value') {
    param.value = displayAmount(param.value, NRC20Props.decimals)
  }

  return param
}

export const traverseCallInfo = async callHead => {
  const res = []

  const buildView = callWithInfo => {
    const type = callWithInfo.traceCall.type
    const displayDecimals = decimals(callWithInfo.NRC20Props)

    let displayString = ''
    let displayType = type
    if (type === 'CALL' || type === 'STATICCALL') {
      if (callWithInfo.NRC20Method && callWithInfo.NRC20Props) {
        displayType = 'NRC20 ' + type
        const { method, inputs, outputs } = callWithInfo.NRC20Method
        const isVoid = callWithInfo.traceCall.output === '0x'

        const inputsString = inputs
          .map(displayDecimals)
          .map(a => `${a.name}: ${a.value}`)
          .join(', ')

        const outputsString = outputs
          .map(displayDecimals)
          .map(a => `${a.name}: ${a.value}`)
          .join(', ')

        displayString = `${method.name}(${inputsString}) → ${outputsString} ${
          isVoid ? 'void' : ''
        }`
      } else if (callWithInfo.suggestions && callWithInfo.suggestions.length) {
        const buildSuggestion = s => {
          const inputsString = s.inputs
            ? s.inputs.map(a => `${a.type}: ${a.value}`).join(', ')
            : ''
          // todo outputs not provided
          return `${s.method.name}(${inputsString})`
        }

        displayString =
          'Suggested method ' +
          callWithInfo.suggestions.map(buildSuggestion).join(' ')
      }
    } else if (type === 'CREATE' || type === 'CREATE2') {
      displayType = type
      if (callWithInfo.isNRC20Deploy) {
        displayString = 'NRC20 deployment'
      } else {
        displayString = 'Contract deployment'
      }
    }

    return { displayString, displayType, callWithInfo }
  }

  const traverse = async call => {
    if (!call) {
      return
    }
    // ugly but keep order
    call.info = buildView(await getCallInfo(call))
    if (call.calls) {
      await Promise.all(call.calls.map((c, i) => traverse(c)))
    }
  }
  await traverse(callHead)

  const flatMap = call => {
    res.push(call)
    call.calls && call.calls.map(flatMap)
  }
  flatMap(callHead)

  return res
    .map(o => ({ ...o.info }))
    .filter(
      r =>
        r.callWithInfo.traceCall.input &&
        r.callWithInfo.traceCall.input !== '0x'
    )
}

const getCallInfo = async call => {
  if (call.type === 'CALL' || call.type === 'STATICCALL') {
    const NRC20Props = await getNRC20ContractProps(call.to)
    const NRC20Method = getTxNRC20Method(call)
    const suggestions =
      NRC20Method || (call.input && call.input === '0x')
        ? null
        : await fetchSuggestions(call.input)

    return {
      from: ngySDK.crypto.toBech32(call.from),
      to: ngySDK.crypto.toBech32(call.to),
      traceCall: call,
      NRC20Props,
      suggestions,
      NRC20Method,
    }
  }

  return {
    from: ngySDK.crypto.toBech32(call.from),
    to: ngySDK.crypto.toBech32(call.to),
    traceCall: call,
    isNRC20Deploy: isNRC20Deploy(call),
  }
}

export const getFailureMessages = call => {
  const res = []
  const traverse = call => {
    if (call.error === 'execution reverted') {
      const message = revertMsg(call.output)

      if (message) {
        res.push(message)
      }
    }

    call.calls && call.calls.forEach(traverse)
  }

  traverse(call)
  return res
}

export function revertMsg(output) {
  const coder = AbiCoder()
  if (output === undefined) return ''
  if (!output.startsWith('0x08c379a0')) return output
  output = `0x${output.slice(10)}`
  return coder.decodeParameter('string', output)
}

export function showCall(call, depth = 0) {
  const revert =
    call.error === 'execution reverted' ? revertMsg(call.output) : ''
  const fmtmsg = `${' '.repeat(depth * 4)} ${call.type} from:${call.from} to:${
    call.to
  } value:${call.value}, input:${call.input} ${revert}`
  console.log(fmtmsg)
  if (call.calls) call.calls.forEach(call => showCall(call, depth + 1))
}
