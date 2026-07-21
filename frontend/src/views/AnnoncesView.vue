<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, ApiError } from '../services/api';
import type { Annonce } from '../types';

const annonces = ref<Annonce[]>([]);
const chargement = ref(true);
const erreur = ref<string | null>(null);

onMounted(async () => {
    try {
        annonces.value = await api.listerAnnonces();
    } catch (e) {
        erreur.value = e instanceof ApiError ? e.message : 'Erreur inattendue.';
    } finally {
        chargement.value = false;
    }
});

function formaterEuros(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(montant);
}

function formaterDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}
</script>

<template>
    <section>
        <h1>Annonces</h1>

        <p v-if="chargement" class="etat">Chargement…</p>
        <p v-else-if="erreur" class="erreur">{{ erreur }}</p>
        <p v-else-if="annonces.length === 0" class="etat">Aucune annonce.</p>

        <ul v-else class="liste">
            <li v-for="a in annonces" :key="a.id" :class="{ terminee: a.statut === 'terminee' }">
                <RouterLink :to="`/annonces/${a.id}`">
                    <div class="entete">
                        <h2>{{ a.titre }}</h2>
                        <span class="badge" :class="a.statut">
                            {{ a.statut === 'en_cours' ? 'En cours' : 'Terminée' }}
                        </span>
                    </div>

                    <p class="description">{{ a.description }}</p>

                    <div class="pied">
                        <span class="montant">{{ formaterEuros(a.meilleureEnchere) }}</span>
                        <span class="meta">
                            {{ a.nombreEncheres }} enchère{{ a.nombreEncheres > 1 ? 's' : '' }}
                            · fin le {{ formaterDate(a.dateFin) }}
                        </span>
                    </div>
                </RouterLink>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.liste {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 12px;
}

.liste li {
    border: 1px solid #ddd;
    border-radius: 8px;
}

.liste li.terminee {
    opacity: 0.6;
}

.liste a {
    display: block;
    padding: 16px;
    text-decoration: none;
    color: inherit;
}

.liste a:hover {
    background: #f6f7fb;
}

.entete {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.entete h2 {
    margin: 0;
    font-size: 17px;
}

.description {
    color: #666;
    font-size: 14px;
    margin: 8px 0;
}

.pied {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.montant {
    font-size: 20px;
    font-weight: 700;
}

.meta {
    font-size: 13px;
    color: #666;
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

.etat,
.erreur {
    color: #666;
}

.erreur {
    color: #b00020;
}
</style>