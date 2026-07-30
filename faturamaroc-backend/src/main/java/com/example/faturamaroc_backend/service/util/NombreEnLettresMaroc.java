package com.example.faturamaroc_backend.service.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utilitaire de conversion de montants numériques en toutes lettres (en Dirhams et Centimes),
 * obligatoire pour la conformité DGI sur les factures et devis au Maroc
 * (Article 145 du Code Général des Impôts - CGI).
 */
public class NombreEnLettresMaroc {

    private static final String[] UNITES = {
            "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
            "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"
    };

    private static final String[] DIZAINES = {
            "", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"
    };

    /**
     * Convertit un montant BigDecimal en Dirhams en un libellé en français réglementaire.
     * Exemple: 1234.50 -> "Mille deux cent trente-quatre Dirhams et cinquante centimes"
     */
    public static String convertir(BigDecimal montant) {
        if (montant == null) {
            return "Zéro Dirham";
        }
        montant = montant.setScale(2, RoundingMode.HALF_UP);
        long dirhams = montant.longValue();
        int centimes = montant.remainder(BigDecimal.ONE).movePointRight(2).abs().intValue();

        StringBuilder resultat = new StringBuilder();

        if (dirhams == 0) {
            resultat.append("Zéro Dirham");
        } else {
            String strDirhams = convertirNombre(dirhams);
            resultat.append(capitaliser(strDirhams)).append(" ").append(dirhams == 1 ? "Dirham" : "Dirhams");
        }

        if (centimes > 0) {
            resultat.append(" et ").append(convertirNombre(centimes)).append(" ")
                    .append(centimes == 1 ? "centime" : "centimes");
        }

        return resultat.toString();
    }

    private static String capitaliser(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }

    private static String convertirNombre(long n) {
        if (n == 0) return "zéro";
        if (n < 0) return "moins " + convertirNombre(-n);

        StringBuilder mots = new StringBuilder();

        // Milliards
        if (n >= 1_000_000_000) {
            long milliards = n / 1_000_000_000;
            if (milliards == 1) {
                mots.append("un milliard ");
            } else {
                mots.append(convertirNombre(milliards)).append(" milliards ");
            }
            n %= 1_000_000_000;
        }

        // Millions
        if (n >= 1_000_000) {
            long millions = n / 1_000_000;
            if (millions == 1) {
                mots.append("un million ");
            } else {
                mots.append(convertirNombre(millions)).append(" millions ");
            }
            n %= 1_000_000;
        }

        // Milliers
        if (n >= 1000) {
            long milliers = n / 1000;
            if (milliers == 1) {
                mots.append("mille ");
            } else {
                mots.append(convertirNombre(milliers)).append(" mille ");
            }
            n %= 1000;
        }

        // Centaines
        if (n >= 100) {
            long centaines = n / 100;
            if (centaines == 1) {
                mots.append("cent ");
            } else {
                mots.append(UNITES[(int) centaines]).append(" cent");
                if (n % 100 == 0) {
                    mots.append("s ");
                } else {
                    mots.append(" ");
                }
            }
            n %= 100;
        }

        if (n > 0) {
            if (n < 20) {
                mots.append(UNITES[(int) n]).append(" ");
            } else {
                int dizaine = (int) (n / 10);
                int unite = (int) (n % 10);

                if (dizaine == 7 || dizaine == 9) {
                    dizaine--;
                    unite += 10;
                }

                String motDizaine = DIZAINES[dizaine];
                if (dizaine == 8 && unite == 0) {
                    motDizaine = "quatre-vingts";
                } else if (dizaine == 8) {
                    motDizaine = "quatre-vingt";
                }

                mots.append(motDizaine);

                if (unite == 1 && (dizaine >= 2 && dizaine <= 6)) {
                    mots.append(" et un ");
                } else if (unite > 0) {
                    mots.append("-").append(UNITES[unite]).append(" ");
                } else {
                    mots.append(" ");
                }
            }
        }

        return mots.toString().trim().replaceAll("\\s+", " ");
    }
}
