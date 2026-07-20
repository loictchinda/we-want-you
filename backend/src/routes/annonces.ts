import { Router } from 'express';
import { listerAnnonces } from '../repository';
import { versAnnoncePublique } from '../domain/annonce';

const router = Router();

/** GET /api/annonces — liste des annonces avec meilleure enchère et statut. */
router.get('/', (_req, res) => {
    const maintenant = new Date();
    const annonces = listerAnnonces().map(a => versAnnoncePublique(a, maintenant));
    res.json(annonces);
});

export default router;