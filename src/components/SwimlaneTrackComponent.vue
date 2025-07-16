<template>
  <div class="swimlane-track" @dragover.prevent="handleDragOver" @drop.prevent="handleDropOnTrack">
    <div v-if="trackData.animationClips.length === 0 && trackData.generateBlockType !== 'Wait'" class="empty-track-message">
      Drag '动画块' here or <el-button size="small" @click="addClip">Add Clip</el-button>
    </div>
    
    <!-- For Wait type tracks, show a single block representing the wait duration -->
    <div v-if="trackData.generateBlockType === 'Wait'"
         class="animation-clip wait-clip"
         :style="waitClipStyle"
         @click.stop="$emit('select-clip', trackData.id, trackData.id)" 
         title="Wait Action">
      Wait: {{ trackData.generateBlockParams.params.duration }}s
    </div>

    <!-- For regular tracks with animation clips -->
    <div v-else
      v-for="clip in trackData.animationClips"
      :key="clip.id"
      class="animation-clip"
      :style="getClipStyle(clip)"
      @click.stop="$emit('select-clip', trackData.id, clip.id)"
      draggable="true"
      @dragstart="event => handleClipDragStart(event, clip.id)"
      @dragend="handleClipDragEnd"
    >
      <div class="clip-name" :title="`${clip.type} - ${clip.id}`">{{ clip.type }}</div>
      <div class="clip-duration">{{ clip.duration.toFixed(1) }}s</div>
       <el-button class="delete-clip-btn" icon="CloseBold" size="small" circle plain @click.stop="$emit('delete-clip', trackData.id, clip.id)"></el-button>
      <!-- Resizers (simplified) -->
      <div class="resizer left" @mousedown.stop="event => startResize(event, clip.id, 'left')"></div>
      <div class="resizer right" @mousedown.stop="event => startResize(event, clip.id, 'right')"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  trackData: Object,
  timelineScale: Number,
  timelineOffset: Number,
  totalDuration: Number,
});
const emit = defineEmits(['select-clip', 'update-clip-time', 'add-new-clip-to-track', 'delete-clip']);

const isDraggingClip = ref(false);
const dragClipId = ref(null);
const dragStartX = ref(0);
const originalClipStart = ref(0);

const isResizing = ref(false);
const resizeClipId = ref(null);
const resizeEdge = ref(''); // 'left' or 'right'
const resizeStartX = ref(0);
const originalClipMetrics = ref({ startTime: 0, duration: 0 });


const waitClipStyle = computed(() => {
  if (props.trackData.generateBlockType === 'Wait' && props.trackData.generateBlockParams.params) {
    const params = props.trackData.generateBlockParams.params;
    const left = (params.start_time * props.timelineScale) - props.timelineOffset;
    const width = params.duration * props.timelineScale;
    return {
      left: `${left}px`,
      width: `${width}px`,
      backgroundColor: '#67c23a', // Distinct color for Wait
    };
  }
  return {};
});


function getClipStyle(clip) {
  const left = (clip.startTime * props.timelineScale) - props.timelineOffset;
  const width = clip.duration * props.timelineScale;
  return {
    left: `${left}px`,
    width: `${width}px`,
  };
}

function addClip() {
    const dropTime = props.trackData.animationClips.length > 0 
        ? props.trackData.animationClips[props.trackData.animationClips.length - 1].startTime + props.trackData.animationClips[props.trackData.animationClips.length - 1].duration
        : 0;
  emit('add-new-clip-to-track', { trackId: props.trackData.id, dropTime });
}

