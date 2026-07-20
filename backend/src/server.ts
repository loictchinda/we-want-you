import express from 'express';
import cors from 'cors';
import { chargerDonnees } from './repository';
import annoncesRouter from './routes/annonces';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/annonces', annoncesRouter);

// Chargement des données avant l'ouverture du port : le serveur ne doit
// pas accepter de requêtes sur un dépôt vide.
chargerDonnees();

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`API démarrée sur http://localhost:${PORT}`);
    console.log(`Annonces : http://localhost:${PORT}/api/annonces`);
});