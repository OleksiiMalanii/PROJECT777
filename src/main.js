import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import '@fortawesome/fontawesome-free/css/all.css';

import router from './router';

const app = createApp(App);

// ✅ Register router and directive BEFORE mounting
app.use(router);

// ✅ Register the directive BEFORE mount
app.directive('click-outside', {
    beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
});

// ✅ Mount the app LAST
app.mount('#app');
