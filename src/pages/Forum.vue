<template>
  <section class="pt-20 pb-32 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32 text-white font-sci-fi">
    <!-- Title -->
    <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">FORUM</h1>
    <div class="h-1 w-24 sm:w-32 md:w-36 bg-white mx-auto mb-6 sm:mb-8 md:mb-10 rounded-full"></div>

    <!-- No Posts Message -->
    <div v-if="posts.length === 0" class="text-center py-8 sm:py-12 md:py-16">
      <div class="text-orange-500 text-3xl sm:text-4xl md:text-5xl mb-4">
        <span class="material-symbols-outlined">forum</span>
      </div>
      <h3 class="text-lg sm:text-xl md:text-2xl font-bold mb-2">No Posts Yet</h3>
      <p class="text-gray-400 max-w-md mx-auto text-sm sm:text-base px-4">Be the first to share your thoughts!</p>
    </div>

    <!-- Forum Posts -->
    <div v-else class="mb-16 space-y-4 sm:space-y-6 md:space-y-8">
      <!-- Post Item -->
      <div v-for="post in posts" :key="post.id" class="bg-gray-800 bg-opacity-50 rounded-lg p-4 sm:p-5 md:p-6 shadow-lg">
        <div class="flex items-start space-x-3 sm:space-x-4">
          <!-- User Avatar -->
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-orange-500 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-orange-500 text-lg sm:text-xl unselectable">person</span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <p class="text-orange-500 font-bold text-sm sm:text-base truncate">{{ post.author }}</p>
                <p class="text-gray-400 text-xs sm:text-sm">{{ formatDate(post.timestamp) }}</p>
              </div>
              <button v-if="currentUser?.uid === post.userId" @click="deletePost(post.id)"
                      class="text-gray-400 hover:text-orange-500 transition ml-2 flex-shrink-0">
                <span class="material-symbols-outlined text-lg sm:text-xl">delete</span>
              </button>
            </div>
            <p class="text-white mb-3 sm:mb-4 text-sm sm:text-base break-words">{{ post.content }}</p>

            <!-- Comments Section -->
            <div class="mt-3 sm:mt-4 border-t border-gray-700 pt-3 sm:pt-4">
              <div v-for="comment in post.comments" :key="comment.id"
                class="bg-gray-700 bg-opacity-50 rounded-lg p-3">
                <div class="flex items-start">
                  <div class="w-8 h-8 rounded-full border border-orange-500 flex items-center justify-center mr-3">
                    <span class="material-symbols-outlined text-orange-500 text-sm unselectable">person</span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <p class="text-orange-400 text-sm font-medium">{{ comment.author }}</p>
                      <div class="flex items-center gap-2">
                        <p class="text-gray-400 text-xs">{{ formatDate(comment.timestamp) }}</p>
                        <button v-if="currentUser?.uid === comment.userId"
                          @click="deleteComment(post.id, comment.id)"
                          class="text-gray-400 hover:text-red-500 transition text-sm"
                          title="Delete comment">
                          <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                    <p class="text-gray-200 text-sm">{{ comment.content }}</p>
                  </div>
                </div>
              </div>


              <!-- Add Comment Form -->
              <div class="flex items-stretch mt-3">
                <input v-model="post.newComment" placeholder="Write a comment..." @keyup.enter="addComment(post)"
                       class="flex-1 bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs sm:text-sm min-w-0">
                <button @click="addComment(post)"
                        class="bg-orange-500 hover:bg-orange-600 px-3 sm:px-4 py-2 rounded-r transition text-xs sm:text-sm font-medium whitespace-nowrap">
                  <span class="hidden sm:inline">Comment</span>
                  <span class="sm:hidden">💬</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Post Form (Fixed at bottom) -->
    <div class="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-t border-gray-700 z-50">
      <div class="p-3 sm:p-4 pb-safe">
        <div class="max-w-6xl mx-auto">
          <form @submit.prevent="addPost" class="flex items-stretch space-x-2 sm:space-x-4">
            <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-500 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-orange-500 text-sm sm:text-lg md:text-xl unselectable">person</span>
            </div>
            <input v-model="newPost" placeholder="What's on your mind?" required
                   class="flex-1 bg-gray-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-l focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm sm:text-base min-w-0">
            <button type="submit" class="bg-orange-500 hover:bg-orange-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-r transition font-bold text-sm sm:text-base whitespace-nowrap">
              <span class="hidden sm:inline">POST</span>
              <span class="sm:hidden">📝</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db, auth } from '/src/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore'

const posts = ref([])
const newPost = ref('')
const currentUser = ref(null)
let authUnsubscribe = null
let postsUnsubscribe = null

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  try {
    const date = timestamp.toDate()
    const isSmallScreen = window.innerWidth < 640
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isSmallScreen ? '2-digit' : 'numeric',
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
  alert.className = `fixed top-5 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 rounded-md shadow-lg z-50 ${
      type === 'error' ? 'bg-red-600' : 'bg-green-600'
  } text-white font-sci-fi animate-fade-in text-center text-sm sm:text-base max-w-[90vw] sm:max-w-[400px]`
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
    }).sort((a, b) => {
      // Sort by timestamp, oldest first
      if (!a.timestamp && !b.timestamp) return 0
      if (!a.timestamp) return -1
      if (!b.timestamp) return 1
      return a.timestamp.toDate() - b.timestamp.toDate()
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

const deleteComment = async (postId, commentId) => {
  if (!currentUser.value) {
    showAlert('Please sign in to delete comments')
    return
  }

  if (!confirm('Are you sure you want to delete this comment?')) return

  try {
    const postRef = doc(db, 'forum', postId)
    const postSnap = await getDoc(postRef)
    if (!postSnap.exists()) throw new Error('Post not found')

    const postData = postSnap.data()
    const updatedComments = postData.comments.filter(comment => comment.id !== commentId)

    await updateDoc(postRef, { comments: updatedComments })

    showAlert('Comment deleted', 'success')
  } catch (error) {
    console.error('Error deleting comment:', error)
    showAlert('Failed to delete comment')
  }
}

</script>

<style scoped>
.unselectable {
  user-select: none;
}

/* Safe area for devices with notches */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-out forwards;
}

/* Mobile-specific improvements */
@media (max-width: 640px) {
  /* Prevent zoom on input focus */
  input {
    font-size: 16px;
  }

  /* Better touch targets */
  button {
    min-height: 44px;
  }

  /* Improve readability on small screens */
  .break-words {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}

/* Tablet improvements */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Optimize layout for tablet */
  .space-x-4 > * + * {
    margin-left: 1rem;
  }
}

/* Large screen improvements */
@media (min-width: 1025px) {
  /* Better spacing on large screens */
  .max-w-6xl {
    max-width: 72rem;
  }
}

/* Dark mode support for system preference */
@media (prefers-color-scheme: dark) {
  /* Already using dark theme, no changes needed */
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border-orange-500 {
    border-width: 3px;
  }

  .bg-opacity-50 {
    background-opacity: 0.8;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-fade-out {
    animation: none;
  }

  .transition {
    transition: none;
  }
}
</style>