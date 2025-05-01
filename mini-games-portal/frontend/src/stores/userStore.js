import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        username: localStorage.getItem('username') || '',
        gameHistory: JSON.parse(localStorage.getItem('gameHistory') || '[]')
    }),
    actions: {
        loginUser(name) {
            this.username = name
            localStorage.setItem('username', name)
        },
        addGameToHistory(gameName) {
            const record = {
                game: gameName,
                date: new Date().toLocaleString()
            }
            this.gameHistory.push(record)
            localStorage.setItem('gameHistory', JSON.stringify(this.gameHistory))
        }
    }
})