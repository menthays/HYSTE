<template>
    <DynamicScroller
    :items="list"
    :min-item-height="24"
    class="scroller"
  >
    <template slot-scope="{ item, index, active }">
      <DynamicScrollerItem
        class="line"
        :item="item"
        :active="active"
        :size-dependencies="[
          item.text,
        ]"
        :data-index="index"
      >
        <div :class="'line-no '+ item.level">{{item.id}}</div>
        <div :class="'line-content ' + item.level">{{ item.text }}</div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
export default {
  props: {
    list: Array
  },
  components: {
    DynamicScroller,
    DynamicScrollerItem
  }
};
</script>

<style scoped>
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
  border: inset 1px black;
}

.warn {
  background: #ffa726;
}

.info {
  background: #64b5f6;
}

.error {
  background: #f44336;
}

.line-no {
  flex: 0 0 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: inset 1px black;
}
</style>