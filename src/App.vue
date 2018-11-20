<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title>
        <span>HYSTE</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="filter"
        @keyup.enter="handleFilter"
        class="search"
        solo
        label="Search"
        append-icon="search"
      ></v-text-field>
    </v-toolbar>

    <v-content class="log-container">
      <Scroller :list="list"></Scroller>  
    </v-content>
  </v-app>
</template>

<script>
import Scroller from "./components/scroller";

export default {
  name: "App",
  components: {
    Scroller
  },
  methods: {
    handlePaste(e) {
      // console.log(e.clipboardData.getData('text'))
      let data = e.clipboardData.getData("text").split("\n");
      this.rawList = data.map((line, index) => {
        let levelReg = /^(INFO|ERROR|WARN)/.exec(line);
        return {
          id: index,
          level: levelReg ? levelReg[0].toLowerCase() : "null",
          text: line
        };
      });
      this.list = this.rawList
    },
    handleFilter() {
      this.list = this.rawList.filter(item => new RegExp(this.filter, 'i').test(item.text))
    }
  },
  data() {
    this.rawList = [];
    return {
      list: [],
      filter: '',
    };
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener("paste", this.handlePaste);
    });
  }
};
</script>

<style scoped>
.log-container {
  height: 800px;
  padding: 12px 24px;
  background: rgba(222, 222, 222, 0.3);
}
.search {
  flex: 0 1 auto;
}
</style>
