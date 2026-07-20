import { Router } from 'express';
import { listerAnnonces, trouverAnnonce } from '../repository';
import { versAnnoncePublique, versAnnonceDetail } from '../domain/annonce';
import { envoyerErreur } from '../http/erreurs';

const router = Router();

/** GET /api/annonces — liste des annonces avec meilleure enchère et statut. */
router.get('/', (_req, res) => {
    const maintenant = new Date();
    const annonces = listerAnnonces().map(a => versAnnoncePublique(a, maintenant));
    res.json(annonces);
});

/** GET /api/annonces/:id — détail d'une annonce et historique des enchères. */
router.get('/:id', (req, res) => {
    const annonce = trouverAnnonce(req.params.id);

    if (!annonce) {
        return envoyerErreur(
            res,
            404,
            'ANNONCE_INTROUVABLE',
            "Cette annonce n'existe pas."
        );
    }

    res.json(versAnnonceDetail(annonce));
});

export default router;