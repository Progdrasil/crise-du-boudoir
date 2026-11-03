# Crise du Boudoir

Jeu de gestion d'événement en français, jouable dans un navigateur, en solo ou en duo sur le même écran. Aucun paquet à installer.

> Ceci est un jeux qui a été générer par IA en reponse à un événement qui a été très mal gérer. iykyk.

## Jouer

Ouvrez `index.html` dans votre navigateur, ou lancez `npm start` puis ouvrez http://localhost:4173. Le serveur local nécessite Python 3. Les polices Google sont facultatives ; le jeu fonctionne sans connexion.

Cliquez sur **Ouvrir les portes** pour jouer en solo, ou **Duo local** pour jouer à deux. Les trois postes peuvent travailler en même temps, chacun avec un visiteur différent.

1. Sélectionnez un visiteur et scannez son billet.
2. Vérifiez que le billet est valide et que la tenue correspond au thème indiqué à son arrivée.
3. Tamponnez le poignet. Si la personne a un manteau, déposez-le au vestiaire pour terminer l’entrée.
4. Pour les sorties, choisissez le bon manteau au vestiaire.
5. Refusez les faux billets, les mauvaises tenues et les personnes qui doublent la file.

| Commande | Portier 1 | Portier 2 (duo) |
| --- | --- | --- |
| Choisir un visiteur | Z / X ou clic | ← / → ou clic après sélection du portier |
| Scanner / relancer le scanner | 1 | J |
| Tamponner | 2 | K |
| Vestiaire | 3 | L |
| Refuser | 4 | U |
| Pause | Espace / Échap | Espace / Échap |

Les choix de manteaux se font avec la souris, ou avec Tab et Entrée. Le bouton du portier dans la fiche définit le destinataire des clics en duo. Le bouton son active de courts effets sonores.

## Dix nuits

| Nuit | Soirée | Nouveauté |
| --- | --- | --- |
| 01 | Première nuit | Billets, tenues, tampons et dépôts |
| 02 | Un dernier verre | Sorties et retraits au vestiaire partagé |
| 03 | La file s’agite | Resquilleurs et tentatives de passage en force |
| 04 | Très important | File VIP prioritaire |
| 05 | Vestiaire complet | Afflux de manteaux et de sorties |
| 06 | Erreur de lecture | Scanner à relancer toutes les 7 lectures |
| 07 | Ticket perdu | Identification des manteaux par couleur |
| 08 | Changement de décor | Nouveau thème à mi-parcours |
| 09 | La liste de la liste | Plus de VIP et cadence accélérée |
| 10 | Le grand Boudoir | Tous les défis et patience réduite |

La patience baisse dans les files et s’arrête pendant le service. Les plaintes, les départs en colère et les erreurs dégradent l’humeur collective. Sous 45 %, les resquilleurs deviennent plus fréquents ; sous 35 %, la patience descend plus vite. À zéro, la soirée échoue. Réussir l’objectif avant la fermeture, avec une humeur positive, débloque la nuit suivante. Records et progression sont sauvegardés dans le navigateur. À la réouverture, le dernier niveau sélectionné est proposé ; après une victoire, c’est le niveau suivant. La soirée reprend au début du niveau, sans restaurer les files ni le chronomètre. Les anciennes sauvegardes reprennent au niveau le plus avancé débloqué.

Les sortants peuvent être des personnes déjà présentes dans le club à l’ouverture. Les reçus et les couleurs des manteaux sont affichés sur leur fiche. Les scénarios aléatoires garantissent assez de visiteurs admissibles pour atteindre l’objectif.

## Vérification

`npm test` vérifie les contrôles d’entrée, les opérations simultanées, les retraits, les pénalités, les pauses, les pannes et les changements de thème. Une simulation de 100 soirées par niveau vérifie que les dix objectifs sont atteignables.

Projet en HTML, CSS et JavaScript sans dépendances. `engine.js` contient la simulation ; `game.js` gère l’interface.
