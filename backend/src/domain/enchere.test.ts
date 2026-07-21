import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validerEnchere } from './enchere';
import { Annonce } from '../types';

/**
 * Fabrique une annonce de test.
 * Les valeurs par défaut décrivent le cas nominal ; chaque test ne
 * surcharge que ce qui l'intéresse, ce qui rend visible la variable testée.
 */
function creerAnnonce(surcharges: Partial<Annonce> = {}): Annonce {
    return {
        id: 'test-1',
        titre: 'Annonce de test',
        description: '',
        prixDepart: 1000,
        pasEnchere: 50,
        dateFin: '2099-01-01T00:00:00Z',
        encheres: [],
        ...surcharges,
    };
}

const MAINTENANT = new Date('2026-07-20T12:00:00Z');

describe('validerEnchere — cas acceptés', () => {

    test('accepte une enchère supérieure au prix de départ + pas', () => {
        const annonce = creerAnnonce();          // prixDepart 1000, pas 50
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 1050 }, MAINTENANT);

        assert.equal(r.valide, true);
        if (r.valide) {
            assert.equal(r.enchere.montant, 1050);
            assert.equal(r.enchere.pseudo, 'loic');
            assert.equal(r.enchere.date, MAINTENANT.toISOString());
        }
    });

    test('accepte un montant exactement égal au minimum requis', () => {
        // Cas limite : 1200 + 50 = 1250 doit passer, pas être rejeté
        const annonce = creerAnnonce({
            encheres: [{ pseudo: 'autre', montant: 1200, date: '2026-07-01T00:00:00Z' }],
        });
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 1250 }, MAINTENANT);

        assert.equal(r.valide, true);
    });

    test('nettoie les espaces autour du pseudo', () => {
        const annonce = creerAnnonce();
        const r = validerEnchere(annonce, { pseudo: '  loic  ', montant: 1050 }, MAINTENANT);

        assert.equal(r.valide, true);
        if (r.valide) assert.equal(r.enchere.pseudo, 'loic');
    });

    test('se base sur le prix de départ quand il n\'y a aucune enchère', () => {
        const annonce = creerAnnonce({ prixDepart: 600, pasEnchere: 25, encheres: [] });

        const trop_bas = validerEnchere(annonce, { pseudo: 'loic', montant: 600 }, MAINTENANT);
        assert.equal(trop_bas.valide, false);

        const ok = validerEnchere(annonce, { pseudo: 'loic', montant: 625 }, MAINTENANT);
        assert.equal(ok.valide, true);
    });
});

