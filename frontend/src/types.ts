export interface Enchere {
    pseudo: string;
    montant: number;
    date: string;
}

export type StatutAnnonce = 'en_cours' | 'terminee';

export interface Annonce {
    id: string;
    titre: string;
    description: string;
    prixDepart: number;
    pasEnchere: number;
    dateFin: string;
    meilleureEnchere: number;
    nombreEncheres: number;
    statut: StatutAnnonce;
}

export interface AnnonceDetail extends Annonce {
    encheres: Enchere[];
}

/** Erreur renvoyée par l'API, au format { code, message, details? }. */
export interface ErreurApi {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}