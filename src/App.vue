<template>
  <v-app>
    <v-toolbar app>
      <v-btn icon>
        <v-icon>settings</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span>HYSTE</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-select
        class="auto-width"
        v-model="currentLevel"
        @change="handleFilter"
        prepend-icon="filter_list"
        :items="levels"
      ></v-select>
    </v-toolbar>

    <v-content id="scroller"  class="log-container" >
      <div v-if="!initialized" class="placeholder">
        Paste your log here (Cmd/Ctrl+V)
      </div>
      <Scroller :onSelect="handleSelect" v-else :list="list"></Scroller>  
    </v-content>

    <!-- searcher -->
    <v-toolbar
      v-if="initialized"
      class="searcher"
    >
      <v-text-field
        v-model="filter"
        @keyup.enter="handleFilter"
        class="auto-width"
        label="Search"
        append-icon="search"
      ></v-text-field>
    </v-toolbar>

    <!-- contextmenu -->
    <v-card v-show="contextMenuActive" class="context-menu" :style="contextMenuStyle">
      <v-card-title v-html="this.selectedContent">

      </v-card-title>
      <v-list >
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
    </v-card>
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
      let data = e.clipboardData.getData("text").split("\n").filter(line => line !== '');
      this.rawList = data.map((line, index) => {
        return this.nativeParser(line, index)
      });
      this.list = this.rawList
      this.initialized = true;
    },
    nativeParser(string, index) {
      const reg = /(INFO|WARN|ERROR)\s*(\([\d\s:|]+\))\s*(\d+;?)\s*(.*)/;
      let result = reg.exec(string);
      if (!result) {
        return {
          level: 'null',
          id: index,
          text: string,
          others: ''
        }
      }
      return {
        id: index,
        level: result[1].toLowerCase(),
        others: result[2]+' '+result[3],
        text: result[4]
      }
    },
    handleSelect({level, text, others}, e) {
      if(!this.initialized) {
        return;
      }
      let {clientX, clientY} = e;

      this.selectedContent = `Level: ${level} </br> Content: ${text} </br> Others: ${others}`;
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
        let search = new RegExp(this.filter, 'i').test(item.text);
        let filter = this.currentLevel === 'Default' ? true : item.level === this.currentLevel.toLowerCase();
        return search && filter
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener("paste", this.handlePaste);
      document.querySelector('#scroller').addEventListener('contextmenu', (e) => {e.preventDefault()})
      document.addEventListener("click", () => this.contextMenuActive = false)
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
  margin-right: 6px;
}
.context-menu {
  position: fixed;
  left: -999px;
  top: -999px;
  z-index: 999999;
}
.searcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 250px;
}
</style>
