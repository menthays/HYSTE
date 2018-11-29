<template>
  <v-card :id="commentId">
      <v-layout wrap>
        <v-flex md12>
          <div
            class="border-content"
          >
            <v-icon :color="level">{{icon}}</v-icon>
            {{content}}  
          </div>
          <div
            class="content"
          >
            {{comment}}
            <div class="float-vote">
              <v-btn @click="handleVote" flat icon :color="voted ? 'blue' : 'grey'">
                <v-icon>thumb_up</v-icon>
              </v-btn>
              <span class="vote-number">{{vote}}</span>
            </div>
          </div>
        </v-flex>
      </v-layout>
  </v-card>
</template>

<script>
export default {
  props: {
    commentId: String,
    level: String,
    content: String,
    comment: String,
    vote: Number,
    voted: Boolean,
    onVoteUp: Function,
    onVoteDown: Function,
  },
  computed: {
    icon() {
      let rst;
      switch (this.level) {
        default:
        case 'none':
          rst = 'none';
          break;
        case 'info':
          rst = 'info';
          break;
        case 'warn':
          rst = 'warning';
          break;
        case 'error':
          rst = 'error';
          break;
        case 'debug':
          rst = 'bug_report'
          break;
      };
      return rst;
    }
  },
  methods: {
    handleVote() {
      if(this.voted) {
        this.onVoteDown && this.onVoteDown(this.commentId)
      } else {
        this.onVoteUp && this.onVoteUp(this.commentId)
      }
    },
  }
};
</script>

<style scoped>
.float-vote {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.vote-number {
  font-weight: bold;
}
</style>

