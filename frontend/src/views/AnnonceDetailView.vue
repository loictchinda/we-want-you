<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api, ApiError } from '../services/api';
import { useTempsRestant } from '../composables/useTempsRestant';
import type { AnnonceDetail } from '../types';

const props = defineProps<{ id: string }>();

const annonce = ref<AnnonceDetail | null>(null);
const chargement = ref(true);
const erreurChargement = ref<string | null>(null);

// État du formulaire
const pseudo = ref('');
const montant = ref<number | null>(null);
const envoi = ref(false);
const erreurEnchere = ref<ApiError | null>(null);
const succes = ref(false);

const { texte: tempsRestant, expire } = useTempsRestant(() => annonce.value?.dateFin ?? '');

/** Montant minimum accepté, calculé côté client pour guider la saisie. */
const montantMinimum = computed(() =>
    annonce.value ? annonce.value.meilleureEnchere + annonce.value.pasEnchere : 0
);

const peutEncherir = computed(() =>
    annonce.value !== null && annonce.value.statut === 'en_cours' && !expire.value
);

onMounted(async () => {
    try {
        annonce.value = await api.detailAnnonce(props.id);
    } catch (e) {
        erreurChargement.value = e instanceof ApiError ? e.message : 'Erreur inattendue.';
    } finally {
        chargement.value = false;
    }
});

async function soumettre() {
    if (!annonce.value || montant.value === null) return;

    erreurEnchere.value = null;
    succes.value = false;
    envoi.value = true;

    try {
        const reponse = await api.placerEnchere(annonce.value.id, pseudo.value, montant.value);
        // L'API renvoie l'annonce à jour : pas besoin d'un second appel.
        annonce.value = reponse.annonce;
        montant.value = null;
        succes.value = true;
    } catch (e) {
        if (e instanceof ApiError) {
            erreurEnchere.value = e;
        } else {
            erreurEnchere.value = new ApiError('INCONNU', 'Erreur inattendue.', 0);
        }
    } finally {
        envoi.value = false;
    }
}

/** Le backend renvoie le montant minimum dans details : on l'exploite. */
function prerremplirMinimum() {
    const min = erreurEnchere.value?.details?.montantMinimum;
    if (typeof min === 'number') {
        montant.value = min;
        erreurEnchere.value = null;
    }
}

function formaterEuros(m: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(m);
}

function formaterDateHeure(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}
</script>

