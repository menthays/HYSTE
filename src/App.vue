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

    <v-content id="scroller" class="log-container">
      <div
        v-if="!initialized"
        class="placeholder"
        @drop="this.handleDrop"
        @dragover="this.handleDragOver"
      >Paste your log here (Cmd/Ctrl+V)</div>
      <Scroller :onSelect="handleSelect" v-else :list="list"></Scroller>
    </v-content>

    <!-- searcher -->
    <v-toolbar v-if="initialized" class="searcher">
      <v-text-field
        v-model="filter"
        @input="handleFilter"
        class="auto-width"
        label="Search"
        append-icon="search"
      ></v-text-field>
    </v-toolbar>

    <!-- contextmenu -->
    <v-dialog v-model="contextMenuActive" width="768">
      <CommentHandler
        v-if="contextMenuActive"
        :level="selectedContent.level"
        :content="selectedContent.content"
      />
    </v-dialog>

    <!-- snackbar -->
    <v-snackbar
      v-model="snackbar"
      :top="true"
      :timeout="3000"
      :color="snackbarStatus"
    >{{snackbarText}}</v-snackbar>
  </v-app>
</template>

<script>
import Scroller from "./components/Scroller/index.vue";
import CommentHandler from "./components/CommentHandler/index.vue";
import Parser from "./utils/Parser.js";

export default {
  name: "App",

  components: {
    Scroller,
    CommentHandler
  },

  data() {
    this.rawList = [];

    this.levels = ["Default", "Info", "Warn", "Error", "None"];

    return {
      list: [],

      filter: "",

      initialized: false,

      // context menu control
      contextMenuActive: false,

      // current selected content
      selectedContent: {
        content: "",
        others: "",
        level: "none"
      },
      // snackbar control
      snackbar: false,
      snackbarText: "",
      snackbarStatus: "success",

      currentLevel: "Default"
    };
  },
  methods: {
    handleInputByPaste(e) {
      if (this.initialized) {
        this.rawList = [];
        this.list = [];
      }

      this.$nextTick(() => {
        let data = e.clipboardData
          .getData("text")
          .split("\n")
          .filter(line => line !== "");
        this.rawList = data.map((line, index) => {
          let rst = this._parser.parse(line);
          rst.id = index;
          return rst;
        });
        this.list = this.rawList;
        this.initialized = true;
      });
    },

    handleInputByFile(file) {
      if (this.initialized) {
        this.rawList = [];
        this.list = [];
      }
      let reader = new FileReader();
      reader.onload = e => {
        this.$nextTick(() => {
          let data = e.target.result
            .split("\n")
            .filter(line => line !== "");
          this.rawList = data.map((line, index) => {
            let rst = this._parser.parse(line);
            rst.id = index;
            return rst;
          });
          this.list = this.rawList;
          this.initialized = true;
        });
      };

      reader.readAsText(file);
    },

    handleSelect({ level, content, others }) {
      if (!this.initialized) {
        return;
      }

      this.selectedContent = {
        level: level,
        content: content,
        others: others
      };

      this.$nextTick(() => {
        this.openContextMenu();
      });
    },

    handleFilter() {
      let reg = new RegExp(this.filter);
      this.list = this.rawList.filter(item => {
        let search = reg.test(item.content);
        let filter =
          this.currentLevel === "Default"
            ? true
            : item.level === this.currentLevel.toLowerCase();
        return search && filter;
      });
    },

    // context menu control
    closeContextMenu() {
      this.contextMenuActive = false;
    },

    openContextMenu() {
      this.contextMenuActive = true;
    },
    // snackbar control
    openSnackbar(type, text) {
      this.snackbarText = text;
      this.snackbarStatus = type;
      this.snackbar = true;
    },

    listenToPaste() {
      document.addEventListener("paste", this.handleInputByPaste);
    },

    stopListenToPaste() {
      document.removeAllListeners("paste");
    },

    handleDrop(ev) {
      ev.preventDefault();

      if (ev.dataTransfer.items) {
        if (ev.dataTransfer.items.length > 1) {
          this.openSnackbar('error', 'No more than one file');
        }
        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
          if (ev.dataTransfer.items[i].kind === "file") {
            var file = ev.dataTransfer.items[i].getAsFile();
            this.handleInputByFile(file)
          }
        }
      } else {
        if (ev.dataTransfer.items.length > 1) {
          this.openSnackbar('error', 'No more than one file');
        }
        for (let i = 0; i < ev.dataTransfer.files.length; i++) {
          this.handleInputByFile(ev.dataTransfer.files[i])
        }
      }

      this.removeDragData(ev);
    },

    handleDragOver(ev) {
      ev.preventDefault();
    },

    removeDragData(ev) {
      if (ev.dataTransfer.items) {
        ev.dataTransfer.items.clear();
      } else {
        ev.dataTransfer.clearData();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this._parser = new Parser();
      this.listenToPaste();

      let scroller = document.querySelector("#scroller");
      scroller.addEventListener("contextmenu", e => {
        e.preventDefault();
      });
      scroller.addEventListener("click", () => this.closeContextMenu());
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
.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  color: rgba(102, 102, 102, 0.5);
}
.auto-width {
  flex: 0 0 210px;
  margin-right: 6px;
}
.description {
  font-size: 16px;
}
.searcher {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 250px;
}
.loading-container {
  height: 120px;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
}
</style>
