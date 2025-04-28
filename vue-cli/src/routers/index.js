import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import(/* webpackChunkName:"Home" */ '../views/Home.vue');
const About = () => import(/* webpackChunkName:"About" */'../views/About.vue');

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      component: Home
    },
    {
      path: '/about',
      component: About
    }
  ]
})