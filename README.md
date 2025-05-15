Résumé du projet : Calendrier de rendez-vous AutoCypriano Pro
Structure globale

Application web permettant la prise de rendez-vous en ligne pour des services mécaniques professionnels.
Fonctionnalités clés :

    Formulaire en 3 étapes :

        Étape 1 : Saisie des informations du garage (avec vérification email par code à usage unique).

        Étape 2 : Sélection de dates via un calendrier interactif et choix de créneaux horaires.

        Étape 3 : Confirmation avec récapitulatif et envoi d'un lien de paiement sécurisé.

    Validation en temps réel des champs (SIRET, téléphone, email).

    Interface responsive optimisée pour mobile et desktop.

    Modale de succès avec copie du lien de paiement et renvoi d'email.

Technologies utilisées

    Frontend :

        HTML5, CSS3 (Tailwind CSS + styles personnalisés).

        JavaScript moderne (modules ES6).

    Fonctionnalités avancées :

        Génération de codes de vérification aléatoires.

        Simulation d'envoi d'emails.

        Animations (chargement, transitions entre étapes).

    Compatibilité :

        Gestion automatique du mode sombre selon les préférences système.

        Adaptation aux fuseaux horaires et jours fériés français.

Fichiers clés

    index.html : Structure de base avec header, étapes de réservation, modale et footer.

    booking-steps.js : Logique des 3 étapes de réservation et gestion des états.

    calendar.js : Affichage dynamique du calendrier et gestion des sélections de dates.

    modal.js : Configuration de la modale de confirmation et interactions associées.

    utils.js : Fonctions utilitaires (validation, formatage, génération de références).

    style.css : Styles personnalisés complétant Tailwind CSS (animations, responsive design).

Points forts

    Expérience utilisateur :

        Navigation fluide entre les étapes avec sauvegarde des données.

        Feedback visuel immédiat (erreurs de formulaire, chargements).

    Sécurité :

        Vérification en deux temps par email.

        Lien de paiement sécurisé avec expiration (7 jours).

    Personnalisation :

        Adaptation aux contraintes métier (jours fériés, horaires d'ouverture).

        Génération automatique de références uniques (ex: RDV-2024-18923).

Objectif final : Simplifier la prise de rendez-vous pour les professionnels de la mécanique tout en garantissant une gestion fiable des créneaux et des paiements.
