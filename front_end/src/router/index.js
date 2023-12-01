import { createRouter,createWebHistory } from "vue-router";
import Login from '../components/Login.vue'
import Main from '../components/Main.vue'

const router = createRouter({
    history: createWebHistory(),
    routes:[
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/main',
            name: 'Main',
            component: Main
        },
        {
            path: '/main',
            name: 'Main',
            component: Main,
            beforeEnter: (to, from, next) => {
                // Check if 'accessToken' is present in local storage
                if (localStorage.getItem('accessToken')) {
                    // If present, allow the navigation to /main
                    next();
                } else {
                    // If not present, redirect to /login
                    alert('Please Login')
                    next('/login');
                }
            },
        }
    ]
})

// router.beforeEach((to, from, next) => {
//     // Check if 'accessToken' is present in local storage
//     const accessToken = localStorage.getItem('accessToken');
  
//     // If 'accessToken' is not present and the route is not '/login', redirect to '/login'
//     if (!accessToken && to.path !== '/login') {
//       next('/login');
//     } else {
//       next(); // Proceed with the navigation
//     }
//   });

export default router