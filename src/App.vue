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
    <AddCommentCard 
      v-if="contextMenuActive"
      class="context-menu" 
      :style="contextMenuStyle"
      :level="selectedContent.level"
      :content="selectedContent.content"
      :onAddComment="handleAddComment"
      :onGetComments="handleGetComments"
      />

    <!-- dialog for show comments -->
    <v-dialog v-model="showingComments" max-width="500px">
      <v-card>
        <v-layout>
          <v-flex md12 
            style="padding: 40px 60px; background-color: #EEE"
          >
            <DisplayCommentCard
              style="margin-bottom: 24px;"
              v-for="item in responseComments"
              :key="item.commentid"
              :commentId="item.commentid"
              :level="item.loglevel"
              :content="item.logdata"
              :comment="item.comment"
              :vote="item.vote"
              :voted="myVoteLock[item.commentid]"
              :onVoteUp="handleVote"
              :onVoteDown="handleCancelVote"
              />
          </v-flex>
          <!-- <v-flex v-else>
            No comments found
          </v-flex> -->
        </v-layout>
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
import AddCommentCard from "./components/comment_add";
import DisplayCommentCard from "./components/comment_display";
import axios from "axios"
export default {
  name: "App",
  components: {
    Scroller, AddCommentCard, DisplayCommentCard
  },
  data() {
    this.rawList = [];
    this.levels = ["Default", "Info", "Warn", "Error", "None"];
    return {
      list: [],
      filter: "",
      initialized: false,
      // context menu control
      contextMenuStyle: "",
      contextMenuActive: false,
      // current selected content
      selectedContent: {
        content: '',
        others: '',
        level: 'none'
      },
      // snackbar control
      snackbar: false,
      snackbarText: '',
      snackbarStatus: 'success',

      currentLevel: "Default",

      // show comments control
      showingComments:false,
      responseComments: [],

      // my vote control
      myVoteLock: {}
    };
  },
  methods: {
    handlePaste(e) {
      if (this.initialized) {
        this.rawList = []
        this.list = []
      }
      this.$nextTick(() => {
        let data = e.clipboardData
          .getData("text")
          .split("\n")
          .filter(line => line !== "");
        this.rawList = data.map((line, index) => {
          return this.nativeParser(line, index);
        });
        this.list = this.rawList;
        this.initialized = true;
      })

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

      this.selectedContent = {
        level: level,
        content: text,
        others: others
      }
      
      if (clientY>window.innerHeight/2) {
        this.openContextMenu(`left: ${clientX}px; bottom: ${window.innerHeight-clientY}px;`)
      } else {
        this.openContextMenu(`left: ${clientX}px; top: ${clientY}px;`)
      }
    },
    handleAddComment({logdata, loglevel, logcomment}) {
      if (!logcomment) {
        return
      }
      axios.post('http://webdemo.agora.io/hyste_service/v1/doc/create', {
        logdata, loglevel, logcomment
      })
        .then(res => res.data)
        .then(data => {
          if (data.success) {
            this.openSnackbar('success', 'Add comment successfully!')
          } else {
            this.openSnackbar('error', 'Failed to add Comment!')
          }
        })
        .then(this.closeContextMenu())
        .catch(this.closeContextMenu())
        .catch(this.globalErrorHandler)
    },
    handleGetComments({logdata, loglevel}) {
      this.closeContextMenu()
      axios.get('http://webdemo.agora.io/hyste_service/v1/doc/search', {
        params: {
          logdata,
          loglevel
        }
      }).then(res => res.data)
      .then(data => {
        if (data.success) {
          this.responseComments = data.hits
          if (this.responseComments.length === 0) {
            this.openSnackbar('warning', 'No related comments found')
          } else {
            this.showingComments = true
            this.openSnackbar('success', 'Get comments successfully!')
          }
        } else {
          this.openSnackbar('error', 'Failed to get comments')
        }
      }).catch(this.globalErrorHandler)
    },

    handleVote(commentId) {
      if (this.myVoteLock[commentId]) {
        return
      } else {
        let vm = this
        this.myVoteLock[commentId] = true
        this.trySaveVoteLock();
        axios.post('http://115.231.168.25:6969/v1/doc/vote', {
          commentid: commentId,
          inc: true
        }).then(res => {
          vm.openSnackbar('success', 'Vote up!')
          let index = vm.responseComments.findIndex(item => item.commentid === commentId)
          vm.responseComments[index].vote = res.data.vote
        }).catch(() => {
          vm.openSnackbar('error', 'Failed')
        })
      }
    },
    
    handleCancelVote(commentId) {
      if (!this.myVoteLock[commentId]) {
        return
      } else {
        let vm = this
        this.myVoteLock[commentId] = false
        this.trySaveVoteLock()
        axios.post('http://115.231.168.25:6969/v1/doc/vote', {
          commentid: commentId,
          inc: false
        }).then(res => {
          vm.openSnackbar('success', 'Vote down!')
          let index = vm.responseComments.findIndex(item => item.commentid === commentId)
          vm.responseComments[index].vote = res.data.vote
        }).catch(() => {
          vm.openSnackbar('error', 'Failed')
        })
      }
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
    globalErrorHandler(err) {
      if (err instanceof Error) {
        this.openSnackbar('error', err.toString())
      } else {
        this.openSnackbar('error', JSON.stringify(err))
      }
    },
    // context menu control
    closeContextMenu() {
      this.contextMenuActive = false
    },
    openContextMenu(positionStyle) {
      this.contextMenuActive = true
      this.contextMenuStyle = positionStyle
    },
    // snackbar control
    openSnackbar(type, text) {
      this.snackbarText = text
      this.snackbarStatus = type
      this.snackbar = true
    },

    tryGetVoteLock() {
      try {
        this.myVoteLock= JSON.parse(window.localStorage.getItem('myVoteLock')) || {};
      } catch(err) {
        this.myVoteLock = {};
      }
    },

    trySaveVoteLock() {
      this.$nextTick(() => {
        window.localStorage.setItem('myVoteLock', JSON.stringify(this.myVoteLock))
      });
    },
    listenToPaste() {
      document.addEventListener("paste", this.handlePaste);
    },
    stopListenToPaste() {
      document.removeAllListeners('paste')
    }
  },
  mounted() {
    this.$nextTick(() => {
      let scroller = document.querySelector("#scroller");
      this.listenToPaste()
      scroller.addEventListener("contextmenu", e => {
        e.preventDefault();
      });
      scroller.addEventListener(
        "click",
        () => (this.closeContextMenu())
      );
    });
  },
  created() {
    this.tryGetVoteLock();
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
