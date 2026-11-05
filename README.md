# ghstats : badges GitHub avec score, XP, langages et trophées

Le site web est dans `public/index.html` : il est servi automatiquement à la racine de ton domaine Vercel (entre un pseudo, copie les badges).

## Déploiement (aucune clé nécessaire)
1. Push ce dossier sur un repo GitHub.
2. Sur vercel.com : "Import" du repo, puis Deploy. C'est tout.

## Utilisation dans un README
![Stats](https://ghstats-two.vercel.app/api/stats?username=Hackerd-825)
![Langages](https://ghstats-two.vercel.app/api/langs?username=Hackerd-825)
![Activité](https://ghstats-two.vercel.app/api/activity?username=Hackerd-825)
![XP](https://ghstats-two.vercel.app/api/xp?username=Hackerd-825)
![Score](https://ghstats-two.vercel.app/api/badge?username=Hackerd-825)

Options : `theme=dark|light`, `hide_bg=true`.

## Barème
Étoiles x3, commits x1, repos x2, followers x2, PR x4, issues x2, reviews x3, langages x2, streak x2.
Somme = XP. Niveau = floor(sqrt(XP/5))+1. Grades : D < 250 <= C < 700 <= B < 1500 <= A < 3000 <= S.
