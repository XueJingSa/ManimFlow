<template>
  <div class="time-ruler" ref="ruler" :style="{ backgroundSize: `${scale}px 100%` }">
    <div v-for="tick in ticks" :key="tick.time" class="ruler-tick" :style="{ left: `${(tick.time * scale) - offset}px` }">
      <span class="tick-label">{{ tick.time }}s</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
  duration: Number, // Total duration in seconds
  scale: Number,    // Pixels per second
  offset: Number    // Horizontal scroll offset in pixels
});

const ruler = ref(null);

const ticks = computed(() => {
  const numTicks = Math.floor(props.duration) + 1;
  const arr = [];
  for (let i = 0; i < numTicks; i++) {
    // Add more sophisticated tick logic based on scale later
    if (i % (Math.max(1, Math.floor(50 / props.scale))) === 0) { // Show label every 50px approx
         arr.push({ time: i });
    }
  }
  return arr;
});
</script>

<style scoped>
.time-ruler {
  height: 40px;
  background-color: #f8f9fa;
  position: relative;
  border-bottom: 1px solid #ccc;
  overflow: hidden;
  /* Basic grid line every 'scale' pixels */
  background-image: linear-gradient(to right, #ddd 1px, transparent 1px);
}
.ruler-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #aaa;
}
.tick-label {
  position: absolute;
  top: 5px;
  left: 2px;
  font-size: 10px;
  color: #333;
}
</style>