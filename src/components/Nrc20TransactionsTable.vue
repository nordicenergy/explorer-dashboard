<style scoped lang="less">
@import '../less/common.less';

.wfont {
  font-family: 'Nunito', Courier;
  font-size: 16px;
}
</style>

<template>
  <div class="transactions-table explorer-card">
    <header>
      <slot />
      <div class="pagination-controls">
        <span class="total-tx-num">{{ txCount }} txs</span>
        <span class="page-controllers">
          <span class="page-navigator">
            <button
              class="btn btn-light btn-icon-only"
              :disabled="pageIndex === 0"
              @click="first()"
            >
              <font-awesome-icon icon="angle-double-left" />
            </button>
            <button
              class="btn btn-light btn-icon-only"
              :disabled="pageIndex === 0"
              @click="prev()"
            >
              <font-awesome-icon icon="chevron-left" />
            </button>
            <span class="pagination-nums">
              {{ pageIndex + 1 }} / {{ pageCount ? pageCount : 1 }}
            </span>
            <button
              class="btn btn-light btn-icon-only"
              :disabled="pageIndex === pageCount - 1"
              @click="next()"
            >
              <font-awesome-icon icon="chevron-right" />
            </button>
            <button
              class="btn btn-light btn-icon-only"
              :disabled="pageIndex === pageCount - 1"
              @click="last()"
            >
              <font-awesome-icon icon="angle-double-right" />
            </button>
          </span>
        </span>
      </div>
    </header>
    <div
      ref="loadingContainer"
      class="explorer-card-body"
      style="position: relative; min-height: 200px;"
    >
      <section>
        <table class="explorer-table">
          <tr>
            <th>Shard</th>
            <th>TxHash</th>
            <th>From</th>
            <th>To</th>
            <th>Age</th>
            <th>Token</th>
            <th>Token Amount</th>
          </tr>
          <tr v-for="tx in NRC20TxsPage" :key="tx.tx.hash">
            <td>
              <router-link :to="'/shard/' + tx.tx.shardID">
                {{ tx.tx.shardID }}
              </router-link>
            </td>
            <td>
              <router-link :to="'/tx/' + tx.tx.hash">
                {{ tx.tx.hash | shorten }}
              </router-link>
            </td>
            <td>
              <Address :bech32="tx.NRC20tx.from" :show-raw="false" />

              <!--              <router-link :to="'/address/' + tx.tx.from">
                {{ tx.NRC20tx.from | shorten }}
              </router-link>-->
            </td>
            <td>
              <Address :bech32="tx.NRC20tx.to" :show-raw="false" />

              <!--              <router-link :to="'/address/' + tx.NRC20tx.to">
                {{ tx.NRC20tx.to | shorten }}
              </router-link>-->
            </td>
            <td>
              {{ (Number(tx.tx.timestamp) * 1000) | age }}
            </td>
            <td>
              <Address :bech32="tx.tx.to" />
            </td>
            <td class="no-break wfont" style="max-width:200px;overflow:hidden">
              {{ NRC20Balance(tx.tx.to, tx.NRC20tx.amount) }}
            </td>
          </tr>
        </table>
      </section>
    </div>
  </div>
</template>

<script>
import Address from './Address'
import { displayAmount } from '@/utils/displayAmount'

const NetArgNRC20Methods = [
  //'transfer',
  'approve',
  'mint',
  'burn',
  'burnFrom',
]

const twoArgsNRC20Methods = [
  //'transferFrom',
  'allowance',
]

export default {
  name: 'NRC20TransactionsTable',
  compNetnts: { Address },
  props: [
    'allTxs',
    'txCount',
    'withShards',
    'page',
    'changePage',
    'isLocal',
    'loading',
  ],
  data() {
    return {
      pageIndex: this.page || 0,
      pageSize: 20,
    }
  },
  computed: {
    pageCount() {
      return Math.ceil(this.txCount / this.pageSize)
    },
    txs() {
      const begin = this.pageIndex * this.pageSize
      if (!this.isLocal) {
        return this.allTxs
      } else {
        return this.allTxs.slice(begin, begin + this.pageSize)
      }
    },
    NRC20TxsPage() {
      //const start = this.pageSize * this.pageIndex;
      //return this.NRC20Txs.slice(start, start + this.pageSize);
      return this.NRC20Txs
    },
    NRC20Txs() {
      const c = this.$store.data.ngy.contract(this.$store.data.NRC20_ABI)
      return this.txs.reduce((list, tx) => {
        if (this.NRC20info(tx.to) == undefined) {
          return list
        }
        const decodeObj = c.decodeInput(tx.input)
        if (decodeObj.abiItem && decodeObj.abiItem.name == 'transfer')
          list.push({
            tx,
            NRC20tx: {
              from: tx.from,
              to: decodeObj.params[0],
              amount: decodeObj.params[1],
            },
          })
        else if (decodeObj.abiItem && decodeObj.abiItem.name == 'transferFrom')
          list.push({
            tx,
            NRC20tx: {
              from: decodeObj.params[0],
              to: decodeObj.params[1],
              amount: decodeObj.params[2],
            },
          })
        else if (
          decodeObj.abiItem &&
          NetArgNRC20Methods.includes(decodeObj.abiItem.name)
        )
          list.push({
            tx,
            NRC20tx: {
              from: tx.from,
              to: decodeObj.params[0],
              amount: decodeObj.params[1],
            },
          })
        else if (
          decodeObj.abiItem &&
          twoArgsNRC20Methods.includes(decodeObj.abiItem.name)
        )
          list.push({
            tx,
            NRC20tx: {
              from: decodeObj.params[0],
              to: decodeObj.params[1],
              amount: decodeObj.params[2],
            },
          })
        return list
      }, [])
    },
    NRC20Address() {
      return this.$store.data.NRC20Address
    },
  },
  watch: {
    loading() {
      this.setLoader()
    },
  },
  mounted() {
    this.setLoader()
  },
  methods: {
    setLoader() {
      if (this.loading) {
        this.loader = this.$loading.show({
          container: this.$refs.loadingContainer,
          canCancel: false,
        })
      } else if (this.loader) {
        this.loader.hide()
      }
    },
    goToPage(index) {
      if (index < 0) index = 0
      if (index >= this.pageCount) index = this.pageCount - 1

      const lastTxs = this.NRC20Txs.slice(-1)[0].tx
      const sortid =
        this.pageIndex + 1 == index
          ? Number(lastTxs.blockNumber) * 10000 +
            Number(lastTxs.transactionIndex)
          : undefined
      this.pageIndex = index
      if (this.changePage) {
        this.changePage(index, sortid)
      }
    },
    first() {
      this.goToPage(0)
    },
    last() {
      this.goToPage(this.pageCount - 1)
    },
    prev() {
      if (this.pageIndex === 0) return
      this.goToPage(this.pageIndex - 1)
    },
    next() {
      if (this.pageIndex === this.pageCount - 1) return
      this.goToPage(this.pageIndex + 1)
    },
    NRC20info(id) {
      return this.NRC20Address[id]
    },
    NRC20Balance(id, amount) {
      console.log(
        'amount',
        amount,
        displayAmount(amount, this.NRC20info(id).decimals)
      )
      return (
        displayAmount(amount, this.NRC20info(id).decimals) +
        ' ' +
        this.NRC20info(id).symbol
      )
    },
  },
}
</script>