function handleDragOver(event) {
  // Check if dataTransfer has the animation block type
  if (event.dataTransfer.types.includes("application/manimflow-block")) {
     const type = event.dataTransfer.getData("application/manimflow-block");
     if (type === 'animation') {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
     }
  } else if (isDraggingClip.value) { // Allow dropping dragged clip
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
}

function handleDropOnTrack(event) {
  event.preventDefault();
  const type = event.dataTransfer.getData("application/manimflow-block");

  if (type === 'animation') {
    const rect = event.currentTarget.getBoundingClientRect();
    const dropX = event.clientX - rect.left;
    const dropTime = (dropX + props.timelineOffset) / props.timelineScale;
    emit('add-new-clip-to-track', { trackId: props.trackData.id, dropTime: Math.max(0, dropTime) });
  } else if (dragClipId.value) { // Dropping an existing clip
    const deltaX = event.clientX - dragStartX.value;
    const deltaTime = deltaX / props.timelineScale;
    const newStartTime = Math.max(0, originalClipStart.value + deltaTime);
    const clipToMove = props.trackData.animationClips.find(c => c.id === dragClipId.value);
    if (clipToMove) {
        emit('update-clip-time', {
            trackId: props.trackData.id,
            clipId: dragClipId.value,
            startTime: newStartTime,
            duration: clipToMove.duration // Duration doesn't change on move
        });
    }
    dragClipId.value = null;
  }
}

function handleClipDragStart(event, clipId) {
    isDraggingClip.value = true;
    dragClipId.value = clipId;
    dragStartX.value = event.clientX;
    const clip = props.trackData.animationClips.find(c => c.id === clipId);
    originalClipStart.value = clip ? clip.startTime : 0;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", clipId); // Necessary for Firefox
}
function handleClipDragEnd() {
    isDraggingClip.value = false;
    // dragClipId.value = null; // Reset in drop handler
}


function startResize(event, clipId, edge) {
    isResizing.value = true;
    resizeClipId.value = clipId;
    resizeEdge.value = edge;
    resizeStartX.value = event.clientX;
    const clip = props.trackData.animationClips.find(c => c.id === clipId);
    if (clip) {
        originalClipMetrics.value = { startTime: clip.startTime, duration: clip.duration };
    }
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

function doResize(event) {
    if (!isResizing.value) return;
    const deltaX = event.clientX - resizeStartX.value;
    const deltaTime = deltaX / props.timelineScale;
    let newStartTime = originalClipMetrics.value.startTime;
    let newDuration = originalClipMetrics.value.duration;

    if (resizeEdge.value === 'left') {
        newStartTime = Math.max(0, originalClipMetrics.value.startTime + deltaTime);
        newDuration = Math.max(0.1, originalClipMetrics.value.duration - (newStartTime - originalClipMetrics.value.startTime));
    } else { // right
        newDuration = Math.max(0.1, originalClipMetrics.value.duration + deltaTime);
    }
    emit('update-clip-time', { trackId: props.trackData.id, clipId: resizeClipId.value, startTime: newStartTime, duration: newDuration });
}

function stopResize() {
    isResizing.value = false;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
}

</script>

<style scoped>
.swimlane-track {
  height: 40px; /* Match track header item height or define standard track height */
  position: relative;
  border-bottom: 1px dashed #e0e0e0;
  background-color: white;
}
.swimlane-track:hover {
  background-color: #f9f9f9;
}
.empty-track-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  font-size: 12px;
}
.animation-clip {
  position: absolute;
  top: 5px;
  bottom: 5px;
  background-color: #409EFF;
  color: white;
  border-radius: 4px;
  padding: 0 5px;
  font-size: 12px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  border: 1px solid #005bb5;
}
.animation-clip.wait-clip {
  justify-content: center; /* Center text for wait clips */
}
.clip-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 5px;
}
.clip-duration {
  font-size: 10px;
  opacity: 0.8;
}
.delete-clip-btn {
    position: absolute;
    top: 1px;
    right: 1px;
    padding: 2px !important;
    min-height: auto !important;
    height: auto !important;
    opacity: 0.5;
}
.animation-clip:hover .delete-clip-btn {
    opacity: 1;
}
.resizer {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 5px;
    cursor: ew-resize;
    /* background-color: rgba(0,0,0,0.1); */ /* For visibility */
}
.resizer.left { left: 0; }
.resizer.right { right: 0; }
</style>