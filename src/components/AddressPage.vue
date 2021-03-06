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
  background-color: #cc9900;
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

.nrclogo {
  vertical-align: text-bottom;
  border-radius: 0.25rem;
  width: 1.3em;
  border: 1px solid var(--bc-dim);
  margin-left: 1em;
}

.selectItem {
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: unset;
  color: unset;
  background-color: rgba(0, 0, 0, 0);
  /*appearance: none;*/
}

.selectItem:focus {
  box-shadow: none !important;
}
</style>

<template>
  <div class="address-page explorer-page page">
    <div class="address-body explorer-body">
      <div v-if="showPanel" class="container">
        <div class="explorer-card">
          <header>
            <h1 v-if="isNrc721(address.id)">
              <span>
                NRC721 Token:
                <span :style="bgStyle(isNrc721(address.id).name)">
                  {{ isNrc721(address.id).name }} (<b>{{
                    isNrc721(address.id).symbol
                  }}</b
                >)
                </span>
              </span>
            </h1>

            <h1 v-else-if="isNrc20(address.id)">
              NRC20 Token:
              <!--              <span v-if="Nrc20Info.logo">
                <img :src="Nrc20Info.logo" class="nrclogo" />
              </span>-->
              <span v-if="!Nrc20Info.logo">
                <span :style="bgStyle(Nrc20Info.name)">
                  {{ Nrc20Info.name }} (<b>{{ Nrc20Info.symbol }}</b
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
                <tr v-if="isNrc721(address.id)">
                  <td class="td-title">
                    Name(Symbol)
                  </td>
                  <td>
                    {{
                      isNrc721(address.id).name +
                      "(" +
                      isNrc721(address.id).symbol +
                      ")"
                    }}
                  </td>
                </tr>

                <tr v-if="isNrc721(address.id)">
                  <td class="td-title">
                    Total Supply
                  </td>
                  <td>
                    {{ nrc721TotalSupply || "—" }}
                  </td>
                </tr>

                <tr v-if="isNrc721(address.id)">
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

                <tr v-if="isNrc721(address.id)">
                  <td class="td-title">
                    Transfers
                  </td>
                  <td>
                    {{ Object.keys(nrc721Transactions).length || "—" }}
                  </td>
                </tr>

                <tr v-if="isNrc20(address.id)">
                  <td class="td-title">
                    Name(Symbol)
                  </td>
                  <td>
                    {{ Nrc20Info.name + "(" + Nrc20Info.symbol + ")" }}
                  </td>
                </tr>

                <tr v-if="isNrc20(address.id)">
                  <td class="td-title">
                    Decimals
                  </td>
                  <td>{{ Nrc20Info.decimals }}</td>
                </tr>

                <tr v-if="isNrc20(address.id)">
                  <td class="td-title">
                    Total Supply
                  </td>
                  <td>{{ nrc20ActualTotalSupply || Nrc20Info.totalSupplyDisplay }}</td>
                </tr>

                <!-- <tr>
                  <td class="td-title">
                    Description
                  </td>
                  <td>{{ Nrc20Info.description.en }}</td>
                </tr>-->

                <tr>
                  <td class="td-title">
                    {{
                      isNrc721(address.id) || isNrc20(address.id)
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
                    NET Balance
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
                   !nrc20BalancesDropdownOptions ||
                     nrc20BalancesDropdownOptions.length > 0
                 "-->
                <tr>
                  <td class="td-title">
                    Token
                  </td>
                  <td>
                    <div style="max-width: 500px">
                      <v-select
                          :disabled="
                          nrc20BalancesDropdownOptions &&
                            nrc20BalancesDropdownOptions.length === 0
                        "
                          :placeholder="nrc20BalancesDropdownPlaceholder"
                          :components="{ OpenIndicator: null }"
                          :options="nrc20BalancesDropdownOptions"
                          @input="onNrc20BalancesDropdown"
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

        <NrcTokenTabs v-if="false && showNrc20Section">
          <TabPane :name="'NRC20 Balance'">
            <section>
              <table class="explorer-table">
                <div v-for="balanceOf in Nrc20Balance" :key="balanceOf.address">
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
          <TabPane v-if="false" :name="'NRC721'">
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
        <NRC721TransfersTable
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
        </NRC721TransfersTable>

        <NRC721AssetsTable
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
        </NRC721AssetsTable>

        <Nrc20TransactionsTable
            v-else-if="showWhich == 'nrc20'"
            :all-txs="nrc20Txs"
            with-shards="true"
            :loading="loading"
            :tx-count="nrc20TxsCount"
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
        </Nrc20TransactionsTable>

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
import Nrc20TransactionsTable from "./Nrc20TransactionsTable";
import TransactionTableTabs from "./TransactionTableTabs";
import NRC721TransfersTable from "./NRC721TransfersTable";
import NRC721AssetsTable from "./NRC721AssetsTable";
import NrcTokenTabs from "./NrcTokenTabs";
import TabPane from "./TabPane";
import Address from "./Address";
import { displayAmount } from "@/utils/displayAmount";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import axios from "axios";
import { NRC721LIST_URL } from "../explorer/store";

// todo break to parts. make clean
const status = { staking: 1, regular: 0, nrc20: 2, nrc721: 3, nrc721Assets: 4 };
const defaultStatus = "regular";
export default {
  name: "AddressPage",
  components: {
    LoadingMessage,
    TransactionsTable,
    StakingTransactionsTable,
    TransactionTableTabs,
    NRC721TransfersTable,
    NRC721AssetsTable,
    Nrc20TransactionsTable,
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
      nrc20Txs: [],
      nrc20TxsCount: 0,
      allStakingTxs: [],
      txCount: 0,
      stakingTxCount: 0,
      Nrc20Balance: {},
      Nrc721Balance: [],
      $store: this.$store.data,
      nrc721TotalSupply: null,
      nrc721Assets: {},
      nrc721Transactions: {},
      nrc721Inventory: [],
      nrc20ActualTotalSupply: 0
    };
  },
  computed: {
    title() {
      return this.isContract ? "Contract" : "Address";
    },
    isContract() {
      return this.contractData && this.contractData.txId;
    },
    nrc20BalancesDropdownPlaceholder() {
      if (!Object.values(this.Nrc20Balance).length) {
        return "Loading...";
      }
      const nrc20 = Object.values(this.Nrc20Balance)
          .filter(
              o => +o.balance !== 0 // || true
          )
          .filter(o => !isNaN(o.balance)).length;

      const nrc721 = this.Nrc721Balance.filter(
          o => +o.balance !== 0 // || true
      ).length;

      return (
          [
            nrc20 > 0 ? `NRC20 - ${nrc20}` : "",
            nrc721 > 0 ? `NRC721 - ${nrc721}` : ""
          ]
              .filter(a => a)
              .join(", ") || "—"
      );
    },
    nrc20BalancesDropdownOptions() {
      const nrc20 = Object.values(this.Nrc20Balance)
          .filter(o => +o.balance !== 0)
          .filter(o => !isNaN(+o.balance))
          .map(o => ({
            label: `${o.name} (${o.id}) - ${o.balance}`,
            code: o.address
          }));

      const nrc721 = this.Nrc721Balance.map(({ address, name, balance }) => ({
        code: address,
        label: `${name} - ${balance}`
      }));

      return [...nrc20, ...nrc721];
    },
    showWhich() {
      return this.$route.query.txType || defaultStatus; // 'staking','regular','nrc20';
    },
    showNrc20Section() {
      if (!this.Nrc20Balance) {
        return false;
      }
      return Object.values(this.Nrc20Balance).reduce(
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
    Nrc20Address() {
      return this.$store.data.Nrc20Address;
    },
    Nrc721Data() {
      return this.$store.data.nrc721;
    },
    Nrc20Info() {
      const res = this.Nrc20Address[this.address.id];
      if (!res) {
        console.log("Nrc20Info called without reason");
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
    Nrc20Address() {
      if (this.address) {
        this.nrc20BalanceUpdate();
      }
    },
    Nrc721Data() {
      if (this.address) {
        this.getNRC721Data(this.address);
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
    onNrc20BalancesDropdown(val) {
      this.$router.push(`/address/${val.code}`);
    },
    onNrc20BalanceDropdown() {
    },
    onError() {
      this.Nrc20Info.logo = null;
    },
    bgStyle(name) {
      if (!name) {
        return {};
      }
      const palette = [
        "#00ffff",
        "#24dbff",
        "#49b6ff",
        "#6d92ff",
        "#926dff",
        "#b649ff",
        "#db24ff",
        "#ff00ff"
      ];
      const c = name.charCodeAt(0) % palette.length;
      const backgroundColor = palette[c];
      return { color: backgroundColor };
    },
    changeTab(value) {
      let txType = "regular";
      if (value == 1) txType = "staking";
      if (value == 2) txType = "nrc20";
      if (value == 3) txType = "nrc721";
      if (value == 4) txType = "nrc721Assets";
      this.$router.replace({
        name: "AddressPage",
        query: { txType }
      });
    },
    changePage(value, nrc20QueryID) {
      this.$router.replace({
        name: "AddressPage",
        query: {
          page: value + 1,
          txType: this.$route.query.txType,
          nrc20QueryID
        }
      });
    },
    getAddress() {
      this.loading = true;
      const txs = {};
      const stakingTxs = {};

      if (this.$route.params.address.startsWith("0x")) {
        this.$route.params.address = this.$store.data.hmy.hmySDK.crypto.toBech32(
            this.$route.params.address
        );
      }
      const address = this.$route.params.address;
      const sortid = this.$route.params.nrc20QueryID;

      service
          .getNrc20Txs({
            id: address,
            pageSize: 20,
            pageIndex: this.page,
            sortid
          })
          .then(result => {
            this.nrc20Txs = result.txs;
            this.nrc20TxsCount = result.total;
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
            await this.getNRC721Data(address);
            this.nrc20BalanceUpdate();
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
    isNrc20(address) {
      return this.Nrc20Address[address] !== undefined;
    },
    isNrc721(address) {
      return (
          this.Nrc721Data &&
          this.Nrc721Data.length &&
          this.Nrc721Data.find(e => e.contractAddress === address)
      );
    },
    async getNRC721Data() {
      // todo infos

      const info = this.isNrc721(this.address.id);
      if (!info) {
        this.nrc721Transactions = [];
        this.nrc721Assets = {};
        return;
      }
      const address = info.contractAddress;

      const hmy = this.$store.data.hmy;
      const c = hmy.contract(this.$store.data.NRC721_ABI, address);
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
      const hmy = this.$store.data.hmy;
      const toHex = hmy.hmySDK.crypto.fromBech32;
      const tokens = this.$store.data.nrc721;
      this.Nrc721Balance = (
          await Promise.all(
              Object.values(tokens).map(
                  async ({ name, symbol, contractAddress }) => {
                    const c = hmy.contract(
                        this.$store.data.NRC721_ABI,
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
              this.Nrc721Balance.map(o => {
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
    async nrc20BalanceUpdate() {
      const hmy = this.$store.data.hmy;
      const toHex = hmy.hmySDK.crypto.fromBech32;

      const address = this.address.id
      if (this.isNrc20(address)) {
        let actualTotalSupply = 0;
        try {
          const c = hmy.contract(this.$store.data.NRC20_ABI, address);
          actualTotalSupply = (await c.methods.totalSupply().call()).toString();
        } catch (e) {
        }
        const decimals = (this.Nrc20Address[address] || {}).decimals;
        this.nrc20ActualTotalSupply = decimals && actualTotalSupply && displayAmount(actualTotalSupply, decimals);
      }

      const res = {};

      Promise.all(
          Object.keys(this.Nrc20Address).map(async nrc20 => {
            //for (let nrc20 in this.Nrc20Address) {
            //if (this.Nrc20Balance[nrc20]) continue;
            //console.log({nrc20});

            let c;
            try {
              c = hmy.contract(this.$store.data.NRC20_ABI, toHex(nrc20));
            } catch (e) {
              console.log({ e, nrc20 });
            }

            const nrc20Info = this.Nrc20Address[nrc20];
            let balance;

            try {
              balance = await c.methods.balanceOf(toHex(this.address.id)).call();
            } catch (e) {
              // ...
            }

            const balanceDisplay = displayAmount(balance, nrc20Info.decimals);

            return {
              [nrc20]: {
                name: nrc20Info.name,
                id: nrc20Info.symbol,
                balance: balanceDisplay,
                address: nrc20Info.address
              }
            };
          })
      )
          .then(res => res.reduce((a, o) => ({ ...a, ...o }), {}))
          .then(res => {
            this.Nrc20Balance = res;
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
