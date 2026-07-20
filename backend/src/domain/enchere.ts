import { Annonce, DemandeEnchere, ResultatValidation } from '../types';
import { meilleureEnchere, estTerminee } from './annonce';

/**
 * Valide une demande d'enchère contre une annonce.
 *
 * Fonction pure : aucune dépendance à Express, au dépôt ni à l'horloge
 * système (l'instant est injecté). Elle est donc testable directement,
 * sans démarrer de serveur — ce qui est l'intérêt de l'isoler ici.
 */
export function validerEnchere(
    annonce: Annonce,
    demande: DemandeEnchere,
    maintenant: Date = new Date()
): ResultatValidation {
    const { pseudo, montant } = demande;

    // --- 1. Validation de la forme de la requête (400) ---

    if (typeof pseudo !== 'string' || pseudo.trim().length === 0) {
        return {
            valide: false,
            statutHttp: 400,
            code: 'PSEUDO_INVALIDE',
            message: 'Le pseudo est obligatoire.',
        };
    }

    if (typeof montant !== 'number' || !Number.isFinite(montant) || montant <= 0) {
        return {
            valide: false,
            statutHttp: 400,
            code: 'MONTANT_INVALIDE',
            message: 'Le montant doit être un nombre strictement positif.',
        };
    }

    // --- 2. État de la ressource (409) ---

    if (estTerminee(annonce, maintenant)) {
        return {
            valide: false,
            statutHttp: 409,
            code: 'ANNONCE_TERMINEE',
            message: 'Cette annonce est terminée, il n\'est plus possible d\'enchérir.',
            details: { dateFin: annonce.dateFin },
        };
    }

    // --- 3. Règles métier (422) ---

    const actuelle = meilleureEnchere(annonce);
    const minimum = actuelle + annonce.pasEnchere;

    if (montant <= actuelle) {
        return {
            valide: false,
            statutHttp: 422,
            code: 'MONTANT_TROP_BAS',
            message: `Le montant doit dépasser l'enchère actuelle de ${actuelle} €.`,
            details: { meilleureEnchere: actuelle, montantMinimum: minimum },
        };
    }

    if (montant < minimum) {
        return {
            valide: false,
            statutHttp: 422,
            code: 'PAS_ENCHERE_NON_RESPECTE',
            message: `L'enchère doit progresser d'au moins ${annonce.pasEnchere} €, soit ${minimum} € minimum.`,
            details: { meilleureEnchere: actuelle, pasEnchere: annonce.pasEnchere, montantMinimum: minimum },
        };
    }

    // --- Acceptée ---

    return {
        valide: true,
        enchere: {
            pseudo: pseudo.trim(),
            montant,
            date: maintenant.toISOString(),
        },
    };
}