/*
  # Création du cours "Les bases de l'investissement en bourse"
  
  1. Structure
    - Création du thème "Finance & Investissement"
    - Création du module "Investissement en bourse"
    - Création du cours avec ses sections
    - Création des quiz associés
*/

-- Création des variables pour les UUID
DO $$
DECLARE
  theme_id uuid := gen_random_uuid();
  module_id uuid := gen_random_uuid();
  course_id uuid := gen_random_uuid();
  section1_id uuid := gen_random_uuid();
  section2_id uuid := gen_random_uuid();
  section3_id uuid := gen_random_uuid();
  section4_id uuid := gen_random_uuid();
  quiz1_id uuid := gen_random_uuid();
  quiz2_id uuid := gen_random_uuid();
  quiz3_id uuid := gen_random_uuid();
  quiz4_id uuid := gen_random_uuid();
BEGIN

-- Création du thème
INSERT INTO course_themes (id, name, description, icon, color, order_index)
VALUES (
  theme_id,
  'Finance & Investissement',
  'Maîtrisez les fondamentaux de la finance et de l''investissement',
  '📈',
  '#4f46e5',
  1
);

-- Création du module
INSERT INTO course_modules (
  id,
  theme_id,
  name,
  description,
  difficulty_level,
  prerequisites,
  learning_objectives,
  estimated_duration,
  order_index
)
VALUES (
  module_id,
  theme_id,
  'Investissement en bourse',
  'Apprenez les fondamentaux de l''investissement en bourse et développez votre stratégie d''investissement',
  'beginner',
  '["Aucun prérequis nécessaire"]',
  '[
    "Comprendre le fonctionnement des marchés financiers",
    "Maîtriser les différents types d''investissements",
    "Savoir analyser les risques et opportunités",
    "Construire un portefeuille diversifié",
    "Développer une stratégie d''investissement personnalisée"
  ]',
  480,
  1
);

-- Création du cours
INSERT INTO courses (
  id,
  module_id,
  author_id,
  title,
  description,
  status,
  difficulty_level,
  estimated_duration,
  points_reward,
  requirements,
  learning_objectives,
  resources,
  order_index
)
VALUES (
  course_id,
  module_id,
  '00000000-0000-0000-0000-000000000000',
  'Les bases de l''investissement en bourse',
  'Un cours complet pour comprendre les fondamentaux de l''investissement en bourse et commencer à investir de manière éclairée.',
  'published',
  'beginner',
  240,
  100,
  '["Aucun prérequis nécessaire"]',
  '[
    "Comprendre le fonctionnement de la bourse",
    "Maîtriser les différents types d''ordres",
    "Analyser les indicateurs financiers clés",
    "Construire un portefeuille diversifié",
    "Gérer les risques efficacement"
  ]',
  '[
    {
      "type": "article",
      "title": "Guide du débutant",
      "url": "https://www.amf-france.org/fr/espace-epargnants"
    },
    {
      "type": "video",
      "title": "Comprendre la bourse",
      "url": "https://www.youtube.com/watch?v=example"
    }
  ]',
  1
);

-- Création des sections
INSERT INTO sections (id, course_id, title, content, type, order_index, estimated_duration)
VALUES
-- Section 1: Introduction à la bourse
(
  section1_id,
  course_id,
  'Introduction à la bourse',
  '# Introduction à la bourse

## Qu''est-ce que la bourse ?
La bourse est un marché organisé où s''échangent des titres financiers comme les actions et les obligations. C''est un lieu de rencontre entre les entreprises qui cherchent à se financer et les investisseurs qui souhaitent placer leur argent.

## Les principaux acteurs
- Les entreprises cotées
- Les investisseurs particuliers et institutionnels
- Les intermédiaires financiers
- Les régulateurs

## Le fonctionnement général
- Les séances de cotation
- La formation des prix
- Les indices boursiers
- La liquidité du marché

## Les avantages de l''investissement en bourse
- Potentiel de rendement attractif
- Diversification du patrimoine
- Liquidité des investissements
- Participation à l''économie réelle

## Les risques à connaître
- Risque de marché
- Risque de liquidité
- Risque spécifique
- Importance de la diversification',
  'text',
  1,
  30
),

