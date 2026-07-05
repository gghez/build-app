---
id: build-app-launch
name: Lancer Build App
description: Lance l'application build-app (compose PostgreSQL + client Vite + server Fastify en local) et permet de suivre les logs.
triggers:
  - "lance l'app"
  - "lance l'application"
  - "lance build-app"
  - "démarre l'app"
  - "démarre build-app"
  - "start build-app"
  - "start the app"
---

# Lancer Build App

Lancement de l'application **build-app** : PostgreSQL via Docker Compose, client et serveur en local avec Node pour pouvoir suivre les logs.

## Workflow

### 1. Démarrer PostgreSQL via Docker Compose

```bash
docker compose -f compose.dev.yml up -d
```

Attendre que le conteneur soit `healthy` ou `Up` :

```bash
docker compose -f compose.dev.yml ps
```

### 2. Vérifier / appliquer les migrations DB

```bash
cd server
npx drizzle-kit generate
npx tsx src/db/migrate.ts
```

Si les migrations sont déjà à jour, `generate` ne produira rien de nouveau ; on peut alors juste lancer `migrate`.

### 3. Lancer le serveur et le client en background

Depuis la racine `build-app` :

```bash
cd server && npm run dev
```

```bash
cd client && npm run dev
```

Utiliser `background=true` pour que les deux tournent simultanément. Les deux processus doivent rester actifs pour qu'on puisse lire les logs à la demande.

### 4. Vérifier les URLs

| Service | URL par défaut |
|---------|---------------|
| API Fastify | `http://localhost:3001` |
| Client Vite | `http://localhost:5173` (ou port suivant si occupé) |
| PostgreSQL | `localhost:5432` |

### 5. Suivre les logs

Utiliser `background_shell` avec `action="read"` et le `session_id` retourné au lancement pour voir les logs les plus récents. Pour une attente avec timeout, utiliser `action="poll"`.

Exemple :
```bash
background_shell(action="read", session_id="<server_session_id>")
background_shell(action="read", session_id="<client_session_id>")
```

### 6. Arrêter

```bash
# Arrêter les processus Node (via background_shell action="stop")
background_shell(action="stop", session_id="<server_session_id>")
background_shell(action="stop", session_id="<client_session_id>")

# Arrêter PostgreSQL
docker compose -f compose.dev.yml down
```

## Notes

- Le `compose.dev.yml` est à la racine du projet `build-app` et ne contient **que PostgreSQL**. Le `compose.yml` (sans suffixe) sera réservé pour la stack de hosting complète.
- Les dépendances (`node_modules`) sont supposées déjà installées. Si elles manquent, lancer `npm install` dans `client/` et `server/` avant.
- Si le port 5173 est occupé, Vite choisira automatiquement le port suivant (5174, etc.). Lire la sortie des logs pour connaître le port exact.
