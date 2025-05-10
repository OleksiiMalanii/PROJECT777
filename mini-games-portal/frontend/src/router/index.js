import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import HomeView    from '@/views/HomeView.vue'
import LoginView   from '@/views/LoginView.vue'
import HistoryView from '@/views/HistoryView.vue'
import GameView    from '@/views/GameView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
    { path: '/',       name: 'home',    component: HomeView },
    { path: '/login',  name: 'login',   component: LoginView },
    { path: '/history',name: 'history', component: HistoryView, meta: { requiresAuth: true } },
    { path: '/game/:name', name: 'game', component: GameView, props: true, meta: { requiresAuth: true } },
    { path: '/register', name: 'register', component: RegisterView }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    if (to.meta.requiresAuth && !userStore.username) next('/login')
    else next()
})

export default router