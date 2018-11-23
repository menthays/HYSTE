<template>
  <v-card :id="commentId">
    <v-toolbar :color="colorMapper(level)">
      {{"LEVEL: "+level.toUpperCase()}}
    </v-toolbar>
    <v-card-title>
      <v-layout>
        <v-flex md12>
          <v-textarea
            outline
            readonly
            label="Content"
            :value="content"
          ></v-textarea>
          <v-textarea
            outline
            readonly
            label="Comment"
            :value="comment"
          ></v-textarea>
        </v-flex>
      </v-layout>
    </v-card-title>
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
    colorMapper(level) {
      if(level === 'warn') {
        return 'warning'
      }
      return level
    }
  }
};
</script>

