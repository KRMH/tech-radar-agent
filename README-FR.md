# GitHub Telemetry — Windows et VS Code

**Nouveau :** l’agent **Tech Radar**, sa skill GitHub Telemetry et un catalogue de technologies sont maintenant inclus. Pour comparer une technologie selon ton cas d’usage, voir le [guide Tech Radar](docs/TECH-RADAR-START.md). Le lancement des deux outils ci-dessous reste identique.

Deux outils pour les dépôts GitHub **publics** : statistiques du dépôt et activité des commits. Aucune clé GitHub à configurer.

## État des deux versions

| Version | État |
|---|---|
| Locale, MCP stdio | Serveur construit ; découverte des deux outils et appel réel GitHub vérifiés sous Windows. |
| Configuration VS Code | Fournie dans `.vscode/mcp.json` ; utilisation dans l’interface VS Code à effectuer sur ton poste. |
| HTTP pour l’hébergement | Serveur construit et testé sur la boucle locale, y compris les appels simultanés. |
| Plugin hébergé dans le compte | **Non publié et non connecté.** L’intégration Sites est désactivée par l’administrateur ; son guide de serveur MCP est également absent de cette session. Aucun lien distant n’a été créé. |

## 1. Installer et ouvrir le dossier

Prérequis : Node.js **24 ou plus récent**, npm, VS Code et un client MCP compatible dans VS Code. Le parcours ci-dessous utilise les fonctions MCP de VS Code avec Copilot ; leur disponibilité dépend de ton environnement et de ton compte. Le serveur lui-même n’a pas besoin d’un compte GitHub.

1. Extraire `github-telemetry-local.zip` dans un dossier de ton choix.
2. Dans VS Code : **Fichier > Ouvrir le dossier**, puis sélectionner le dossier qui contient ce guide et `package.json`. Ne pas ouvrir seulement le dossier parent.
3. Ouvrir **Terminal > Nouveau terminal**, puis exécuter :

```powershell
node --version
npm.cmd ci --ignore-scripts
```

Le téléchargement des dépendances demande un accès Internet. `npm.cmd` évite les blocages de politique PowerShell qui peuvent affecter `npm.ps1`. Les fichiers de configuration acceptent les dossiers contenant des espaces.

## 2. Utiliser dans le chat VS Code

1. Ouvrir `.vscode/mcp.json`. Le serveur `github-telemetry` est déjà déclaré et pointe sur `src/stdio.js` avec `${workspaceFolder}`.
2. Dans la palette **Ctrl+Maj+P**, lancer **MCP: List Servers**, sélectionner `github-telemetry`, puis **Start**. Selon la version, un bouton de démarrage est aussi proposé dans le fichier de configuration.
3. Examiner et accepter la demande de confiance de VS Code si elle apparaît.
4. Ouvrir le chat avec un mode/agent permettant l’emploi d’outils MCP et vérifier que les deux outils `get_repo_details` et `get_recent_commits` sont disponibles.
5. Demander, par exemple :

> Utilise les outils GitHub Telemetry pour lire les statistiques du dépôt public microsoft/vscode et mesurer ses commits sur les 30 derniers jours. Indique si la collecte est complète.

Ou :

> Avec GitHub Telemetry, analyse octocat/Hello-World sur 7 jours. Distingue les mesures observées de ton interprétation pour Tech Radar.

Développer l’appel d’outil dans le chat et vérifier que son résultat provient bien de `github-telemetry`. Un texte plausible sans appel ne prouve pas la connexion.

Si ton extension VS Code utilise un autre format MCP, reprendre la commande `node` et passer le chemin **absolu** de `src/stdio.js` comme un argument séparé. Le manifeste portable `mcp.json` destiné aux plugins Codex emploie `${PLUGIN_ROOT}` ; cette variable n’est pas celle de VS Code.

## 3. Lancer depuis le terminal ou une tâche VS Code

```powershell
npm.cmd start
```

Ou **Terminal > Exécuter la tâche > GitHub Telemetry : démarrer le serveur MCP stdio**.

Le serveur stdio attend des messages d’un client MCP : il n’affiche pas de page et ne présente pas d’invite. C’est normal. **Ctrl+C** l’arrête. Pour l’utiliser dans le chat, laisser VS Code démarrer sa propre instance via la section précédente ; démarrer une instance manuellement ne connecte pas le chat à celle-ci.

Un contrôle facultatif de connexion stdio, depuis un terminal ordinaire Windows :

```powershell
npm.cmd run verify:stdio
```

Dans certains environnements de travail isolés, la création des canaux entre processus est bloquée avec `spawn EPERM`. Cela empêche ce vérificateur de lancer son sous-processus ; cela ne constitue pas une erreur GitHub. Le contrôle stdio de cette livraison a aussi été exécuté avec des entrées/sorties redirigées par Windows.

