import fs from 'node:fs';
import path from 'node:path';
import { Annonce } from './types';

/**
 * Dépôt en mémoire, initialisé depuis data/annonces.json.
 *
 * Le sujet n'impose pas de base de données. Charger le JSON une fois au
 * démarrage garde le projet lançable sans installation, tout en isolant
 * l'accès aux données derrière une interface qu'on pourrait remplacer
 * par une vraie base sans toucher au reste du code.
 */
const CHEMIN_DONNEES = path.resolve(__dirname, '../../data/annonces.json');

let annonces: Annonce[] = [];

export function chargerDonnees(): void {
    const brut = fs.readFileSync(CHEMIN_DONNEES, 'utf-8');
    annonces = JSON.parse(brut) as Annonce[];
}

export function listerAnnonces(): Annonce[] {
    return annonces;
}

export function trouverAnnonce(id: string): Annonce | undefined {
    return annonces.find(a => a.id === id);
}