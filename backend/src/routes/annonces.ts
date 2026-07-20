import { Router } from 'express';
import { listerAnnonces, trouverAnnonce, ajouterEnchere  } from '../repository';
import { versAnnoncePublique, versAnnonceDetail } from '../domain/annonce';
import { validerEnchere } from '../domain/enchere';

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

/** POST /api/annonces/:id/encheres — place une enchère. */
router.post('/:id/encheres', (req, res) => {
    const maintenant = new Date();
    const annonce = trouverAnnonce(req.params.id);

    if (!annonce) {
        return envoyerErreur(res, 404, 'ANNONCE_INTROUVABLE', "Cette annonce n'existe pas.");
    }

    const resultat = validerEnchere(annonce, req.body ?? {}, maintenant);

    if (!resultat.valide) {
        return envoyerErreur(
            res,
            resultat.statutHttp,
            resultat.code,
            resultat.message,
            resultat.details
        );
    }

    ajouterEnchere(annonce.id, resultat.enchere);

    // 201 Created : une nouvelle enchère a été ajoutée à l'historique.
    // On renvoie l'annonce à jour pour éviter au client un second appel.
    res.status(201).json({
        enchere: resultat.enchere,
        annonce: versAnnonceDetail(annonce, maintenant),
    });
});

export default router;