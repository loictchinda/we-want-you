import { Annonce, AnnoncePublique, StatutAnnonce } from '../types';

/**
 * Meilleure enchère actuelle, ou prix de départ s'il n'y en a aucune.
 * C'est la valeur de référence pour toutes les règles métier.
 */
export function meilleureEnchere(annonce: Annonce): number {
    if (annonce.encheres.length === 0) return annonce.prixDepart;
    return Math.max(...annonce.encheres.map(e => e.montant));
}

/** Une annonce est terminée dès que sa date de fin est dépassée. */
export function estTerminee(annonce: Annonce, maintenant: Date = new Date()): boolean {
    return new Date(annonce.dateFin).getTime() <= maintenant.getTime();
}

export function statut(annonce: Annonce, maintenant: Date = new Date()): StatutAnnonce {
    return estTerminee(annonce, maintenant) ? 'terminee' : 'en_cours';
}

/** Projette une annonce stockée vers sa représentation publique. */
export function versAnnoncePublique(annonce: Annonce, maintenant: Date = new Date()): AnnoncePublique {
    return {
        id: annonce.id,
        titre: annonce.titre,
        description: annonce.description,
        prixDepart: annonce.prixDepart,
        pasEnchere: annonce.pasEnchere,
        dateFin: annonce.dateFin,
        meilleureEnchere: meilleureEnchere(annonce),
        nombreEncheres: annonce.encheres.length,
        statut: statut(annonce, maintenant),
    };
}

import { AnnonceDetail } from '../types';

/**
 * Vue détaillée : annonce publique + historique des enchères,
 * trié de la plus récente à la plus ancienne (demandé par le sujet).
 */
export function versAnnonceDetail(annonce: Annonce, maintenant: Date = new Date()): AnnonceDetail {
    const encheresTriees = [...annonce.encheres].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
        ...versAnnoncePublique(annonce, maintenant),
        encheres: encheresTriees,
    };
}