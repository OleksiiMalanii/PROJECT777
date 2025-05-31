<template>
  <section class="pt-28 pb-32 pl-20 pr-6 md:pl-32 md:pr-12 text-white font-sci-fi">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-center mb-4">FORUM</h1>
    <div class="h-1 w-48 bg-white mx-auto mb-10 rounded-full"></div>

    <!-- Forum Posts -->
    <div class="mb-16 space-y-8">
      <!-- Post Item -->
      <div v-for="post in posts" :key="post.id" class="bg-gray-800 bg-opacity-50 rounded-lg p-6 shadow-lg">
        <div class="flex items-start">
          <!-- User Avatar -->
          <div class="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center mr-4">
            <span class="material-symbols-outlined text-orange-500 text-xl unselectable">person</span>
          </div>

          <!-- Post Content -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-orange-500 font-bold">{{ post.author }}</p>
                <p class="text-gray-400 text-sm">{{ formatDate(post.timestamp) }}</p>
              </div>
              <button v-if="currentUser?.uid === post.userId" @click="deletePost(post.id)"
                class="text-gray-400 hover:text-orange-500 transition">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
            <p class="text-white">{{ post.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- New Post Form (Fixed at bottom) -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-sm p-4 mb-5 border-t border-gray-700">
      <div class="max-w-6xl mx-auto ">
        <form @submit.prevent="addPost" class="flex items-center">
          <div class="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center mr-4">
            <span class="material-symbols-outlined text-orange-500 text-xl unselectable">person</span>
          </div>
          <input v-model="newPost" placeholder="What's on your mind?" required
            class="flex-1 bg-gray-700 text-white px-6 py-3 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500">
          <button type="submit" class="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-r transition font-bold">
            POST
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { db, auth } from '/src/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export default {
  setup() {
    const posts = ref([])
    const newPost = ref('')
    const currentUser = ref(null)
    const isPosting = ref(false)
    let authUnsubscribe = null; // Declare here
    let postsUnsubscribe = null; // Declare here

    // Format date for display
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      try {
        const date = timestamp.toDate()
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      } catch {
        return 'Recent'
      }
    }

    // Fetch posts from Firebase
    onMounted(() => {
      authUnsubscribe = onAuthStateChanged(auth, (user) => {
        currentUser.value = user
      })

      const q = query(collection(db, 'forum'))
      postsUnsubscribe = onSnapshot(q, (snapshot) => {
        posts.value = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp || null
          }
        })
      }, (error) => {
        console.error("Firestore error:", error)
      })
    })

    onUnmounted(() => {
      if (authUnsubscribe) authUnsubscribe()
      if (postsUnsubscribe) postsUnsubscribe()
    })

    // Add new post
    const addPost = async () => {
      if (!newPost.value.trim()) return

      try {
        await addDoc(collection(db, 'forum'), {
          content: newPost.value,
          author: currentUser.value.displayName || 'Anonymous',
          userId: currentUser.value.uid,
          timestamp: serverTimestamp()
        })
        newPost.value = ''
      } catch (error) {
        console.error('Error adding post: ', error)
      }
    }

    // Delete post
    const deletePost = async (postId) => {
      if (!confirm('Are you sure you want to delete this post?')) return

      try {
        await deleteDoc(doc(db, 'forum', postId))
      } catch (error) {
        console.error('Error deleting post: ', error)
      }
    }

    return {
      posts,
      newPost,
      currentUser,
      formatDate,
      addPost,
      deletePost
    }
  }
}
</script>

<style scoped>
.unselectable {
  user-select: none;
}
</style>