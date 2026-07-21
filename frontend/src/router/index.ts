import { createRouter, createWebHistory } from 'vue-router';
import AnnoncesView from '../views/AnnoncesView.vue';

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'annonces', component: AnnoncesView },
        {
            path: '/annonces/:id',
            name: 'annonce-detail',
            // Chargement différé : la vue détail n'est téléchargée qu'au besoin.
            component: () => import('../views/AnnonceDetailView.vue'),
            props: true,
        },
    ],
});