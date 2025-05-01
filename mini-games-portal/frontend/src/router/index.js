import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/HomeView.vue'
import LoginView from '@/components/LoginView.vue'
import HistoryView from '@/components/HistoryView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/history',
            name: 'history',
            component: HistoryView
        }
    ]
})

export default router