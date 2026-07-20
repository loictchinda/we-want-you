import { Response } from 'express';
import { ErreurApi } from '../types';

/** Envoie une erreur au format unique de l'API. */
export function envoyerErreur(
    res: Response,
    statut: number,
    code: string,
    message: string,
    details?: unknown
): void {
    const corps: ErreurApi = { code, message };
    if (details !== undefined) corps.details = details;
    res.status(statut).json(corps);
}