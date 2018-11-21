<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title>
        <span>HYSTE</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-select
        class="auto-width"
        solo
        v-model="currentLevel"
        @change="handleFilter"
        prepend-icon="filter_list"
        style="margin-right: 6px;"
        :items="levels"
        label="Log Level"
      ></v-select>
      <v-text-field
        v-model="filter"
        @keyup.enter="handleFilter"
        class="auto-width"
        solo
        label="Search"
        append-icon="search"
      ></v-text-field>
    </v-toolbar>

    <v-content id="scroller"  class="log-container" >
      <div v-if="!initialized" class="placeholder">
        Paste your log here (Cmd/Ctrl+V)
      </div>
      <Scroller v-else :list="list"></Scroller>  
    </v-content>

    <!-- contextmenu -->
    <v-list v-show="contextMenuActive" class="context-menu" :style="contextMenuStyle">
      <v-subheader>{{`Selected: "${this.selectedContent}"`}}</v-subheader>
      <v-list-tile
        @click="handleAddComment"
      >
        <v-list-tile-title>Add comment</v-list-tile-title>
      </v-list-tile>
      <v-list-tile
        @click="handleGetComments"
      >
        <v-list-tile-title>Get comments</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-app>
</template>

<script>
import Scroller from "./components/scroller";

export default {
  name: "App",
  components: {
    Scroller
  },
  data() {
    this.rawList = [];
    this.levels = [
      "Default", "Info", "Warn", 'Error', 'Null'
    ]
    return {
      list: [],
      filter: '',
      initialized: false,
      contextMenuStyle: '',
      contextMenuActive: 'false',
      selectedContent: '',
      currentLevel: 'Default'
    };
  },
  methods: {
    handlePaste(e) {
      // console.log(e.clipboardData.getData('text'))
      this.initialized = true;
      let data = e.clipboardData.getData("text").split("\n").filter(line => line !== '');
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
    handleSelect(e) {
      e.preventDefault()
      if(!this.initialized) {
        return;
      }
      this.selectedContent = window.getSelection().toString();
      if (!this.selectedContent) {
        return;
      }
      let {clientX, clientY} = e;
      this.contextMenuActive = true
      this.contextMenuStyle = `left: ${clientX}px; top: ${clientY}px;`
    },
    handleAddComment(e) {
      e.preventDefault();
      this.contextMenuActive = false;
    },
    handleGetComments(e) {
      e.preventDefault();
      this.contextMenuActive = false;
    },
    handleFilter() {
      this.list = this.rawList.filter(item => {
        return new RegExp(this.filter, 'i').test(item.text) && item.level === this.currentLevel.toLowerCase()
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener("paste", this.handlePaste);
      document.querySelector('#scroller').addEventListener('contextmenu', this.handleSelect)
    });
  }
};
</script>

<style scoped>
.log-container {
  position: relative;
  height: 600px;
  padding: 12px 24px;
  background: rgba(222, 222, 222, 0.3);
}
.placeholder{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  color: rgba(102, 102, 102, .5);
}
.auto-width {
  flex: 0 0 210px;
}
.context-menu {
  position: fixed;
  left: -999px;
  top: -999px;
  z-index: 999999;
}
</style>