-- Section 2: Les différents types d'investissements
(
  section2_id,
  course_id,
  'Les différents types d''investissements',
  '# Les différents types d''investissements

## Les actions
- Définition et caractéristiques
- Droits de l''actionnaire
- Types d''actions
- Comment évaluer une action

## Les obligations
- Principes de fonctionnement
- Types d''obligations
- Avantages et inconvénients
- Évaluation du risque

## Les ETF (Exchange Traded Funds)
- Définition et fonctionnement
- Avantages de la gestion passive
- Types d''ETF disponibles
- Critères de sélection

## Les OPCVM
- Caractéristiques principales
- Types de fonds
- Avantages et inconvénients
- Comment choisir un OPCVM

## Les produits dérivés
- Options
- Futures
- Warrants
- Risques associés',
  'text',
  2,
  45
),

-- Section 3: Analyse fondamentale
(
  section3_id,
  course_id,
  'Analyse fondamentale',
  '# Analyse fondamentale

## Les états financiers
- Le bilan
- Le compte de résultat
- Le tableau de flux de trésorerie
- Les notes annexes

## Les ratios financiers clés
- PER (Price Earning Ratio)
- Price to Book
- ROE (Return on Equity)
- Ratio d''endettement

## L''analyse sectorielle
- Comprendre le secteur d''activité
- Analyser la concurrence
- Évaluer les barrières à l''entrée
- Identifier les tendances

## L''analyse de l''entreprise
- Modèle économique
- Avantages compétitifs
- Management et gouvernance
- Perspectives de croissance

## La valorisation
- Méthodes de valorisation
- DCF (Discounted Cash Flow)
- Comparaison boursière
- Création de valeur',
  'text',
  3,
  60
),

-- Section 4: Construction d'un portefeuille
(
  section4_id,
  course_id,
  'Construction d''un portefeuille',
  '# Construction d''un portefeuille

## Les principes de diversification
- Répartition des risques
- Corrélation entre actifs
- Diversification géographique
- Diversification sectorielle

## L''allocation d''actifs
- Définition des objectifs
- Profil de risque
- Horizon d''investissement
- Contraintes personnelles

## Les stratégies d''investissement
- Gestion passive vs active
- Value investing
- Growth investing
- Income investing

## Le rééquilibrage
- Pourquoi rééquilibrer
- Quand rééquilibrer
- Comment rééquilibrer
- Coûts de transaction

## La gestion des risques
- Stop loss
- Take profit
- Position sizing
- Suivi des positions',
  'text',
  4,
  45
);

-- Création des quiz
INSERT INTO quizzes (id, section_id, title, description, passing_score, points_reward)
VALUES
-- Quiz 1: Introduction à la bourse
(
  quiz1_id,
  section1_id,
  'Quiz - Introduction à la bourse',
  'Testez vos connaissances sur les fondamentaux de la bourse',
  70,
  10
),
-- Quiz 2: Les types d'investissements
(
  quiz2_id,
  section2_id,
  'Quiz - Les types d''investissements',
  'Évaluez votre compréhension des différents instruments financiers',
  70,
  15
),
-- Quiz 3: Analyse fondamentale
(
  quiz3_id,
  section3_id,
  'Quiz - Analyse fondamentale',
  'Testez vos connaissances en analyse financière',
  70,
  20
),
-- Quiz 4: Construction de portefeuille
(
  quiz4_id,
  section4_id,
  'Quiz - Construction de portefeuille',
  'Évaluez votre maîtrise de la gestion de portefeuille',
  70,
  20
);

-- Création des questions pour les quiz
INSERT INTO quiz_questions (quiz_id, question, type, options, correct_answer, explanation, points, order_index)
VALUES
-- Questions du Quiz 1
(
  quiz1_id,
  'Qu''est-ce que la bourse ?',
  'multiple_choice',
  '["Un marché où s''échangent des titres financiers", "Un lieu physique uniquement", "Un système de paris sportifs", "Une banque centrale"]',
  'Un marché où s''échangent des titres financiers',
  'La bourse est un marché organisé où s''échangent des titres financiers comme les actions et les obligations.',
  2,
  1
),
(
  quiz1_id,
  'Une action représente :',
  'multiple_choice',
  '["Une part de propriété dans une entreprise", "Un prêt à une entreprise", "Un contrat d''assurance", "Un compte bancaire"]',
  'Une part de propriété dans une entreprise',
  'Une action représente une part de propriété dans une entreprise, donnant droit à une partie des bénéfices et au vote en assemblée générale.',
  2,
  2
),
(
  quiz1_id,
  'Le CAC 40 est :',
  'multiple_choice',
  '["Un indice boursier français", "Une entreprise cotée", "Une banque d''investissement", "Un type d''action"]',
  'Un indice boursier français',
  'Le CAC 40 est le principal indice boursier de la place de Paris, regroupant les 40 plus grandes capitalisations boursières françaises.',
  2,
  3
),

