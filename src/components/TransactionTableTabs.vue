<template>
  <div class="tabs">
    <span
      :class="{ tabItem: true, active: value == 0 }"
      @click="() => onChange(0)"
    >
      <span v-if="titlePostfixTx" class="postfix">{{
        titlePostfixTx | number
      }}</span>
      {{ titlePrefix }} Transactions
    </span>
    <span
      :class="{ tabItem: true, active: value == 1 }"
      @click="() => onChange(1)"
    >
      <span v-if="titlePostfixStakingTx" class="postfix">{{
        titlePostfixStakingTx | number
      }}</span>
      {{ titlePrefix }} Staking transactions
    </span>
    <span
      :class="{ tabItem: true, active: value == 2 }"
      @click="() => onChange(2)"
    >
      <span v-if="titlePostfixNRC20Tx" class="postfix">{{
        titlePostfixNRC20Tx | number
      }}</span>
      {{ titlePrefix }} NRC20 Transactions
    </span>

    <span
      v-if="shownrc721txs"
      :class="{ tabItem: true, active: value == 3 }"
      @click="() => onChange(3)"
    >
      nrc721 Transfers
    </span>

    <span
      v-if="shownrc721"
      :class="{ tabItem: true, active: value == 4 }"
      @click="() => onChange(4)"
    >
      Inventory
    </span>
  </div>
</template>

<script>
export default {
  name: 'TransactionTableTabs',
  props: [
    'shownrc721',
    'shownrc721txs',
    'value',
    'onChange',
    'titlePrefix',
    'titlePostfixTx',
    'titlePostfixStakingTx',
    'titlePostfixNRC20Tx',
    'titlePostfixPendingTx',
  ],
}
</script>

<style lang="less">
.tabs {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  .tabItem {
    cursor: pointer;
    color: #666;

    //font-size: 1.1em;
    //font-weight: 500;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-right: 30px;

    font-family: Nunito;
    font-size: 16px;
    font-weight: 500;
    //color: #997300;
    -webkit-letter-spacing: 0.5px;
    -moz-letter-spacing: 0.5px;
    -ms-letter-spacing: 0.5px;
    letter-spacing: 0.5px;

    .postfix {
      // font-size: 0.8em;
      font-weight: 400;
      display: block;
      margin-right: 6px;
    }

    &.active {
      position: relative;
      color: #b38600;
      // color: var(--color-table-link);

      &:after {
        display: nNet;
        content: '';
        position: absolute;
        width: 100%;
        height: 2px;
        background-color: var(--color-table-link);
        // background-color: #b38600;
        opacity: 0.8;
        border-radius: 10px;
        bottom: -17px;
      }
    }
  }
}
</style>