describe('validerEnchere — requête malformée (400)', () => {

    test('refuse un pseudo vide', () => {
        const r = validerEnchere(creerAnnonce(), { pseudo: '', montant: 1050 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) {
            assert.equal(r.statutHttp, 400);
            assert.equal(r.code, 'PSEUDO_INVALIDE');
        }
    });

    test('refuse un pseudo composé uniquement d\'espaces', () => {
        const r = validerEnchere(creerAnnonce(), { pseudo: '   ', montant: 1050 }, MAINTENANT);
        assert.equal(r.valide, false);
        if (!r.valide) assert.equal(r.code, 'PSEUDO_INVALIDE');
    });

    test('refuse un pseudo qui n\'est pas une chaîne', () => {
        const r = validerEnchere(creerAnnonce(), { pseudo: 42, montant: 1050 }, MAINTENANT);
        assert.equal(r.valide, false);
        if (!r.valide) assert.equal(r.code, 'PSEUDO_INVALIDE');
    });

    test('refuse un montant non numérique', () => {
        const r = validerEnchere(creerAnnonce(), { pseudo: 'loic', montant: '1050' }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) {
            assert.equal(r.statutHttp, 400);
            assert.equal(r.code, 'MONTANT_INVALIDE');
        }
    });

    test('refuse un montant négatif ou nul', () => {
        for (const montant of [-100, 0]) {
            const r = validerEnchere(creerAnnonce(), { pseudo: 'loic', montant }, MAINTENANT);
            assert.equal(r.valide, false, `montant ${montant} aurait dû être refusé`);
            if (!r.valide) assert.equal(r.code, 'MONTANT_INVALIDE');
        }
    });

    test('refuse NaN', () => {
        const r = validerEnchere(creerAnnonce(), { pseudo: 'loic', montant: NaN }, MAINTENANT);
        assert.equal(r.valide, false);
        if (!r.valide) assert.equal(r.code, 'MONTANT_INVALIDE');
    });
});

describe('validerEnchere — conflit d\'état (409)', () => {

    test('refuse une enchère sur une annonce terminée', () => {
        const annonce = creerAnnonce({ dateFin: '2020-01-01T00:00:00Z' });
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 99999 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) {
            assert.equal(r.statutHttp, 409);
            assert.equal(r.code, 'ANNONCE_TERMINEE');
        }
    });

    test('accepte jusqu\'à la date de fin, refuse à partir d\'elle', () => {
        const annonce = creerAnnonce({ dateFin: '2026-07-20T12:00:00Z' });

        const uneSecondeAvant = new Date('2026-07-20T11:59:59Z');
        assert.equal(validerEnchere(annonce, { pseudo: 'loic', montant: 1050 }, uneSecondeAvant).valide, true);

        // À l'instant exact de la fin, l'annonce est considérée terminée
        const pile = new Date('2026-07-20T12:00:00Z');
        assert.equal(validerEnchere(annonce, { pseudo: 'loic', montant: 1050 }, pile).valide, false);
    });

    test('la validation de forme prime sur l\'état de l\'annonce', () => {
        // Un pseudo vide sur une annonce terminée doit renvoyer PSEUDO_INVALIDE,
        // pas ANNONCE_TERMINEE : on corrige d'abord ce que l'utilisateur maîtrise.
        const annonce = creerAnnonce({ dateFin: '2020-01-01T00:00:00Z' });
        const r = validerEnchere(annonce, { pseudo: '', montant: 99999 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) assert.equal(r.code, 'PSEUDO_INVALIDE');
    });
});

describe('validerEnchere — règles métier (422)', () => {

    test('refuse un montant inférieur à la meilleure enchère', () => {
        const annonce = creerAnnonce({
            encheres: [{ pseudo: 'autre', montant: 2000, date: '2026-07-01T00:00:00Z' }],
        });
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 1500 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) {
            assert.equal(r.statutHttp, 422);
            assert.equal(r.code, 'MONTANT_TROP_BAS');
        }
    });

    test('refuse un montant égal à la meilleure enchère', () => {
        const annonce = creerAnnonce({
            encheres: [{ pseudo: 'autre', montant: 2000, date: '2026-07-01T00:00:00Z' }],
        });
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 2000 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) assert.equal(r.code, 'MONTANT_TROP_BAS');
    });

    test('refuse une progression inférieure au pas d\'enchère', () => {
        const annonce = creerAnnonce({
            pasEnchere: 100,
            encheres: [{ pseudo: 'autre', montant: 2000, date: '2026-07-01T00:00:00Z' }],
        });
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 2050 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) {
            assert.equal(r.statutHttp, 422);
            assert.equal(r.code, 'PAS_ENCHERE_NON_RESPECTE');
            assert.deepEqual(r.details, {
                meilleureEnchere: 2000,
                pasEnchere: 100,
                montantMinimum: 2100,
            });
        }
    });

    test('la meilleure enchère est le maximum, pas la dernière ajoutée', () => {
        // L'historique n'est pas garanti trié : on doit prendre le max.
        const annonce = creerAnnonce({
            pasEnchere: 50,
            encheres: [
                { pseudo: 'a', montant: 3000, date: '2026-07-01T00:00:00Z' },
                { pseudo: 'b', montant: 1500, date: '2026-07-02T00:00:00Z' },
            ],
        });
        const r = validerEnchere(annonce, { pseudo: 'loic', montant: 2000 }, MAINTENANT);

        assert.equal(r.valide, false);
        if (!r.valide) assert.equal(r.code, 'MONTANT_TROP_BAS');
    });
});