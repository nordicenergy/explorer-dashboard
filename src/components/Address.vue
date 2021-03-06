<template>
  <span>
<!--    <span
    <span
      v-if="(!nrc721Info || !isNrc20 || showRaw) && bech32"
      class="address-type-control"
      @click="toggleView()"
    >
      &#8597;&nbsp;
    </span>-->
    <router-link
      :to="'/address/' + bech32 + (staking ? '?txType=staking' : '')"
    >
      <span v-if="isNrc20 && !addressOnly" style="line-height: 11px">
        <span :style="bgStyle(nrc20Info.name)">
          <b>{{ nrc20Info.symbol }}</b>
        </span>
        <span v-if="showRaw"> ({{ displayAddress || '—' }})</span>
      </span>

      <span v-if="isNrc721 && !addressOnly" style="line-height: 11px">
        <span :style="bgStyle(nrc721Info.name)">
          <b>{{ nrc721Info.symbol }}</b>
        </span>
        <span v-if="showRaw"> ({{ displayAddress || '—' }})</span>
      </span>

      <span v-else-if="showRaw">
        {{ displayAddress || '—' }}
      </span>
      <span v-else>
        {{ displayAddress || '—' | shorten }}
      </span>
    </router-link>
    <span
      v-if="showRaw"
      class="address-type-control"
      style="font-size:1em"
      @click="copy()"
      >&#x2398;</span
    >
  </span>
</template>

<script>
import copy from 'copy-text-to-clipboard'

export default {
  name: 'Address',
  props: ['bech32', 'showRaw', 'staking', 'addressOnly'],
  data() {
    return {
      showHex: false,
    }
  },
  watch: {
    displayFormat() {
      //this.displayAddress()
    }
  },
  computed: {
    hex() {
      return this.$store.data.hmy.hmySDK.crypto.fromBech32(this.bech32)
    },
    displayFormat() {
      return this.$store.data.displayAddressETH
    },
    displayAddress() {
      return this.displayFormat ? this.hex : this.bech32
    },
    isNrc20() {
      return this.nrc20Info !== undefined
    },
    isNrc721() {
      return !!this.nrc721Info
    },
    nrc20Info() {
      return this.$store.data.Nrc20Address[this.bech32]
    },
    nrc721Info() {
      return this.$store.data.nrc721.find(
        e => e.contractAddress === this.bech32
      )
    },
  },
  mounted() {
  },
  methods: {
    copy() {
      copy(this.displayAddress)
      this.$notify({
        group: '',
        title: 'Copied to clipboard',
        position: 'top left',
      })
    },
    toggleView() {
      this.showHex = !this.showHex
    },
    onError() {
      this.nrc20Info.logo = null
    },
    bgStyle(name) {
      if (!name) {
        return {}
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
      ]
      const c = name.charCodeAt(0) % palette.length
      const backgroundColor = palette[c]
      return { color: backgroundColor }
    },
  },
}
</script>

<style scoped>
.nrclogo {
  vertical-align: middle;
  border-radius: 0.25rem;
  width: 1em;
  border: 1px solid var(--bc-dim);
}

.avatar {
  border-radius: 100%;
  display: table-cell;
  background-color: #cc9900;
  color: white;
  height: 16px;
  width: 16px;
  font-weight: bold;
  text-transform: capitalize;
  text-align: center;
  vertical-align: middle;
  font-size: 10px;
  padding: 0;
  margin: 0;
}

.address-type-control {
  color: #999;
  font-size: 0.8em;
  cursor: pointer;
  user-select: none;
}
</style>