<template>
    <RouterLink to="/" class="retour">← Toutes les annonces</RouterLink>

    <p v-if="chargement" class="etat">Chargement…</p>
    <p v-else-if="erreurChargement" class="erreur">{{ erreurChargement }}</p>

    <article v-else-if="annonce">
        <header class="entete">
            <h1>{{ annonce.titre }}</h1>
            <span class="badge" :class="annonce.statut">
                {{ annonce.statut === 'en_cours' ? 'En cours' : 'Terminée' }}
            </span>
        </header>

        <p class="description">{{ annonce.description }}</p>

        <div class="resume">
            <div>
                <span class="label">Meilleure enchère</span>
                <p class="montant">{{ formaterEuros(annonce.meilleureEnchere) }}</p>
                <span class="label">
                    Prix de départ {{ formaterEuros(annonce.prixDepart) }}
                    · pas de {{ formaterEuros(annonce.pasEnchere) }}
                </span>
            </div>
            <div class="chrono">
                <span class="label">Fin</span>
                <p>{{ formaterDateHeure(annonce.dateFin) }}</p>
                <span :class="{ urgent: !expire }">{{ tempsRestant }}</span>
            </div>
        </div>

        <!-- Formulaire d'enchère -->
        <section class="encherir">
            <h2>Placer une enchère</h2>

            <p v-if="!peutEncherir" class="info">
                Cette annonce est terminée, il n'est plus possible d'enchérir.
            </p>

            <form v-else @submit.prevent="soumettre">
                <div class="champs">
                    <label>
                        Pseudo
                        <input v-model="pseudo" type="text" required maxlength="40" />
                    </label>
                    <label>
                        Montant (€)
                        <input v-model.number="montant" type="number" :min="montantMinimum"
                            :placeholder="String(montantMinimum)" required />
                    </label>
                    <button type="submit" :disabled="envoi">
                        {{ envoi ? 'Envoi…' : 'Enchérir' }}
                    </button>
                </div>

                <p class="aide">Minimum accepté : {{ formaterEuros(montantMinimum) }}</p>

                <!-- Affichage des erreurs renvoyées par l'API -->
                <div v-if="erreurEnchere" class="erreur-api">
                    <strong>{{ erreurEnchere.message }}</strong>
                    <button v-if="typeof erreurEnchere.details?.montantMinimum === 'number'" type="button" class="lien"
                        @click="prerremplirMinimum">
                        Utiliser {{ formaterEuros(erreurEnchere.details.montantMinimum as number) }}
                    </button>
                    <span class="code">{{ erreurEnchere.code }}</span>
                </div>

                <p v-if="succes" class="succes">Votre enchère a bien été enregistrée.</p>
            </form>
        </section>

        <!-- Historique -->
        <section class="historique">
            <h2>Historique des enchères ({{ annonce.encheres.length }})</h2>

            <p v-if="annonce.encheres.length === 0" class="etat">
                Aucune enchère pour le moment.
            </p>

            <ol v-else>
                <li v-for="(e, i) in annonce.encheres" :key="`${e.pseudo}-${e.date}`" :class="{ meilleure: i === 0 }">
                    <span class="pseudo">{{ e.pseudo }}</span>
                    <span class="valeur">{{ formaterEuros(e.montant) }}</span>
                    <span class="date">{{ formaterDateHeure(e.date) }}</span>
                </li>
            </ol>
        </section>
    </article>
</template>

<style scoped>
.retour {
    font-size: 14px;
    color: #555;
    text-decoration: none;
}

.entete {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.entete h1 {
    margin-bottom: 4px;
}

.description {
    color: #555;
    line-height: 1.5;
}

.resume {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    background: #f6f7fb;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
}

.label {
    font-size: 12px;
    color: #777;
    text-transform: uppercase;
    letter-spacing: .4px;
}

.montant {
    font-size: 30px;
    font-weight: 700;
    margin: 4px 0;
}

.chrono {
    text-align: right;
}

.chrono p {
    margin: 4px 0;
}

.urgent {
    color: #b06000;
    font-weight: 600;
}

.badge {
    font-size: 12px;
    padding: 3px 9px;
    border-radius: 999px;
    white-space: nowrap;
}

.badge.en_cours {
    background: #e6f4ec;
    color: #1c6b42;
}

.badge.terminee {
    background: #f2f2f2;
    color: #666;
}

.champs {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.champs label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    gap: 4px;
}

.champs input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 15px;
}

button {
    padding: 9px 16px;
    border: 0;
    border-radius: 6px;
    background: #1e2761;
    color: #fff;
    font-size: 15px;
    cursor: pointer;
}

button:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.aide {
    font-size: 13px;
    color: #777;
    margin: 8px 0 0;
}

.erreur-api {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    background: #fdecef;
    color: #8a0018;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.erreur-api .code {
    margin-left: auto;
    font-size: 11px;
    opacity: .6;
    font-family: monospace;
}

.lien {
    background: none;
    color: #8a0018;
    text-decoration: underline;
    padding: 0;
    font-size: 14px;
}

.succes {
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    background: #e6f4ec;
    color: #1c6b42;
}

.info {
    color: #777;
    background: #f6f7fb;
    padding: 12px;
    border-radius: 6px;
}

.historique ol {
    list-style: none;
    padding: 0;
}

.historique li {
    display: flex;
    gap: 12px;
    align-items: baseline;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
}

.historique li.meilleure {
    background: #fdf8e8;
}

.pseudo {
    font-weight: 600;
}

.valeur {
    margin-left: auto;
}

.date {
    color: #888;
    font-size: 12px;
    min-width: 130px;
    text-align: right;
}

.etat {
    color: #777;
}

.erreur {
    color: #b00020;
}
</style>