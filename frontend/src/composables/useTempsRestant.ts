import { ref, computed, onUnmounted } from 'vue';

/**
 * Temps restant avant une date de fin, réévalué chaque seconde.
 * Bonus du sujet : « affichage du temps restant avant la fin de l'enchère ».
 */
export function useTempsRestant(dateFin: () => string) {
    const maintenant = ref(Date.now());

    const timer = setInterval(() => { maintenant.value = Date.now(); }, 1000);
    // Sans ce nettoyage, l'intervalle continuerait de tourner après la
    // destruction du composant et maintiendrait une référence en mémoire.
    onUnmounted(() => clearInterval(timer));

    const restantMs = computed(() => new Date(dateFin()).getTime() - maintenant.value);
    const expire = computed(() => restantMs.value <= 0);

    const texte = computed(() => {
        if (expire.value) return 'Terminée';

        const totalSecondes = Math.floor(restantMs.value / 1000);
        const jours = Math.floor(totalSecondes / 86400);
        const heures = Math.floor((totalSecondes % 86400) / 3600);
        const minutes = Math.floor((totalSecondes % 3600) / 60);
        const secondes = totalSecondes % 60;

        if (jours > 0) return `${jours} j ${heures} h restantes`;
        if (heures > 0) return `${heures} h ${minutes} min restantes`;
        return `${minutes} min ${secondes} s restantes`;
    });

    return { texte, expire };
}