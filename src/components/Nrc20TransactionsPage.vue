<style scoped lang="less">
@import '../less/common.less';
</style>

<template>
  <div class="txs-page explorer-page page">
    <div class="txs-body explorer-body">
      <div class="container">
        <div class="explorer-card">
          <header style="align-items: center;">
            <h1 class="flex-grow">
              NRC20 Transactions
            </h1>
            <div class="pagination-controls">
              <div class="page-controllers-row">
                <div v-if="false">
                  <div>From:</div>
                  <VueCtkDateTimePicker
                    v-model="cursor"
                    format="YYYY-MM-DD hh:mm"
                    color="#33cbda"
                    button-color="#33cbda"
                    :no-clear-button="true"
                    :max-date="maxDate"
                  />
                </div>
                <button
                  class="btn btn-light btn-icon-only"
                  style="width: 200px; margin-left: 40px;"
                  @click="next()"
                >
                  <span style="margin-right: 10px;">Prev 50 txs</span>
                  <font-awesome-icon icon="chevron-right" />
                </button>
              </div>
            </div>
          </header>
          <div class="explorer-card-body">
            <table v-if="txs.length" class="explorer-table">
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
                  <!--                  <router-link :to="'/address/' + tx.tx.from">
                    {{ tx.NRC20tx.from | shorten }}
                  </router-link>-->
                </td>
                <td>
                  <Address :bech32="tx.NRC20tx.to" :show-raw="false" />
                  <!--                  <router-link :to="'/address/' + tx.NRC20tx.to">
                    {{ tx.NRC20tx.to | shorten }}
                  </router-link>-->
                </td>
                <td>
                  {{ (Number(tx.tx.timestamp) * 1000) | age }}
                </td>
                <td>
                  <Address :bech32="tx.tx.to" />
                </td>
                <td class="no-break wfont">
                  {{ NRC20Balance(tx.tx.to, tx.NRC20tx.amount) }}
                </td>
              </tr>
            </table>

            <div v-else>
              <loading-message />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '../explorer/store'
import service from '../explorer/service'
import LoadingMessage from './LoadingMessage'
import moment from 'moment'
import Address from './Address'
import { displayAmount } from '@/utils/displayAmount'

export default {
  name: 'NRC20TransactionsPage',
  compNetnts: {
    LoadingMessage,
    Address,
  },
  data() {
    return {
      globalData: store.data,
      txs: [],
      cursorSortid: undefined,
      cursor: moment(),
      maxDate: moment().toString(),
      pageSize: 50,
    }
  },
  computed: {
    NRC20Address() {
      return this.$store.data.NRC20Address
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
        return list
      }, [])
    },
  },
  watch: {
    $route() {
      let queryCursor = Number(this.$route.query.from)
      queryCursor = isNaN(queryCursor) ? undefined : queryCursor

      const cursor = moment(queryCursor)

      let querySortid = Number(this.$route.query.sortid)
      querySortid = isNaN(querySortid) ? undefined : querySortid
      if (cursor.diff(this.cursor) || querySortid != this.sortid) {
        this.sortid = querySortid
        this.cursor = cursor
        this.getTransactions()
      }
    },
    cursor() {
      const unixCursor = moment(this.cursor).unix() * 1000

      this.$router.replace({
        name: 'NRC20TransactionsPage',
        query: { from: unixCursor, sortid: this.sortid },
      })

      this.getTransactions()
    },
  },
  mounted() {
    let queryCursor = Number(this.$route.query.from)
    queryCursor = isNaN(queryCursor) ? undefined : queryCursor

    this.cursor = moment(queryCursor)

    const querySortid = Number(this.$route.query.sortid)
    this.sortid = isNaN(querySortid) ? undefined : querySortid
    this.getTransactions()
  },
  methods: {
    next() {
      this.cursor = moment(this.txs[this.txs.length - 1].timestamp)
      const lastTxs = this.txs.slice(-1)[0]
      this.sortid =
        Number(lastTxs.blockNumber) * 10000 + Number(lastTxs.transactionIndex)
    },
    getTransactions() {
      this.txs = []

      const cursor = moment(this.cursor).unix() * 1000

      service
        .getNRC20TxsLatest({
          pageSize: this.pageSize,
          pageIndex: 0,
          sortid: this.sortid,
        })
        .then(result => {
          this.txs = result.txs
        })
    },
    NRC20info(id) {
      return this.NRC20Address[id]
    },
    NRC20Balance(id, amount) {
      return (
        displayAmount(amount, this.NRC20info(id).decimals) +
        ' ' +
        this.NRC20info(id).symbol
      )
    },
  },
}
</script>
