import Vue from 'vue'
import ngy from './ngy.js'
import axios from 'axios'
import {
    BASE_NRC20URL,
    NRC20_HOLDERURL,
    NET_HOLDERURL,
    EXPLORER_BACKEND_URL,
} from './globalConfig.js'
import service from './service'

window.ngy = ngy
const NRC20_ABI = require('./NRC20_ABI.json')
const NRC721_ABI = require('./nrc721ABI.json')

const NRC20_LIST = []

const Limit = 10

function postprocessBlocks(items) {
    return items
        .sort((a, b) => (Number(a.timestamp) > Number(b.timestamp) ? -1 : 1))
        .slice(0, Limit)
}

function postprocessTxs(items) {
    return items
        .sort((a, b) => (Number(a.timestamp) > Number(b.timestamp) ? -1 : 1))
        .slice(0, Limit)
}

async function nrc20TxsFilter(items, isNrc20, exist) {
    let retTxs = []
    let txs = items.sort((a, b) =>
        Number(a.timestamp) > Number(b.timestamp) ? -1 : 1
    )
    for (let i in txs) {
        let tx = txs[i]
        if (isNrc20(tx.to.bech32) && !exist(tx.id)) {
            if (tx.input == undefined)
                tx.input = (
                    await ngy.ngySDK.blockchain.Transaction.getTransactionByHash(tx.id)
                ).result.input
            retTxs.push(tx)
        }
    }
    return retTxs.slice(0, Limit)
}

function getTotalBlockLatency(latencies) {
    latencies = latencies.filter(x => isFinite(x))
    if (!latencies.length) return NaN

    return (
        latencies.reduce((memo, latency) => memo + latency, 0) / latencies.length
    )
}

export const NRC20LIST_URL = `${EXPLORER_BACKEND_URL}/nrc20-token-list`
export const NRC721LIST_URL = `${EXPLORER_BACKEND_URL}/nrc721-token-list`

export function fetchNrc20List(url) {
    return axios.get(url).then(rez => {
        const tokenList = rez.data.map(o => ({
            ...o,
            address: o.contractAddress,
            decimals: +o.decimals,
            symbol: o.symbol || o.name,
            description: { en: '' },
            website: '',
        }))

        return tokenList
    })
}

let Nrc20Address = {}
NRC20_LIST.map(nrc20 => (Nrc20Address[nrc20.address] = nrc20))

