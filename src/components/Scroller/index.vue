<template>
  <div class="wrapper">
    <DynamicScroller
      :emitUpdate="true"
      :items="list"
      :min-item-height="24"
      class="scroller"
    >
      <div slot="before-container" class="wrapper-float-title">
        <div class="line">
          <div class="line-no">Line</div>
          <div class="line-level">Level</div>
          <div class="line-others">Others</div>
          <div class="line-content">Content</div>
        </div>
      </div>
      <template slot-scope="{ item, index, active }">

        <DynamicScrollerItem
          class="line"
          :class="'level-'+item.level"
          :item="item"
          :active="active"
          :size-dependencies="[
            item.content,
          ]"
          :data-index="index"
        >
          <div class="line-no">{{item.id}}</div>
          <div class="line-level">{{item.level.toUpperCase()}}</div>
          <div class="line-others">{{item.others}}</div>
          <div class="line-content" @click.right="handleClick(item, $event)">{{ item.content }}</div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <!-- <VirtualScrollList :size="24" :remain="100" :variable="true">
      <div class="line" v-for="item of list" :key="item.id" :style="{ height: item.height + 'px' }" >
        <div class="line-no">{{item.id}}</div>
        <div class="line-level">{{item.level.toUpperCase()}}</div>
        <div class="line-others">{{item.others}}</div>
        <div class="line-content" @click.right="handleClick(item, $event)">{{ item.text }}</div>
      </div>
    </VirtualScrollList> -->
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

// import virtualScrollList from 'vue-virtual-scroll-list'
export default {
  props: {
    list: Array,
    onSelect: Function
  },
  components: {
    DynamicScroller,
    DynamicScrollerItem,
    // VirtualScrollList: virtualScrollList
  },
  methods: {
    // handleUpdate() {
    //   window.getSelection().removeAllRanges()
    // },
    handleClick({level, content, others}, e) {
      this.onSelect&&this.onSelect({level, content, others}, e)
    }
  }
};
</script>

<style scoped>
::selection {
  color: red;
  background: yellow;
}

.wrapper {
  position: relative;
  height: 100%;
  padding-top: 24px;
}

.wrapper-float-title {
  position: absolute;
  width: 100%;
  height: 24px;
  left: 0;
  top: 0;
  opacity: .6;
}

.scroller {
  height: 100%;
}

.line {
  display: flex;
  font-size: 16px;
}

.line-content {
  padding: 0 8px;
  width: 100%;
  user-select: none;
  border: inset 1px black;
}

.line-level,
.line-no,
.line-others {
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border: inset 1px black;
}

.line-level {
  flex: 0 0 70px;
}

.line-no {
  flex: 0 0 50px;
}

.line-others {
  flex: 0 0 200px;
}

.level-none {
  background: #EEEEEE;
}

.level-warn {
  background: #FFE0B2;
}

.level-info {
  background: #BBDEFB;
}

.level-error {
  background: #FF7043;
}
</style>