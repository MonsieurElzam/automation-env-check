## À quoi ça sert

Une application qui démarre en production avec une variable d'environnement manquante échoue souvent de manière silencieuse : un envoi d'e-mail qui ne part pas, un paiement qui ne se déclenche jamais. Ce script compare votre fichier `.env.example` (la liste de référence, versionnée) à un `.env` réel et vous dit ce qui ne va pas **avant** le déploiement. Il n'affiche jamais les valeurs, seulement les noms.

## Avant de commencer

- Un `.env.example` à jour dans le dépôt : une ligne par variable, avec une valeur vide ou factice.
- Le fichier à contrôler (`.env`, `.env.production`, un export de votre hébergeur…).

## Pas à pas

1. Lancez la comparaison :
   ```bash
   node src/env-check.mjs samples/env.example samples/env.local
   ```
2. Lisez le rapport : variables **manquantes** (absentes du fichier), **vides**, **conservées à leur valeur d'exemple** (`changeme`, `your-…`), et **en trop** (présentes mais absentes de la référence).
3. Corrigez, puis relancez jusqu'à voir « Environnement conforme ».

## Lire le résultat

Le code de sortie vaut 2 si une variable manque ou est vide. Avec `--strict`, une valeur d'exemple conservée ou une variable en trop compte aussi comme une erreur. Une variable « en trop » n'est pas forcément un défaut : c'est souvent une variable que l'on a oublié d'ajouter à `.env.example`.

## L'automatiser

Dans une CI, avant le déploiement :

```yaml
- run: node src/env-check.mjs .env.example "$ENV_FILE" --strict
```

## Pièges à éviter

- Ne mettez jamais de vraies valeurs dans `.env.example`.
- Le script ne vérifie pas qu'une valeur est *correcte* (une URL de base de données peut être bien formée et pointer au mauvais endroit), seulement qu'elle est présente.
