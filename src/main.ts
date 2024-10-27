import { createApp } from 'vue';
import './assets/style.css';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(ToastService);
app.use(PrimeVue);
app.use(router);
app.mount('#app');
