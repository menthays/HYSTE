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
      <v-card-text class="description">
        <label class="font-weight-bold">Level </label>
        <div>{{descriptionLevel}}</div>
        <label class="font-weight-bold">Content </label>
        <div>{{descriptionContent}}</div>
        <label class="font-weight-bold">Others </label>
        <div>{{descriptionOthers}}</div>

      </v-card-text>
      <v-card-actions>
        <v-btn @click="handleAddComment" flat color="orange">Add comment</v-btn>
        <v-btn @click="handleGetComments" flat color="orange">Get comments</v-btn>
      </v-card-actions>
    </v-card>

    <!-- dialog for add comment -->
    <v-dialog v-model="addingComments" max-width="500px">
      <v-card>
        <v-card-text>
          <div class="description">
            <label class="font-weight-bold">Level </label>
            <div>{{descriptionLevel}}</div>
            <label class="font-weight-bold">Content </label>
            <div>{{descriptionContent}}</div>
            <label class="font-weight-bold">Others </label>
            <div>{{descriptionOthers}}</div>
          </div>
          <v-divider style="margin: 10px 0"></v-divider>
          <v-textarea
            outline
            label="New comment"
            v-model="newComment"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click="handleSumbitForAdd">Submit</v-btn>
          <v-btn color="primary" flat @click="addingComments=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog for show comments -->
    <v-dialog v-model="showingComments" max-width="500px">
      <v-card>
        <v-card-text>
          <div class="description">
            <label class="font-weight-bold">Level </label>
            <div>{{descriptionLevel}}</div>
            <label class="font-weight-bold">Content </label>
            <div>{{descriptionContent}}</div>
            <label class="font-weight-bold">Others </label>
            <div>{{descriptionOthers}}</div>
          </div>
          <v-divider style="margin: 10px 0"></v-divider>
          <v-list>
            <v-list-tile :key="index" v-for="(comment, index) in responseComments">
              <v-list-tile-content>
                {{comment.comment}}
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
        <v-card-action>
          <v-btn color="primary" flat @click="showingComments=false">Close</v-btn>
        </v-card-action>
      </v-card>
    </v-dialog>

    <!-- snackbar -->
    <v-snackbar
      v-model="snackbar"
      :top="true"
      :timeout="3000"
      :color="snackbarStatus"
    >
      {{snackbarText}}
    </v-snackbar>
  </v-app>
</template>

<script>
import Scroller from "./components/scroller";
import axios from "axios"
export default {
  name: "App",
  components: {
    Scroller
  },
  data() {
    this.rawList = [];
    this.levels = ["Default", "Info", "Warn", "Error", "None"];
    return {
      list: [],
      filter: "",
      initialized: false,
      contextMenuStyle: "",
      contextMenuActive: "false",
      currentLevel: "Default",
      descriptionLevel: "",
      descriptionContent: "",
      descriptionOthers: "",
      addingComments: false,
      showingComments:false,
      newComment: '',
      responseComments: [],
      snackbar: false,
      snackbarText: '',
      snackbarStatus: 'success'
    };
  },
  methods: {
    handlePaste(e) {
      let data = e.clipboardData
        .getData("text")
        .split("\n")
        .filter(line => line !== "");
      this.rawList = data.map((line, index) => {
        return this.nativeParser(line, index);
      });
      this.list = this.rawList;
      this.initialized = true;
    },
    nativeParser(string, index) {
      const reg = /(INFO|WARN|ERROR)\s*(\([\d\s:|]+\))\s*(\d+;?)\s*(.*)/;
      let result = reg.exec(string);
      if (!result) {
        return {
          level: "none",
          id: index,
          text: string,
          others: ""
        };
      }
      return {
        id: index,
        level: result[1].toLowerCase(),
        others: result[2] + " " + result[3],
        text: result[4]
      };
    },
    handleSelect({ level, text, others }, e) {
      if (!this.initialized) {
        return;
      }
      let { clientX, clientY } = e;

      this.descriptionLevel = level;
      this.descriptionContent = text;
      this.descriptionOthers = others;
      this.contextMenuActive = true;
      if (clientY>window.innerHeight/2) {
        this.contextMenuStyle = `left: ${clientX}px; bottom: ${window.innerHeight-clientY}px;`;
      } else {
        this.contextMenuStyle = `left: ${clientX}px; top: ${clientY}px;`;
      }
    },
    handleAddComment(e) {
      e.preventDefault();
      this.contextMenuActive = false;
      this.addingComments = true
    },
    handleGetComments(e) {
      e.preventDefault();
      this.contextMenuActive = false;
      axios.get('http://115.231.168.25:6969/v1/doc/search', {
        params: {
          "logdata": this.descriptionContent, 
          "loglevel": this.descriptionLevel, 
        }
      }).then(res => res.data)
      .then(data => {
        if (data.success) {
          this.showingComments = true
          this.responseComments = data.hits
          this.snackbar = true
          this.snackbarText = 'Success'
          this.snackbarStatus = 'success'
        } else {
          this.snackbar = true
          this.snackbarText = data.err
          this.snackbarStatus = 'error'
        }
      }).catch(console.error)
    },
    handleFilter() {
      this.list = this.rawList.filter(item => {
        let search = new RegExp(this.filter, "i").test(item.text);
        let filter =
          this.currentLevel === "Default"
            ? true
            : item.level === this.currentLevel.toLowerCase();
        return search && filter;
      });
    },
    handleSumbitForAdd() {
      if (!this.newComment) {
        return
      }
      axios.post('http://115.231.168.25:6969/v1/doc/create', {
        "logdata": this.descriptionContent, 
        "loglevel": this.descriptionLevel, 
        "logcomment": this.newComment
      }).then(res => res.data)
      .then(data => {
        if (data.success) {
          this.addingComments = false
          this.snackbar = true
          this.snackbarText = 'Success'
          this.snackbarStatus = 'success'
        } else {
          this.snackbar = true
          this.snackbarText = data.err
          this.snackbarStatus = 'error'
        }
      })
      .catch(console.error)
    }
  },
  mounted() {
    this.$nextTick(() => {
      let scroller = document.querySelector("#scroller");
      scroller.addEventListener("paste", this.handlePaste);
      scroller.addEventListener("contextmenu", e => {
        e.preventDefault();
      });
      document.addEventListener(
        "click",
        () => (this.contextMenuActive = false)
      );
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
.context-menu {
  position: fixed;
  left: -999px;
  z-index: 999999;
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
</style>
