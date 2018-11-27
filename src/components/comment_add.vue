<template>
  <v-card flat class="container">
    <v-card-text>
      <v-layout>
        <v-flex md12>
          <div
            class="border-content"
            :class="`level-${level}`"
          >{{content}}</div>
          <v-text-field
            box
            multi-line
            label="Comment"
            v-model="comment"
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="handleAddComment" color="primary">Add comment</v-btn>
      <!-- <v-btn @click="handleGetComments" flat >Get comments</v-btn> -->
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    level: String,
    content: String,
    onAddComment: Function,
    onGetComments: Function,
  },
  data: () => {
    return {
      comment: ''
    }
  },
  methods: {
    handleAddComment() {
      this.onAddComment && this.onAddComment({
        "logdata": this.content, 
        "loglevel": this.level, 
        "logcomment": this.comment
      });
    },
    // handleGetComments() {
    //   this.onGetComments && this.onGetComments({
    //     "logdata": this.content, 
    //     "loglevel": this.level, 
    //   })
    // }
  }
};
</script>

<style scoped>
@import url('./common.css');
</style>

