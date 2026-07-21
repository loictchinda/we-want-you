import type { Annonce, AnnonceDetail, ErreurApi, Enchere  } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Erreur métier renvoyée par l'API.
 * On conserve le code et les details pour que l'appelant puisse réagir
 * autrement que par un simple message.
 *
 * Les champs sont déclarés puis assignés explicitement : le projet active
 * `erasableSyntaxOnly`, qui interdit les paramètres-propriétés du constructeur
 * (syntaxe non effaçable, donc non exécutable par un moteur qui se contente
 * de retirer les annotations de type).
 */
export class ApiError extends Error {
    readonly code: string;
    readonly statut: number;
    readonly details?: Record<string, unknown>;

    constructor(
        code: string,
        message: string,
        statut: number,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.statut = statut;
        this.details = details;
    }
}

async function requete<T>(chemin: string, options?: RequestInit): Promise<T> {
    let reponse: Response;

    try {
        reponse = await fetch(`${BASE}${chemin}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
    } catch {
        // Échec réseau : le serveur est injoignable, on n'a même pas de statut.
        throw new ApiError('RESEAU', "Impossible de joindre le serveur.", 0);
    }

    if (!reponse.ok) {
        const corps = (await reponse.json().catch(() => null)) as ErreurApi | null;
        throw new ApiError(
            corps?.code ?? 'ERREUR_INCONNUE',
            corps?.message ?? 'Une erreur est survenue.',
            reponse.status,
            corps?.details
        );
    }

    return reponse.json() as Promise<T>;
}

export const api = {
    listerAnnonces: () => requete<Annonce[]>('/api/annonces'),

    detailAnnonce: (id: string) => requete<AnnonceDetail>(`/api/annonces/${id}`),

    placerEnchere: (id: string, pseudo: string, montant: number) =>
        requete<{ enchere: Enchere; annonce: AnnonceDetail }>(
            `/api/annonces/${id}/encheres`,
            { method: 'POST', body: JSON.stringify({ pseudo, montant }) }
        ),
};