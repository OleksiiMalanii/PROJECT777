<template>
  <section class="pt-28 pb-32 pl-20 pr-6 md:pl-32 md:pr-12 text-white font-sci-fi">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-center mb-4">FORUM</h1>
    <div class="h-1 w-36 bg-white mx-auto mb-10 rounded-full"></div>

    <!-- No Posts Message -->
    <div v-if="posts.length === 0" class="text-center py-16">
      <div class="text-orange-500 text-5xl mb-4">
        <span class="material-symbols-outlined">forum</span>
      </div>
      <h3 class="text-2xl font-bold mb-2">No Posts Yet</h3>
      <p class="text-gray-400 max-w-md mx-auto">Be the first to share your thoughts!</p>
    </div>

    <!-- Forum Posts -->
    <div v-else class="mb-16 space-y-8">
      <!-- Post Item -->
      <div v-for="post in posts" :key="post.id" class="bg-gray-800 bg-opacity-50 rounded-lg p-6 shadow-lg">
        <div class="flex items-start">
          <!-- User Avatar -->
          <div class="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center mr-4">
            <span class="material-symbols-outlined text-orange-500 text-xl unselectable">person</span>
          </div>

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
            <p class="text-white mb-4">{{ post.content }}</p>

            <!-- Comments Section -->
            <div class="mt-4 border-t border-gray-700 pt-4">
              <div v-if="post.comments && post.comments.length > 0" class="space-y-4 mb-4">
                <div v-for="comment in post.comments" :key="comment.id"
                  class="bg-gray-700 bg-opacity-50 rounded-lg p-3">
                  <div class="flex items-start">
                    <div class="w-8 h-8 rounded-full border border-orange-500 flex items-center justify-center mr-3">
                      <span class="material-symbols-outlined text-orange-500 text-sm unselectable">person</span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <p class="text-orange-400 text-sm font-medium">{{ comment.author }}</p>
                        <p class="text-gray-400 text-xs">{{ formatDate(comment.timestamp) }}</p>
                      </div>
                      <p class="text-gray-200 text-sm">{{ comment.content }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Comment Form -->
              <div class="flex items-center mt-3">
                <input v-model="post.newComment" placeholder="Write a comment..." @keyup.enter="addComment(post)"
                  class="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm">
                <button @click="addComment(post)"
                  class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-r transition text-sm">
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Post Form (Fixed at bottom) -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm p-4 border-t border-gray-700 z-50">
      <div class="max-w-6xl mx-auto pb-12">
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db, auth } from '/src/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'

const posts = ref([])
const newPost = ref('')
const currentUser = ref(null)
let authUnsubscribe = null
let postsUnsubscribe = null

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

const showAlert = (message, type = 'error') => {
  const alert = document.createElement('div')
  alert.className = `fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg z-50 ${
    type === 'error' ? 'bg-red-600' : 'bg-green-600'
  } text-white font-sci-fi animate-fade-in text-center min-w-[300px] max-w-[90vw]`
  alert.textContent = message
  document.body.appendChild(alert)

  setTimeout(() => {
    alert.classList.replace('animate-fade-in', 'animate-fade-out')
    setTimeout(() => alert.remove(), 300)
  }, 3000)
}

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
        timestamp: data.timestamp || null,
        comments: data.comments || [],
        newComment: ''
      }
    })
  }, (error) => {
    console.error('Firestore error:', error)
  })
})

onUnmounted(() => {
  if (authUnsubscribe) authUnsubscribe()
  if (postsUnsubscribe) postsUnsubscribe()
})

const addPost = async () => {
  if (!newPost.value.trim()) {
    showAlert('Post cannot be empty!')
    return
  }
  if (!currentUser.value) {
    showAlert('Please sign in to post!')
    return
  }
  try {
    await addDoc(collection(db, 'forum'), {
      content: newPost.value,
      author: currentUser.value.displayName || 'Anonymous',
      userId: currentUser.value.uid,
      timestamp: serverTimestamp(),
      comments: []
    })
    newPost.value = ''
  } catch (error) {
    console.error('Error adding post:', error)
    showAlert('Failed to create post')
  }
}

const addComment = async (post) => {
  if (!post.newComment.trim()) {
    showAlert('Comment cannot be empty!')
    return
  }
  if (!currentUser.value) {
    showAlert('Please sign in to comment!')
    return
  }
  try {
    const comment = {
      content: post.newComment,
      author: currentUser.value.displayName || 'Anonymous',
      userId: currentUser.value.uid,
      timestamp: new Date(),
      id: Date.now().toString()
    }
    await updateDoc(doc(db, 'forum', post.id), {
      comments: arrayUnion(comment)
    })
    post.newComment = ''
  } catch (error) {
    console.error('Error adding comment:', error)
    showAlert('Failed to add comment')
  }
}

const deletePost = async (postId) => {
  if (!currentUser.value) {
    showAlert('Please sign in to delete posts')
    return
  }
  if (!confirm('Are you sure you want to delete this post?')) return
  try {
    await deleteDoc(doc(db, 'forum', postId))
    showAlert('Post deleted', 'success')
  } catch (error) {
    console.error('Error deleting post:', error)
    showAlert('Failed to delete post')
  }
}
</script>


<style scoped>
.unselectable {
  user-select: none;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-out forwards;
}
</style>