<style>
.vs__search {
  color: #666;
}

.vs__dropdown-option {
  color: #666;
}

.vs__dropdown-option--highlight {
  background: var(--color-table-link);
  color: white;
}

.vs__search::placeholder {
  color: #666;
}
</style>

<style scoped lang="less">
@import '../less/common.less';

.avatar-wrapper {
  margin-left: 1em;
}

.avatar {
  border-radius: 100%;
  display: table-cell;
  background-color: #47e0cd;
  color: white;
  height: 25px;
  width: 25px;
  font-weight: bold;
  text-transform: capitalize;
  text-align: center;
  vertical-align: middle;
  font-size: 15px;
  padding: 0;
  margin: 0;
}

.hrclogo {
  vertical-align: text-bottom;
  border-radius: 0.25rem;
  width: 1.3em;
  border: 1px solid var(--bc-dim);
  margin-left: 1em;
}

.selectItem {
  border: nNet;
  padding: 0;
  cursor: pointer;
  font-family: unset;
  color: unset;
  background-color: rgba(0, 0, 0, 0);
  /*appearance: nNet;*/
}

.selectItem:focus {
  box-shadow: nNet !important;
}
</style>

<template>
  <div class="address-page explorer-page page">
    <div class="address-body explorer-body">
      <div v-if="showPanel" class="container">
        <div class="explorer-card">
          <header>
            <h1 v-if="isnrc721(address.id)">
              <span>
                nrc721 Token:
                <span :style="bgStyle(isnrc721(address.id).name)">
                  {{ isnrc721(address.id).name }} (<b>{{
                    isnrc721(address.id).symbol
                  }}</b
                >)
                </span>
              </span>
            </h1>

            <h1 v-else-if="isNRC20(address.id)">
              NRC20 Token:
              <!--              <span v-if="NRC20Info.logo">
                <img :src="NRC20Info.logo" class="hrclogo" />
              </span>-->
              <span v-if="!NRC20Info.logo">
                <span :style="bgStyle(NRC20Info.name)">
                  {{ NRC20Info.name }} (<b>{{ NRC20Info.symbol }}</b
                >)
                </span>
              </span>
            </h1>
            <h1 v-else>
              {{ title }}
            </h1>
          </header>

          <div class="explorer-card-body">
            <section>
              <table class="explorer-table">
                <tr v-if="isnrc721(address.id)">
                  <td class="td-title">
                    Name(Symbol)
                  </td>
                  <td>
                    {{
                      isnrc721(address.id).name +
                      "(" +
                      isnrc721(address.id).symbol +
                      ")"
                    }}
                  </td>
                </tr>

                <tr v-if="isnrc721(address.id)">
                  <td class="td-title">
                    Total Supply
                  </td>
                  <td>
                    {{ nrc721TotalSupply || "—" }}
                  </td>
                </tr>

                <tr v-if="isnrc721(address.id)">
                  <td class="td-title">
                    Holders
                  </td>
                  <td>
                    {{
                      nrc721Assets
                          ? Object.keys(
                          Object.values(nrc721Assets).reduce(
                              (a, b) => ({ ...a, [b.owner]: 1 }),
                              {}
                          )
                      ).length || "—"
                          : "—"
                    }}
                  </td>
                </tr>

                <tr v-if="isnrc721(address.id)">
                  <td class="td-title">
                    Transfers
                  </td>
                  <td>
                    {{ Object.keys(nrc721Transactions).length || "—" }}
                  </td>
                </tr>

                <tr v-if="isNRC20(address.id)">
                  <td class="td-title">
                    Name(Symbol)
                  </td>
                  <td>
                    {{ NRC20Info.name + "(" + NRC20Info.symbol + ")" }}
                  </td>
                </tr>

                <tr v-if="isNRC20(address.id)">
                  <td class="td-title">
                    Decimals
                  </td>
                  <td>{{ NRC20Info.decimals }}</td>
                </tr>

                <tr v-if="isNRC20(address.id)">
                  <td class="td-title">
                    Total Supply
                  </td>
                  <td>{{ NRC20ActualTotalSupply || NRC20Info.totalSupplyDisplay }}</td>
                </tr>

                <!-- <tr>
                  <td class="td-title">
                    Description
                  </td>
                  <td>{{ NRC20Info.description.en }}</td>
                </tr>-->

                <tr>
                  <td class="td-title">
                    {{
                      isnrc721(address.id) || isNRC20(address.id)
                          ? "Contract"
                          : "ID"
                    }}
                  </td>
                  <td>
                    <Address
                        :bech32="address.id"
                        show-raw="true"
                        address-only="true"
                    />
                  </td>
                </tr>

                <tr v-if="isContract">
                  <td class="td-title">
                    Creater Address
                  </td>
                  <td>
                    <Address
                        :bech32="contractData.authorAddress"
                        show-raw="true"
                    />
                  </td>
                </tr>

                <tr v-if="isContract">
                  <td class="td-title">
                    Transaction ID
                  </td>
                  <td>
                    <router-link :to="'/tx/' + contractData.txId">
                      {{ contractData.txId | shorten }}
                    </router-link>
                  </td>
                </tr>

                <!--                <tr v-if="isContract">
                  <td class="td-title">
                    Creater Address
                  </td>
                  <td>
                    <Address
                      :bech32="contractData.authorAddress"
                      show-raw="true"
                    />
                  </td>
                </tr>

                <tr v-if="isContract">
                  <td class="td-title">
                    Transaction ID
                  </td>
                  <td>
                    <router-link :to="'/tx/' + contractData.txId">
                      {{ contractData.txId | shorten }}
                    </router-link>
                  </td>
                </tr>-->

                <tr>
                  <td class="td-title">
                    Net Balance
                  </td>
                  <td>
                    {{ address.balance | amount }}
                    <img src="../assets/arrow1.png" @click="showBalance" />
                  </td>
                </tr>
                <tr
                    v-for="(shard, index) in address.shardData"
                    :key="`balance${index}`"
                    class="shard"
                >
                  <td v-if="allBalance" class="td-title">
                    Shard {{ index }} : {{ shard.balance | amount }}
                  </td>
                </tr>

                <!-- v-if="
                   !NRC20BalancesDropdownOptions ||
                     NRC20BalancesDropdownOptions.length > 0
                 "-->
                <tr>
                  <td class="td-title">
                    Token
                  </td>
                  <td>
                    <div style="max-width: 500px">
                      <v-select
                          :disabled="
                          NRC20BalancesDropdownOptions &&
                            NRC20BalancesDropdownOptions.length === 0
                        "
                          :placeholder="NRC20BalancesDropdownPlaceholder"
                          :compNetnts="{ OpenIndicator: null }"
                          :options="NRC20BalancesDropdownOptions"
                          @input="onNRC20BalancesDropdown"
                      ></v-select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="td-title">
                    Transactions
                  </td>
                  <td>
                    {{ txCount | number }}
                    <img src="../assets/arrow1.png" @click="showTxs" />
                  </td>
                </tr>
                <tr
                    v-for="(shard, index) in address.shardData"
                    :key="`txCount${index}`"
                    class="shard"
                >
                  <td v-if="allTxsCount" class="td-title">
                    Shard {{ index }} : {{ shard.txCount | number }}
                  </td>
                </tr>

                <tr>
                  <td class="td-title">
                    Staking Transactions
                  </td>
                  <td>
                    {{ stakingTxCount | number }}
                    <img src="../assets/arrow1.png" @click="showStakingTxs" />
                  </td>
                </tr>

                <tr
                    v-for="(shard, index) in address.shardData"
                    :key="`stakingTxCount${index}`"
                    class="shard"
                >
                  <td v-if="allStakingCount" class="td-title">
                    Shard {{ index }} : {{ shard.stakingTxCount | number }}
                  </td>
                </tr>
              </table>
            </section>
          </div>
        </div>

        <NrcTokenTabs v-if="false && showNRC20Section">
          <TabPane :name="'NRC20 Balance'">
            <section>
              <table class="explorer-table">
                <div v-for="balanceOf in NRC20Balance" :key="balanceOf.address">
                  <tr v-if="+balanceOf.balance">
                    <td v-if="+balanceOf.balance" class="td-title">
                      &lt;!&ndash;v-if="balanceOf.balance !==0"&ndash;&gt;
                      <Address :bech32="balanceOf.id" />
                    </td>
                    <td>
                      {{ balanceOf.balance }}
                    </td>
                  </tr>
                </div>
              </table>
            </section>
          </TabPane>
          <TabPane v-if="false" :name="'nrc721'">
            coming soon...
          </TabPane>
        </NrcTokenTabs>

        <TransactionsTable
            v-if="showWhich == 'regular'"
            :all-txs="allTxs"
            with-shards="true"
            :tx-count="txCount"
            :page="page"
            :loading="loading"
            :change-page="changePage"
        >
          <slot>
            <TransactionTableTabs
                :show-nrc721txs="Object.values(nrc721Transactions).length"
                :show-nrc721="
                Object.values(nrc721Transactions).length ||
                  nrc721Inventory.length
              "
                :value="tabValue"
                :on-change="changeTab"
            />
          </slot>
        </TransactionsTable>

        <!-- nrc721 table -->
        <nrc721TransfersTable
            v-else-if="showWhich == 'nrc721'"
            :all-txs="Object.values(nrc721Transactions).map(a => ({ ...a }))"
            :tx-count="Object.values(nrc721Transactions).length"
            :page="page"
            :is-local="true"
            :loading="loading"
            :change-page="() => {}"
        >
          <slot>
            <TransactionTableTabs
                :show-nrc721txs="Object.values(nrc721Transactions).length"
                :show-nrc721="
                Object.values(nrc721Transactions).length ||
                  nrc721Inventory.length
              "
                :value="tabValue"
                :on-change="changeTab"
            />
          </slot>
        </nrc721TransfersTable>

        <nrc721AssetsTable
            v-else-if="showWhich == 'nrc721Assets'"
            :all-txs="
            Object.values(nrc721Assets).length > 0
              ? Object.values(nrc721Assets).map(a => ({ ...a }))
              : nrc721Inventory
          "
            :tx-count="
            Object.values(nrc721Assets).length > 0
              ? Object.values(nrc721Assets).length
              : nrc721Inventory.length
          "
            :page="page"
            :is-local="true"
            :loading="loading"
            :change-page="() => {}"
        >
          <slot>
            <TransactionTableTabs
                :show-nrc721txs="Object.values(nrc721Transactions).length"
                :show-nrc721="
                Object.values(nrc721Transactions).length ||
                  nrc721Inventory.length
              "
                :value="tabValue"
                :on-change="changeTab"
            />
          </slot>
        </nrc721AssetsTable>

        <NRC20TransactionsTable
            v-else-if="showWhich == 'NRC20'"
            :all-txs="NRC20Txs"
            with-shards="true"
            :loading="loading"
            :tx-count="NRC20TxsCount"
            :page="page"
            :change-page="changePage"
        >
          <slot>
            <TransactionTableTabs
                :show-nrc721txs="Object.values(nrc721Transactions).length"
                :show-nrc721="
                Object.values(nrc721Transactions).length ||
                  nrc721Inventory.length
              "
                :value="tabValue"
                :on-change="changeTab"
            />
          </slot>
        </NRC20TransactionsTable>

        <StakingTransactionsTable
            v-else
            :all-staking-txs="allStakingTxs"
            with-shards="true"
            :page="page"
            :change-page="changePage"
            :loading="loading"
            :tx-count="stakingTxCount"
        >
          <slot>
            <TransactionTableTabs
                :show-nrc721txs="Object.values(nrc721Transactions).length"
                :show-nrc721="
                Object.values(nrc721Transactions).length ||
                  nrc721Inventory.length
              "
                :value="tabValue"
                :on-change="changeTab"
            />
          </slot>
        </StakingTransactionsTable>
      </div>
      <div v-else class="container">
        <loading-message v-if="false" />
      </div>
    </div>
  </div>