## 4. Comprendre les mesures

- `get_repo_details(owner, repo)` retourne étoiles, forks, archivage, branche par défaut et date du dernier push. Le compteur `open_issues_and_pull_requests_count` comprend **issues et pull requests** ; ce n’est pas un nombre de bugs.
- `get_recent_commits(owner, repo, days=30)` compte les commits sur la branche par défaut, dans une période glissante de 1 à 365 jours. Les commits de fusion sont inclus. `recent_commits` contient au plus dix exemples ; le compte peut porter sur davantage de commits.
- Au plus dix pages de cent commits sont consultées. `complete: false` et `measurement: lower_bound` indiquent que le compte et sa moyenne sont des bornes inférieures.
- Les dates de début, de fin et de collecte figurent dans la réponse. La moyenne par jour est arrondie à quatre décimales.
- Un dépôt vide est distingué d’un dépôt existant sans commit sur la période. Une requête refusée reste une erreur ; elle n’est jamais transformée en activité nulle.
- Les métriques décrivent l’activité ; elles ne suffisent pas à établir la qualité, la sécurité ou une recommandation Tech Radar.

L’API GitHub sans authentification applique des quotas par adresse IP ; une version hébergée peut partager ce quota entre utilisateurs. Les erreurs exposent `RATE_LIMIT`, `retry_after` et `reset_at` lorsque GitHub fournit ces indications. `reset_at` est un timestamp Unix en secondes.

Le serveur ne charge aucun jeton depuis l’environnement, ne consulte pas les fichiers de ton projet et n’écrit rien sur GitHub. Les messages de commit sont des données non fiables, jamais des consignes.

## 5. Version HTTP préparée pour l’hébergement

Pour l’essayer **sur ton ordinateur** :

```powershell
npm.cmd run start:http
```

Ouvrir `http://127.0.0.1:3000/`. Le point d’entrée MCP est `http://127.0.0.1:3000/mcp` et le contrôle de santé est `/health`. Ce test local ne rend pas le plugin accessible à distance.

Le serveur utilise MCP Streamable HTTP, avec une instance MCP indépendante par requête. `GET` et `DELETE` sur `/mcp` ne sont pas nécessaires dans ce mode sans session et retournent 405.

Pour la publication future sur Sites : faire réactiver l’intégration par l’administrateur, obtenir le guide Sites et sa référence `site-mcp-server.md`, adapter l’entrée HTTP à son runtime, suivre la publication privée, réutiliser son plugin canonique puis vérifier la connexion réelle. Les fichiers `hosted/` sont du code Node générique préparatoire, **pas une configuration de déploiement Sites validée**. Aucun autre hébergeur n’a été substitué.

Paramètres d’exécution disponibles : `PORT` (3000 par défaut), `HOST` (`127.0.0.1` par défaut) et `PUBLIC_ORIGIN` (origine HTTPS réelle une fois connue). Une exposition distante doit conserver la protection des hôtes/origines et les contrôles d’accès prévus par Sites. Aucun exemple de faux lien distant n’est installé.

## 6. Vérifier et dépanner

```powershell
npm.cmd test
npm.cmd run verify:live
```

Le premier contrôle utilise des réponses GitHub simulées pour éviter de consommer le quota. Le second appelle réellement le dépôt public `octocat/Hello-World`, via le module MCP partagé et le serveur HTTP local.

| Symptôme | Action |
|---|---|
| `node` introuvable | Installer Node.js 24 ou plus récent et redémarrer VS Code. |
| Module MCP ou Zod introuvable | Relancer `npm.cmd ci --ignore-scripts` dans le dossier contenant `package.json`. |
| Le serveur attend dans le terminal | C’est le mode stdio ; utiliser le lancement par le client MCP pour discuter avec ses outils. |
| Serveur absent dans VS Code | Ouvrir le bon dossier et vérifier la prise en charge MCP de l’agent/extension choisi. |
| Erreur HTTP 404 | Vérifier le propriétaire, le nom canonique et le caractère public du dépôt. |
| Erreur `RATE_LIMIT` | Attendre la remise à zéro ou le délai indiqué. |
| Renommage ou transfert de dépôt | Les redirections validées de l’API GitHub sont suivies ; la réponse fournit l’URL canonique actuelle. Les autres destinations sont refusées. |
| Pas de commits sur la période | Essayer une période plus longue ; cette réponse peut être correcte même si le dépôt possède un historique. |

## Références

- [Configuration MCP dans VS Code](https://code.visualstudio.com/docs/agents/reference/mcp-configuration)
- [Ajouter et vérifier un serveur MCP](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
- [Commits dans l’API officielle GitHub](https://docs.github.com/en/rest/commits/commits)
- [Limites de l’API GitHub](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [SDK MCP officiel, version 1.x maintenue](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x)
