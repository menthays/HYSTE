<template>
  <v-card>
    <v-layout wrap>
      <!-- title -->
      <v-toolbar>
        <div
          class="title"
        >
          Search for {{content}}
          <span v-if="responseComments.length">{{` , ${responseComments.length} results`}} </span> 
        </div>
      </v-toolbar>

      <!-- show comment -->
      <v-flex md12 v-if="showingComments">
        <div v-if="!responseComments.length" class="comment-container">
          No related comments found
        </div>
        <div class="comment-container" v-else>
          <DisplayCommentCard
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
        </div>
      </v-flex>

      <v-flex class="loading-container" md12 v-else>
        <v-progress-circular
          style="margin-bottom: 12px;"
          indeterminate
          color="primary"
        ></v-progress-circular>
        Getting Comments...
      </v-flex>


      <!-- add comment -->
      <v-flex md12>
        <v-card>
          <v-card-text>
            <v-layout>
              <v-flex md12>
                <v-textarea box label="Comment" v-model="comment"></v-textarea>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="handleAddComment" color="primary">Add comment</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import axios from 'axios';
import DisplayCommentCard from "./display.vue";
export default {
  components: {
    DisplayCommentCard
  },
  props: {
    level: String,
    content: String,
  },
  data: () => {
    return {
      comment: "",
      myVoteLock: {},

      showingComments: false,
      responseComments: []
    };
  },
  methods: {
    handleAddComment() {
      if (!this.comment) {
        return;
      }
      axios
        .post("https://webdemo.agora.io/hyste_service/v1/doc/create", {
          logdata: this.content,
          loglevel: this.level,
          logcomment: this.comment
        })
        .then(res => res.data)
        .then(data => {
          if (data.success) {
            // this.openSnackbar("success", "Add comment successfully!");
          } else {
            // this.openSnackbar("error", "Failed to add Comment!");
          }
        })
        // .then(this.closeContextMenu())
        // .catch(this.closeContextMenu())
        // .catch(this.globalErrorHandler);
    },

    handleGetComments() {
      this.showingComments = false;
      let logdata = this.content;
      let loglevel = this.level
      axios
        .get("https://webdemo.agora.io/hyste_service/v1/doc/search", {
          params: {
            logdata,
            loglevel
          }
        })
        .then(res => res.data)
        .then(data => {
          if (data.success) {
            this.responseComments = data.hits;
            if (this.responseComments.length === 0) {
              // this.openSnackbar("warning", "No related comments found");
            } else {
              // this.openSnackbar("success", "Get comments successfully!");
            }
          } else {
            // this.openSnackbar("error", "Failed to get comments");
          }
          this.showingComments = true
        })
        .catch(err => {
          this.showingComments = true
        });
    },

    handleVote(commentId) {
      if (this.myVoteLock[commentId]) {
        return;
      } else {
        let vm = this;
        this.myVoteLock[commentId] = true;
        this.trySaveVoteLock();
        axios
          .post("https://webdemo.agora.io/hyste_service/v1/doc/vote", {
            commentid: commentId,
            inc: true
          })
          .then(res => {
            // vm.openSnackbar("success", "Vote up!");
            let index = vm.responseComments.findIndex(
              item => item.commentid === commentId
            );
            vm.responseComments[index].vote = res.data.vote;
          })
          .catch(() => {
            // vm.openSnackbar("error", "Failed");
          });
      }
    },

    handleCancelVote(commentId) {
      if (!this.myVoteLock[commentId]) {
        return;
      } else {
        let vm = this;
        this.myVoteLock[commentId] = false;
        this.trySaveVoteLock();
        axios
          .post("https://webdemo.agora.io/hyste_service/v1/doc/vote", {
            commentid: commentId,
            inc: false
          })
          .then(res => {
            // vm.openSnackbar("success", "Vote down!");
            let index = vm.responseComments.findIndex(
              item => item.commentid === commentId
            );
            vm.responseComments[index].vote = res.data.vote;
          })
          .catch(() => {
            // vm.openSnackbar("error", "Failed");
          });
      }
    },

    tryGetVoteLock() {
      try {
        this.myVoteLock =
          JSON.parse(window.localStorage.getItem("myVoteLock")) || {};
      } catch (err) {
        this.myVoteLock = {};
      }
    },

    trySaveVoteLock() {
      this.$nextTick(() => {
        window.localStorage.setItem(
          "myVoteLock",
          JSON.stringify(this.myVoteLock)
        );
      });
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.handleGetComments()
      console.warn('Mounted')
    })
  },

  created() {
    this.tryGetVoteLock();
  }
};
</script>

<style scoped>
@import url("./common.css");

.loading-container {
  height: 120px;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
}

.title {
  font-weight: bold;
  font-size: 20px;
}
</style>

