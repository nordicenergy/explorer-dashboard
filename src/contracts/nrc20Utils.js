import * as ngy from '../explorer/ngy'

const { ngySDK } = ngy.default
import NRC20_ABI from '../explorer/NRC20_ABI.json'

const contract = ngySDK.contracts.createContract(NRC20_ABI)
const contractWithHelpers = ngy.default.contract(NRC20_ABI)
const options = { gasPrice: 1000000000, gasLimit: 6721900 }

const nrc20Events = ['Transfer', 'Approval']
const eventsSignatures = nrc20Events.map(
    e => contract.abiModel.getEvent(e).signature
)
const nrc20Methods = [
    'balanceOf',
    'totalSupply',
    'transfer',
    'name',
    'symbol',
    'decimals',
]
const methodsSignatures = nrc20Methods.map(
    e => contract.abiModel.getMethod(e).signature
)
const signatures = [...eventsSignatures, ...methodsSignatures].map(e =>
    e.startsWith('0x') ? e.slice(2) : e
)

const hasAllSignatures = hexData =>
    signatures.reduce((acc, s) => hexData.indexOf(s) !== -1 && acc, true)

export const isContractTx = tx => {
    return tx.input && tx.input !== '0x'
}

export const isNrc20Deploy = tx => {
    if (!isContractTx(tx)) {
        return false
    }

    return hasAllSignatures(tx.input)
}

export const getTxNrc20Method = tx => {
    const hexData = tx.input
    const hexDataOutput = tx.output

    if (!hexData) {
        return false
    }

    const no0x = hexData.startsWith('0x') ? hexData.slice(2) : hexData
    const sig = no0x.slice(0, 8).toLowerCase()
    const method = contractWithHelpers.abiModel.getMethod('0x' + sig)

    if (!method) {
        return false
    }

    const inputValues = contractWithHelpers.decodeInput(hexData)
    let outputValues = []
    try {
        outputValues = contractWithHelpers.abiCoder.decodeParameters(
            method.outputs,
            hexDataOutput
        )
    } catch (e) {
        // console.log('err', { methodOuts: method.outputs, hexDataOutput, tx })
    }

    const inputs = method.inputs
        .filter((o, i) => inputValues.params[i])
        .map((o, i) => ({
            name: o.name,
            type: o.type,
            value: inputValues.params[i],
        }))
    const outputs = method.outputs
        .filter((o, i) => outputValues[i])
        .map((o, i) => ({
            name: o.name,
            type: o.type,
            value: outputValues[i],
        }))

    return { method, inputs, outputs }
}

export const getNrc20ContractProps = async contractAddress => {
    try {
        const contract = ngySDK.contracts.createContract(NRC20_ABI, contractAddress)

        const name = await contract.methods.name().call(options)
        const decimalsHex = await contract.methods.decimals().call(options)
        const decimals = parseInt(decimalsHex, 16)

        const totalSupply = (
                await contract.methods.totalSupply().call(options)
            ).toString()
            /*const symbol = await contract.methods.symbol().call(options)*/

        if (!decimals || !totalSupply || !name) {
            return null
        }

        return { decimals, totalSupply, name }
    } catch (err) {
        return null
    }
}