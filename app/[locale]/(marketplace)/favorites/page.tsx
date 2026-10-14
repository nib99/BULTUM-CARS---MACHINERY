import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
      <h1 className="text-xl font-bold">{t("favorites")}</h1>
      <p className="mt-2 text-muted-foreground">
        Save listings you like. They will appear here.
      </p>
      <Button asChild className="mt-6">
        <Link href="/search">Browse listings</Link>
      </Button>
    </div>
  );
}
