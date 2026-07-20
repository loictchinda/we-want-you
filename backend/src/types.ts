/** Une enchère placée sur une annonce. */
export interface Enchere {
    pseudo: string;
    montant: number;
    date: string;          // ISO 8601
}

/** Une annonce telle que stockée (structure du fichier data/annonces.json). */
export interface Annonce {
    id: string;
    titre: string;
    description: string;
    prixDepart: number;
    pasEnchere: number;
    dateFin: string;       // ISO 8601
    encheres: Enchere[];
}

export type StatutAnnonce = 'en_cours' | 'terminee';

/** Une annonce telle qu'exposée par l'API : enrichie de champs calculés. */
export interface AnnoncePublique {
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

/** Détail d'une annonce : la vue publique enrichie de l'historique. */
export interface AnnonceDetail extends AnnoncePublique {
    encheres: Enchere[];   // de la plus récente à la plus ancienne
}

/** Format unique des réponses d'erreur de l'API. */
export interface ErreurApi {
    code: string;          // identifiant stable, exploitable par le client
    message: string;       // message lisible par un humain
    details?: unknown;     // contexte optionnel (valeurs attendues, etc.)
}

/** Corps attendu pour POST /api/annonces/:id/encheres (non validé). */
export interface DemandeEnchere {
    pseudo: unknown;
    montant: unknown;
}

/**
 * Résultat d'une validation métier.
 * Union discriminée : le compilateur force à traiter les deux cas.
 */
export type ResultatValidation =
    | { valide: true; enchere: Enchere }
    | { valide: false; statutHttp: number; code: string; message: string; details?: unknown };