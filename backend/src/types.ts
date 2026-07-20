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