</template>

<script>
import service from "../explorer/service";
import LoadingMessage from "./LoadingMessage";
import TransactionsTable from "./TransactionsTable";
import StakingTransactionsTable from "./StakingTransactionsTable";
import NRC20TransactionsTable from "./NRC20TransactionsTable";
import TransactionTableTabs from "./TransactionTableTabs";
import nrc721TransfersTable from "./nrc721TransfersTable";
import nrc721AssetsTable from "./nrc721AssetsTable";
import NrcTokenTabs from "./NrcTokenTabs";
import TabPane from "./TabPane";
import Address from "./Address";
import { displayAmount } from "@/utils/displayAmount";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import axios from "axios";
import { NRC721LIST_URL } from "../explorer/store";

// todo break to parts. make clean
const status = { staking: 1, regular: 0, NRC20: 2, nrc721: 3, nrc721Assets: 4 };
const defaultStatus = "regular";
export default {
  name: "AddressPage",
  compNetnts: {
    LoadingMessage,
    TransactionsTable,
    StakingTransactionsTable,
    TransactionTableTabs,
    nrc721TransfersTable,
    nrc721AssetsTable,
    NRC20TransactionsTable,
    NrcTokenTabs,
    TabPane,
    Address,
    vSelect
  },
  data() {
    return {
      allBalance: false,
      allTxsCount: false,
      allStakingCount: false,
      loading: true,
      address: null,
      allTxs: [],
      NRC20Txs: [],
      NRC20TxsCount: 0,
      allStakingTxs: [],
      txCount: 0,
      stakingTxCount: 0,
      NRC20Balance: {},
      nrc721Balance: [],
      $store: this.$store.data,
      nrc721TotalSupply: null,
      nrc721Assets: {},
      nrc721Transactions: {},
      nrc721Inventory: [],
      NRC20ActualTotalSupply: 0
    };
  },
  computed: {
    title() {
      return this.isContract ? "Contract" : "Address";
    },
    isContract() {
      return this.contractData && this.contractData.txId;
    },
    NRC20BalancesDropdownPlaceholder() {
      if (!Object.values(this.NRC20Balance).length) {
        return "Loading...";
      }
      const NRC20 = Object.values(this.NRC20Balance)
          .filter(
              o => +o.balance !== 0 // || true
          )
          .filter(o => !isNaN(o.balance)).length;

      const nrc721 = this.nrc721Balance.filter(
          o => +o.balance !== 0 // || true
      ).length;

      return (
          [
            NRC20 > 0 ? `NRC20 - ${NRC20}` : "",
            nrc721 > 0 ? `nrc721 - ${nrc721}` : ""
          ]
              .filter(a => a)
              .join(", ") || "—"
      );
    },
    NRC20BalancesDropdownOptions() {
      const NRC20 = Object.values(this.NRC20Balance)
          .filter(o => +o.balance !== 0)
          .filter(o => !isNaN(+o.balance))
          .map(o => ({
            label: `${o.name} (${o.id}) - ${o.balance}`,
            code: o.address
          }));

      const nrc721 = this.nrc721Balance.map(({ address, name, balance }) => ({
        code: address,
        label: `${name} - ${balance}`
      }));

      return [...NRC20, ...nrc721];
    },
    showWhich() {
      return this.$route.query.txType || defaultStatus; // 'staking','regular','NRC20';
    },
    showNRC20Section() {
      if (!this.NRC20Balance) {
        return false;
      }
      return Object.values(this.NRC20Balance).reduce(
          (a, o) => a || +o.balance,
          false
      );
    },
    page() {
      return this.$route.query.page - 1 || 0;
    },
    tabValue() {
      return status[this.$route.query.txType] != undefined
          ? status[this.$route.query.txType]
          : status[defaultStatus];
    },
    NRC20Address() {
      return this.$store.data.NRC20Address;
    },
    nrc721Data() {
      return this.$store.data.nrc721;
    },
    NRC20Info() {
      const res = this.NRC20Address[this.address.id];
      if (!res) {
        console.log("NRC20Info called without reason");
        return {};
      }

      const totalSupplyDisplay = displayAmount(res.totalSupply, res.decimals)
      res.totalSupplyDisplay = totalSupplyDisplay;
      return res;
    },
    showPanel() {
      return (
          !this.loading ||
          this.$route.params.address === (this.address && this.address.id)
      );
    }
  },
  watch: {
    NRC20Address() {
      if (this.address) {
        this.NRC20BalanceUpdate();
      }
    },
    nrc721Data() {
      if (this.address) {
        this.getnrc721Data(this.address);
        this.nrc721BalanceUpdate();
      }
    },
    $route() {
      if (this.$route.params.address !== (this.address && this.address.id)) {
        this.getAddress();
      }
    },
    page() {
      this.getAddress();
    }
  },
  mounted() {
    this.getAddress();
  },
  methods: {
    onNRC20BalancesDropdown(val) {
      this.$router.push(`/address/${val.code}`);
    },
    onNRC20BalanceDropdown() {
    },
    Netrror() {
      this.NRC20Info.logo = null;
    },
    bgStyle(name) {
      if (!name) {
        return {};
      }
      const palette = [
        '#ffcc33',
        '#ffc61a',
        '#ffbf00',
        '#e6ac00',
        '#cc9900',
        '#b38600',
        '#997300',
        '#806000',
      ];
      const c = name.charCodeAt(0) % palette.length;
      const backgroundColor = palette[c];
      return { color: backgroundColor };
    },
    changeTab(value) {
      let txType = "regular";
      if (value == 1) txType = "staking";
      if (value == 2) txType = "NRC20";
      if (value == 3) txType = "nrc721";
      if (value == 4) txType = "nrc721Assets";
      this.$router.replace({
        name: "AddressPage",
        query: { txType }
      });
    },
    changePage(value, NRC20QueryID) {
      this.$router.replace({
        name: "AddressPage",
        query: {
          page: value + 1,
          txType: this.$route.query.txType,
          NRC20QueryID
        }
      });
    },
    getAddress() {
      this.loading = true;
      const txs = {};
      const stakingTxs = {};

      if (this.$route.params.address.startsWith("0x")) {
        this.$route.params.address = this.$store.data.ngy.ngySDK.crypto.toBech32(
            this.$route.params.address
        );
      }
      const address = this.$route.params.address;
      const sortid = this.$route.params.NRC20QueryID;

      service
          .getNRC20Txs({
            id: address,
            pageSize: 20,
            pageIndex: this.page,
            sortid
          })
          .then(result => {
            this.NRC20Txs = result.txs;
            this.NRC20TxsCount = result.total;
          });

      service
          .getAddressFullInfo({ id: address, pageIndex: this.page, pageSize: 20 })
          .then(async ({ address, contractData }) => {
            address.shardData.forEach((data, idx) => {
              if (data.txs) {
                data.txs.forEach(tx => {
                  txs[tx.hash] = {
                    ...tx,
                    shardID: idx
                  };
                });
              }
              if (data.stakingTxs) {
                data.stakingTxs.forEach(tx => {
                  stakingTxs[tx.hash] = {
                    ...tx,
                    shardID: idx,
                    delegator: tx.msg.delegatorAddress,
                    validator: tx.msg.validatorAddress,
                    value: tx.msg.amount
                  };
                });
              }
            });

            this.txCount = address.txCount;
            this.stakingTxCount = address.stakingTxCount;

            // if address is deployed contract
            this.contractData = contractData;
            this.address = address;
            await this.getnrc721Data(address);
            this.NRC20BalanceUpdate();
            this.nrc721BalanceUpdate();
          })
          .finally(() => {
            this.allTxs = Object.values(txs).sort((a, b) =>
                Number(a.timestamp) > Number(b.timestamp) ? -1 : 1
            );

            this.allStakingTxs = Object.values(stakingTxs).sort((a, b) =>
                Number(a.timestamp) > Number(b.timestamp) ? -1 : 1
            );

            this.loading = false;
          });
    },
    isNRC20(address) {
      return this.NRC20Address[address] !== undefined;
    },
    isnrc721(address) {
      return (
          this.nrc721Data &&
          this.nrc721Data.length &&
          this.nrc721Data.find(e => e.contractAddress === address)
      );
    },
    async getnrc721Data() {
      // todo infos

      const info = this.isnrc721(this.address.id);
      if (!info) {
        this.nrc721Transactions = [];
        this.nrc721Assets = {};
        return;
      }
      const address = info.contractAddress;

      const ngy = this.$store.data.ngy;
      const c = ngy.contract(this.$store.data.nrc721_ABI, address);
      try {
        this.nrc721TotalSupply = (
            await c.methods.totalSupply().call()
        ).toString();
      } catch (e) {
      }

      const url = NRC721LIST_URL;
      this.nrc721Transactions = await axios
          .get(`${url}/${address}/history`)
          .then(r => r.data);
      this.nrc721Assets = await axios
          .get(`${url}/${address}/assets`)
          .then(r => r.data);
    },
    async nrc721BalanceUpdate() {
      const address = this.address.id;
      const ngy = this.$store.data.ngy;
      const toHex = ngy.ngySDK.crypto.fromBech32;
      const tokens = this.$store.data.nrc721;
      this.nrc721Balance = (
          await Promise.all(
              Object.values(tokens).map(
                  async ({ name, symbol, contractAddress }) => {
                    const c = ngy.contract(
                        this.$store.data.nrc721_ABI,
                        contractAddress
                    );
                    const balance = (
                        await c.methods.balanceOf(toHex(address)).call()
                    ).toString();

                    return {
                      name,
                      symbol,
                      address: contractAddress,
                      balance
                    };
                  }
              )
          )
      ).filter(({ balance }) => +balance > 0);

      this.nrc721Inventory = (
          await Promise.all(
              this.nrc721Balance.map(o => {
                return axios
                    .get(`${NRC721LIST_URL}/${o.address}/assets`)
                    .then(r => r.data);
              })
          )
      )
          .reduce((a, b) => a.concat(Object.values(b)), [])
          .filter(({ owner }) => owner === address);

      console.log("inventory", address, this.nrc721Inventory);
    },
    async NRC20BalanceUpdate() {
      const ngy = this.$store.data.ngy;
      const toHex = ngy.ngySDK.crypto.fromBech32;

      const address = this.address.id
      if (this.isNRC20(address)) {
        let actualTotalSupply = 0;
        try {
          const c = ngy.contract(this.$store.data.NRC20_ABI, address);
          actualTotalSupply = (await c.methods.totalSupply().call()).toString();
        } catch (e) {
        }
        const decimals = (this.NRC20Address[address] || {}).decimals;
        this.NRC20ActualTotalSupply = decimals && actualTotalSupply && displayAmount(actualTotalSupply, decimals);
      }

      const res = {};

      Promise.all(
          Object.keys(this.NRC20Address).map(async NRC20 => {
            //for (let NRC20 in this.NRC20Address) {
            //if (this.NRC20Balance[NRC20]) continue;
            //console.log({NRC20});

            let c;
            try {
              c = ngy.contract(this.$store.data.NRC20_ABI, toHex(NRC20));
            } catch (e) {
              console.log({ e, NRC20 });
            }

            const NRC20Info = this.NRC20Address[NRC20];
            let balance;

            try {
              balance = await c.methods.balanceOf(toHex(this.address.id)).call();
            } catch (e) {
              // ...
            }

            const balanceDisplay = displayAmount(balance, NRC20Info.decimals);

            return {
              [NRC20]: {
                name: NRC20Info.name,
                id: NRC20Info.symbol,
                balance: balanceDisplay,
                address: NRC20Info.address
              }
            };
          })
      )
          .then(res => res.reduce((a, o) => ({ ...a, ...o }), {}))
          .then(res => {
            this.NRC20Balance = res;
          });
    },
    showBalance() {
      ;(this.allBalance = !this.allBalance),
          (this.allTxsCount = false),
          (this.allStakingCount = false);
    },
    showTxs() {
      ;(this.allBalance = false),
          (this.allTxsCount = !this.allTxsCount),
          (this.allStakingCount = false);
    },
    showStakingTxs() {
      ;(this.allBalance = false),
          (this.allTxsCount = false),
          (this.allStakingCount = !this.allStakingCount);
    }
  }
};
</script>
