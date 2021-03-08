import Vue from 'vue'
import Router from 'vue-router'
import DashboardPage from '@/compNetnts/DashboardPage'
import AdminPage from '@/compNetnts/AdminPage'
import BlocksPage from '@/compNetnts/BlocksPage'
import HomePage from '@/compNetnts/HomePage'
import BlockPage from '@/compNetnts/BlockPage'
import TransactionPage from '@/compNetnts/TransactionPage'
import TransactionsPage from '@/compNetnts/TransactionsPage'
import StakingTransactionsPage from '@/compNetnts/StakingTransactionsPage'
import Nrc20TransactionsPage from '@/compNetnts/Nrc20TransactionsPage'
import AddressPage from '@/compNetnts/AddressPage'
import ShardPage from '@/compNetnts/ShardPage'
import AddressShardPage from '@/compNetnts/AddressShardPage'
import TransactionsByBlockPage from '@/compNetnts/TransactionsByBlockPage'
import TokenViewPage from '@/compNetnts/TokenViewPage'
import Token721ViewPage from '@/compNetnts/Token721ViewPage'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomePage',
      compNetnt: HomePage,
    },
    {
      path: '/dashboard',
      name: 'DashboardPage',
      compNetnt: DashboardPage,
    },
    {
      path: '/admin',
      name: 'AdminPage',
      compNetnt: AdminPage,
    },
    {
      path: '/blocks/:pageIndex?',
      name: 'BlocksPage',
      compNetnt: BlocksPage,
    },
    {
      path: '/txs',
      name: 'TransactionsPage',
      compNetnt: TransactionsPage,
    },
    {
      path: '/staking-txs',
      name: 'StakingTransactionsPage',
      compNetnt: StakingTransactionsPage,
    },
    {
      path: '/NRC20-txs',
      name: 'Nrc20TransactionsPage',
      compNetnt: Nrc20TransactionsPage,
    },
    {
      path: '/block/:blockId',
      name: 'BlockPage',
      compNetnt: BlockPage,
    },
    {
      path: '/block/:blockId/txs',
      name: 'TransactionsByBlockPage',
      compNetnt: TransactionsByBlockPage,
    },
    {
      path: '/tx/:transactionId',
      name: 'TransactionPage',
      compNetnt: TransactionPage,
    },
    {
      path: '/staking-tx/:transactionId',
      name: 'TransactionPage',
      compNetnt: TransactionPage,
      props: { isStaking: true },
    },
    {
      path: '/address/:address',
      name: 'AddressPage',
      compNetnt: AddressPage,
    },
    {
      path: '/address/:address/shard/:shardId/:pageIndex?',
      name: 'AddressShardPage',
      compNetnt: AddressShardPage,
    },
    {
      path: '/shard/:id',
      name: 'ShardPage',
      compNetnt: ShardPage,
    },
    {
      path: '/tokens',
      name: 'TokenView',
      compNetnt: TokenViewPage,
    },
    {
      path: '/tokens721',
      name: 'TokenView721',
      compNetnt: Token721ViewPage,
    },
  ],
})
