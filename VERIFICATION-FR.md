# Vérification de GitHub Telemetry

Vérifications réalisées le 20 octobre 2026 sous Windows, avec Node.js 24.19.0 et npm 11.17.0.

## Résultats

- **34 tests automatisés passent**, avec `npm.cmd test` : mesures, paramètres, pagination, limites de collecte, erreurs GitHub, protocole MCP et requêtes HTTP concurrentes.
- Initialisation MCP stdio, découverte des deux outils et appel réel à GitHub réussis par redirection des entrées/sorties Windows.
- Les deux outils ont interrogé le dépôt public `octocat/Hello-World` par MCP partagé et par HTTP sur la boucle locale.
- Un appel réel sur `microsoft/vscode` a collecté 1 000 commits, dix exemples et retourné `complete: false`, `measurement: lower_bound`. La pagination réelle GitHub emploie des liens `/repositories/{id}/commits`, désormais pris en charge.
- Le fichier OpenAPI YAML a été analysé comme des données et ses deux actions et schémas de réponse vérifiés.
- L’archive a été extraite et ses 95 dépendances installées depuis le fichier de verrouillage dans un dossier Windows contenant des espaces. Les 34 tests, l’initialisation stdio, la découverte des outils et un appel réel GitHub y ont réussi.
- Les fichiers JSON sont analysables ; les manifestes, l’existence du point d’entrée et les fichiers VS Code sont contrôlés avant archivage. L’archive exclut les dépendances téléchargées et les secrets.

## Limites de validation

La configuration VS Code est livrée, mais aucun appel depuis son interface de chat n’a été effectué. La connexion reste à démarrer dans ton instance VS Code en suivant le guide.

Le vérificateur SDK qui lance un sous-processus stdio rencontre `spawn EPERM` dans cet environnement isolé. Le serveur stdio lui-même a été contrôlé avec les redirections natives Windows. Les tests utilisent le mode sans processus de travail isolés.

Le transport HTTP a fonctionné localement ; **aucun plugin distant n’a été publié ou connecté au compte**. La découverte des intégrations retourne Sites avec le statut `DISABLED_BY_ADMIN` et une installation non disponible. Son guide MCP requis n’est pas accessible. L’administrateur doit rétablir cet accès pour poursuivre la publication et la vérification distante.

## Décisions de réalisation et conséquences

1. Le dossier de cette conversation n’étant pas un dépôt Git, les fichiers ont été construits dans un dossier de livraison distinct. Aucun historique Git ni worktree n’a été créé ; les fichiers du projet Tech Radar externe sont préservés.
2. Le suivi de réalisation est conservé dans le dossier de travail de la conversation, puisque les outils de suivi reposant sur Git ne s’appliquent pas ici. Il n’existe pas de journal de commits pour cette livraison.
3. Le SDK MCP officiel 1.32.1, branche 1.x maintenue, est figé dans le fichier de verrouillage pour compatibilité avec les clients existants. Les nouveautés de protocole réservées au SDK 2.x ne sont pas utilisées.
4. Le cache de téléchargement npm a été placé dans le dossier de travail autorisé. Cela ne change pas l’installation prévue sur ton poste.
5. Les tests s’exécutent sans sous-processus de travail pour contourner la restriction de l’environnement. Les cas testés restent les mêmes.
6. Node.js 24 ou plus récent est requis, plutôt que le seuil initialement envisagé de 22, afin de fixer une base effectivement testée. Les postes sur une ancienne version doivent effectuer une mise à jour.
7. La validation stdio utilise les redirections Windows à cause du blocage des canaux entre sous-processus. Elle ne remplace pas un essai dans le chat VS Code.
8. La publication Sites reste en attente, sans substitution d’hébergeur ni création d’un faux lien. Conséquence : le serveur HTTP préparé ne constitue pas encore un plugin accessible à distance.

## Revue finale

Une revue indépendante en lecture seule a identifié deux problèmes de fonctionnement : le format réel des liens de pagination GitHub et la perte du diagnostic pour certains délais dépassés/réponses de quota non JSON. Trois tests de régression ont d’abord reproduit les échecs ; les corrections font ensuite passer l’ensemble des 34 tests.

Point mineur différé : le contrôle facultatif `verify:stdio` interprète un premier argument comme le chemin du serveur. Pour un appel avec le drapeau de vérification réelle, utiliser `node scripts/verify-stdio.js src/stdio.js --live`, et non `npm.cmd run verify:stdio -- --live`. La commande sans argument du guide est correcte.

La revue n’a pas pu juger la connexion dans l’interface VS Code ni le déploiement et les contrôles d’accès Sites, qui restent non vérifiés. Les vérifications des fichiers livrés et de l’archive ont été réalisées séparément après la revue.
