import { createInstance } from '../../api/index.js';

const instance = createInstance();

const opinionStore = {
  namespaced: true,
  state: {
    opinions: null,

    //페이징 하게 10개씩 저장
    opinionPaging: {},
    pagingCnt: 0,

    opinionCategory: null,

    // 디테일 변수
    opinionData: null,

    //댓글
    opinionComment: null,
    opinionCommentPaging: {},
    opinionCommentPagingCnt: 0,

    //좋아요한 article들의 번호
    //likedOpinion: [],

  },
  getters: {},
  mutations: {
    SET_OPINIONS(state, opinions) {
      state.opinions = opinions;
    },

    SET_OPINION_PAGING(state, start) {
      state.opinionPaging = {};
      state.pagingCnt = Math.floor(state.opinionCategory.length / 10);
      if (state.opinionCategory.length % 10 != 0) state.pagingCnt++;

      let index = 0;
      for (let i = start; i < start + 10; i++) {
        if (i == state.opinionCategory.length) break;
        console.log('넣어부려' + i + ' ' + state.opinionCategory.length);
        state.opinionPaging[index++] = state.opinionCategory[i];
      }
    },

    SET_OPINION_CATEGORY(state, category) {
      state.opinionCategory = [];
      let index = 0;
      //전체 보기이면 그대로 저장
      if (category == '전체') {
        state.opinionCategory = state.opinions;
        return;
      }

      //카테고리 분류
      for (let i = 0; i < state.opinions.length; i++) {
        if (state.opinions[i].category == category) {
          state.opinionCategory[index++] = state.opinions[i];
        }
      }
    },

    SET_OPINION_DETAIL(state, opinion) {
      state.opinionData = opinion;
    },

    SET_OPINION_COMMENT(state, comment) {
      state.opinionComment = comment;
    },

    SET_OPINION_COMMENT_PAGING(state, start) {
      state.opinionCommentPaging = {};
      state.opinionCommentPagingCnt = Math.floor(state.opinionComment.length / 10);
      if (state.opinionComment.length % 10 != 0) state.opinionCommentPagingCnt++;

      let index = 0;
      for (let i = start; i < start + 10; i++) {
        if (i == state.opinionComment.length) break;
        state.opinionCommentPaging[index++] = state.opinionComment[i];
      }
    },

    //의견 LIKED 상태로 변경 << 
    // SET_OPINION_LIKED(state, id) {
    //   state.opinionLike.push(id);
    // },
    
  },
  actions: {
    //조회
    opinionList({ commit }) {
      instance
        .get('/articles/article_list')
        .then((res) => {
          commit('SET_OPINIONS', res.data);
          commit('SET_OPINION_CATEGORY', '전체');
          commit('SET_OPINION_PAGING', 0);
        })
        .catch((err) => console.log(err.response));
    },
    //생성
    opinionCreate({ dispatch }, data) {
      instance
        .post('/articles/article_create/', data)
        .then(() => {
          dispatch('opinionList');
        })
        .catch((err) => console.log(err.response));
    },

    //수정
    opinionUpdate({ commit }, data) {
      instance
        .put(`/articles/${data.id}/`, data)
        .then(() => {
          commit('SET_OPINION_DETAIL', data);
        })
        .catch((err) => console.log(err.response));
    },

    //삭제
    opinionDelete({ commit }, id) {
      instance
        .delete(`/articles/${id}/`)
        .then(() => {
          commit('SET_OPINION_DETAIL', null);
        })
        .catch((err) => console.log(err.response));
    },

    // 카테고리별로 생성
    opinionCategorySelelct({ commit }, category) {
      commit('SET_OPINION_CATEGORY', category);
      commit('SET_OPINION_PAGING', 0);
    },

    // 디테일
    opinionDetail({ commit }, id) {
      instance
        .get(`/articles/${id}`)
        .then((res) => {
          commit('SET_OPINION_DETAIL', res.data);
          commit('SET_OPINION_COMMENT', res.data.comment_set);
          commit('SET_OPINION_COMMENT_PAGING', 0);
        })
        .catch((err) => console.log(err.response));
    },

    // 댓글 등록
    opinionCommentCreate({ dispatch, state }, data) {
      instance
        .post(`/articles/${state.opinionData.id}/comments/`, data)
        .then(() => {
          dispatch('opinionDetail', state.opinionData.id);
        })
        .catch((err) => console.log(err.response));
    },

    //디테일에서 의견 따봉눌렀을 때 좋아요한 목록에 넣어주기; id(게시글번호), 유저id
    opinionLike({ dispatch, state }, data) {
      instance
        .post(`/articles/${state.opinionData.id}/like/`, data)
        .then((res) => {
          //article_artilce의 like_users의 user 추가
          if(res.data[0] == 'like'){
            state.opinionData.like_users.push(data.user);
            dispatch('opinionUpdate', state.opinionData);
          }else{  
            //article_artilce의 like_users의 user 제거
            for(var i=0; i<state.opinionData.like_users.length; i++) {
              if(state.opinionData.like_users[i] == data.user) {
                state.opinionData.like_users.splice(i, 1);
              }
            }
          }
          console.log(res.data[0])
        })
    },
  },
};

export default opinionStore;