let store = {
    data: {
        displayAddressETH: false,
        shards: {},
        shardsValidators: [],
        blocks: [],
        txs: [],
        stakingTxs: [],
        pendingTxs: [],
        nrc20Txs: [],
        nrc721: [],
        nrc20TxsCount: 0,
        blockCount: 0,
        txCount: 0,
        stakingTxCount: 0,
        pendingTxsCount: 0,
        nodeCount: 0,
        lastUpdateTime: 0,
        Nrc20Address,
        NRC20_ABI,
        NRC721_ABI,
        ngy,
        NRC20_HOLDERURL,
        NET_HOLDERURL,
    },
    changeDisplayAddressETH(val) {
        this.data.displayAddressETH = val !== undefined ? val : !this.displayAddressETH
        return this.data.displayAddressETH
    },
    update(data) {
        this.updateShards(data.shards)
        this.updateGlobalData()
    },
    async updateValidtors() {
        for (let i = 0; i < 4; i++) {
            let shardi = await ngy.ngySDK.blockchain.Staking.getValidators(i)
            this.data.shardsValidators.push(shardi.result.validators)
        }
    },
    updateNrc20List() {
        fetchNrc20List(NRC20LIST_URL).then(nrc20list =>
            nrc20list.map(nrc20 =>
                Vue.set(this.data.Nrc20Address, nrc20.address, {
                    ...nrc20,
                    logo: false, //`${BASE_NRC20URL}/NRC20/${nrc20.address}.png`,
                })
            )
        )
    },
    updateNrc721List() {
        axios.get(NRC721LIST_URL).then(({ data }) => {
            this.data.nrc721.length = 0
            this.data.nrc721.push(...data)
        })
    },
    updateShards(shards) {
        if (shards) {
            Object.values(shards).forEach(this.updateShard.bind(this))
        }
    },
    updateShard(shard) {
        let shardData = this.data.shards[shard.id]
        if (!shardData) {
            Vue.set(this.data.shards, shard.id, shard)
            shardData = this.data.shards[shard.id]
            shardData.blocks = shardData.blocks.slice(0, Limit)
            shardData.txs = shardData.txs.slice(0, Limit)
            shardData.stakingTxs = shardData.stakingTxs.slice(0, Limit)
            return
        }
        // don't add blocks that are already in latestBlocks
        let blockMap = {}
        shardData.blocks.forEach(b => (blockMap[b.id] = b))
        shard.blocks.forEach(b => (blockMap[b.id] = b))
        shardData.blocks = postprocessBlocks(Object.values(blockMap))

        // don't add txs that are already in latestTxs
        let txMap = {}
        shardData.txs.forEach(t => (txMap[t.id] = t))
        shard.txs.forEach(t => (txMap[t.id] = t))
        shardData.txs = postprocessTxs(Object.values(txMap))

        // don't add txs that are already in latestTxs
        let stakingTxMap = {}
        shardData.stakingTxs.forEach(t => (stakingTxMap[t.id] = t))
        shard.stakingTxs.forEach(t => (stakingTxMap[t.id] = t))
        shardData.stakingTxs = postprocessTxs(Object.values(stakingTxMap))

        shardData.blockCount = shard.blockCount
        shardData.nodeCount = shard.nodeCount
        shardData.lastUpdateTime = shard.lastUpdateTime
        shardData.txCount = shard.txCount
        shardData.stakingTxCount = shard.stakingTxCount
    },
    updateGlobalData() {
        this.data.blocks = postprocessBlocks(
            Object.values(this.data.shards).reduce(
                (memo, shard) => memo.concat(shard.blocks), []
            )
        )
        this.data.txs = postprocessTxs(
            Object.values(this.data.shards).reduce(
                (memo, shard) => memo.concat(shard.txs), []
            )
        )
        this.updateNrc20List()
        this.updateNrc721List()
        service.getNrc20TxsLatest({ pageSize: 10, pageIndex: 0 }).then(result => {
            this.data.nrc20Txs = result.txs
            this.data.nrc20TxsCount = result.total
        })
        this.data.stakingTxs = postprocessTxs(
            Object.values(this.data.shards).reduce(
                (memo, shard) => memo.concat(shard.stakingTxs), []
            )
        )
        this.data.blockCount = Object.values(this.data.shards).reduce(
            (memo, shard) => memo + shard.blockCount,
            0
        )
        this.data.txCount = Object.values(this.data.shards).reduce(
            (memo, shard) => memo + shard.txCount,
            0
        )
        this.data.stakingTxCount = Object.values(this.data.shards).reduce(
            (memo, shard) => memo + shard.stakingTxCount,
            0
        )
        this.data.nodeCount = Object.values(this.data.shards).reduce(
            (memo, shard) => memo + shard.nodeCount,
            0
        )
        this.data.shardCount = Object.keys(this.data.shards).length
        this.data.blockLatency = getTotalBlockLatency(
            Object.values(this.data.shards).map(s => s.blockLatency)
        )
        this.data.lastUpdateTime = Math.max(
            ...Object.values(this.data.shards)
            .map(s => s.lastUpdateTime)
            .filter(x => isFinite(x))
        )
    },
    updatePendingTransactions(txs, shardID) {
        let pendingTxs = this.data.pendingTxs

        if (pendingTxs[shardID]) {
            this.data.pendingTxsCount -= pendingTxs[shardID].length
        }
        this.data.pendingTxs = null

        pendingTxs[shardID] = txs

        this.data.pendingTxs = pendingTxs
        this.data.pendingTxsCount += pendingTxs[shardID].length
    },
    reset() {
        this.data.blocks = []
        this.data.txs = []
        this.data.stakingTxs = []
        this.data.pendingTxs = []
        this.data.blockCount = 0
        this.data.txCount = 0
        this.data.stakingTxCount = 0
        this.data.nodeCount = 0
        this.data.nodes = {}
        this.data.shardCount = 0
    },
}

store.updateValidtors()

Vue.prototype.$store = store

export default store