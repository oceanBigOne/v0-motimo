import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Mentions legales - Motimo",
  description: "Mentions legales de l'application Motimo",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-pink-50 to-amber-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au jeu
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mentions legales
          </h1>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Editeur</h2>
            <p className="text-gray-600">
              Motimo est une application educative pour enfants developpee a des fins pedagogiques.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Hebergement</h2>
            <p className="text-gray-600">
              Ce site est heberge par Vercel Inc.
            </p>
            <address className="text-gray-600 not-italic">
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133<br />
              Covina, CA 91723<br />
              United States
            </address>
            <p className="text-gray-600">
              Site web :{" "}
              <a 
                href="https://vercel.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://vercel.com
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Donnees personnelles</h2>
            <p className="text-gray-600">
              Cette application ne collecte aucune donnee personnelle. 
              Les preferences de jeu (volume, affichage) sont stockees localement 
              sur votre appareil via le localStorage du navigateur et ne sont 
              jamais transmises a un serveur.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Cookies</h2>
            <p className="text-gray-600">
              Cette application n&apos;utilise pas de cookies a des fins de suivi ou de publicite.
              Seul le localStorage est utilise pour sauvegarder vos preferences de jeu.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Propriete intellectuelle</h2>
            <p className="text-gray-600">
              Les emojis utilises dans cette application sont la propriete de leurs 
              createurs respectifs et sont affiches via les polices systeme de votre appareil.
            </p>
            <p className="text-gray-600">
              Le logo et le nom &quot;Motimo&quot; sont des creations originales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant cette application, vous pouvez nous contacter 
              via les informations disponibles sur le depot du projet.
            </p>
          </section>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Derniere mise a jour : Mai 2026
        </p>
      </div>
    </main>
  );
}