-- Questions du Quiz 2
(
  quiz2_id,
  'Qu''est-ce qu''un ETF ?',
  'multiple_choice',
  '["Un fonds qui réplique un indice", "Une action individuelle", "Un compte d''épargne", "Une obligation d''État"]',
  'Un fonds qui réplique un indice',
  'Un ETF (Exchange Traded Fund) est un fonds indiciel coté en bourse qui réplique la performance d''un indice.',
  2,
  1
),
(
  quiz2_id,
  'Les obligations sont :',
  'multiple_choice',
  '["Des titres de créance", "Des parts de propriété", "Des contrats d''assurance", "Des comptes d''épargne"]',
  'Des titres de créance',
  'Les obligations sont des titres de créance émis par des entreprises ou des États pour emprunter de l''argent.',
  2,
  2
),
(
  quiz2_id,
  'Un OPCVM est :',
  'multiple_choice',
  '["Un fonds d''investissement collectif", "Une action individuelle", "Un compte bancaire", "Un produit dérivé"]',
  'Un fonds d''investissement collectif',
  'Un OPCVM est un organisme de placement collectif en valeurs mobilières qui permet d''investir dans un portefeuille diversifié.',
  2,
  3
),

-- Questions du Quiz 3
(
  quiz3_id,
  'Qu''est-ce que le PER ?',
  'multiple_choice',
  '["Le rapport entre le cours et le bénéfice par action", "Le chiffre d''affaires annuel", "Le total des dettes", "Le nombre d''employés"]',
  'Le rapport entre le cours et le bénéfice par action',
  'Le PER (Price Earning Ratio) est un ratio qui compare le cours d''une action à son bénéfice par action.',
  2,
  1
),
(
  quiz3_id,
  'Le ROE mesure :',
  'multiple_choice',
  '["La rentabilité des fonds propres", "Le chiffre d''affaires", "La dette totale", "Les actifs circulants"]',
  'La rentabilité des fonds propres',
  'Le ROE (Return on Equity) mesure la rentabilité financière en rapportant le résultat net aux capitaux propres.',
  2,
  2
),
(
  quiz3_id,
  'L''analyse fondamentale consiste à :',
  'multiple_choice',
  '["Étudier les données financières et économiques", "Observer les graphiques", "Suivre les tendances du marché", "Copier d''autres investisseurs"]',
  'Étudier les données financières et économiques',
  'L''analyse fondamentale consiste à étudier les données financières, économiques et stratégiques d''une entreprise pour évaluer sa valeur.',
  2,
  3
),

-- Questions du Quiz 4
(
  quiz4_id,
  'La diversification permet de :',
  'multiple_choice',
  '["Réduire le risque global du portefeuille", "Garantir des profits", "Éliminer tout risque", "Augmenter les coûts"]',
  'Réduire le risque global du portefeuille',
  'La diversification permet de réduire le risque spécifique du portefeuille en répartissant les investissements sur différents actifs.',
  2,
  1
),
(
  quiz4_id,
  'Le rééquilibrage consiste à :',
  'multiple_choice',
  '["Ajuster les proportions du portefeuille", "Vendre tous les actifs", "Acheter uniquement des actions", "Ignorer les variations"]',
  'Ajuster les proportions du portefeuille',
  'Le rééquilibrage consiste à ajuster régulièrement les proportions du portefeuille pour maintenir l''allocation d''actifs souhaitée.',
  2,
  2
),
(
  quiz4_id,
  'Un stop loss est :',
  'multiple_choice',
  '["Un ordre de vente automatique", "Un ordre d''achat", "Un dividende", "Un type d''action"]',
  'Un ordre de vente automatique',
  'Un stop loss est un ordre de vente automatique qui se déclenche lorsque le cours atteint un certain seuil, permettant de limiter les pertes.',
  2,
  3
);

END $$;