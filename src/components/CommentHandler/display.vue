<template>
  <v-card :id="commentId">
    <v-card-text>
      <v-layout wrap>
        <v-flex md12>
          <div
            class="border-content"
            :class="`level-${level}`"
          >{{content}}</div>
          <div
            class="content"
          >{{comment}}</div>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="handleVote" flat icon :color="voted ? 'blue' : 'grey'">
        <v-icon>thumb_up</v-icon>
      </v-btn>
      <span>{{vote}}</span>
    </v-card-actions>
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
