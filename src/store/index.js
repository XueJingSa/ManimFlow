import { createStore } from 'vuex';

const store = createStore({
    state: {
      nodes: [],
      edges: [],
    },
    mutations: {
      setNodes(state, nodes) {
        state.nodes = nodes;
        // 保存到 localStorage
        localStorage.setItem('vueflow-nodes', JSON.stringify(nodes));
      },
      setEdges(state, edges) {
        state.edges = edges;
        localStorage.setItem('vueflow-edges', JSON.stringify(edges));
      },
    },
    actions: {
      updateGraphData({ commit }, { nodes, edges }) {
        commit('setNodes', nodes);
        commit('setEdges', edges);
      },
      // 初始化数据的 action
      initializeGraphData({ commit }) {
        const nodes = JSON.parse(localStorage.getItem('vueflow-nodes')) || [];
        const edges = JSON.parse(localStorage.getItem('vueflow-edges')) || [];
        commit('setNodes', nodes);
        commit('setEdges', edges);
      },
    },
  });

export default store;