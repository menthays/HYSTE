<template>
  <v-card>
    <v-toolbar>
      {{"LEVEL: "+level.toUpperCase()}}
    </v-toolbar>
    <v-card-title>
      <v-layout>
        <v-flex md12>
          <v-textarea
            box
            readonly
            label="Content"
            :value="content"
          ></v-textarea>
          <v-textarea
            @paste.stop=""
            box
            label="Comment"
            v-model="comment"
          ></v-textarea>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-actions>
      <v-btn @click="handleAddComment" color="primary">Add comment</v-btn>
      <v-btn @click="handleGetComments" flat >Get comments</v-btn>
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
    handleGetComments() {
      this.onGetComments && this.onGetComments({
        "logdata": this.content, 
        "loglevel": this.level, 
      })
    }
  }
};
</script>

