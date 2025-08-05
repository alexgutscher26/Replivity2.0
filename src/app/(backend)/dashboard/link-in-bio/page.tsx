import { LinkInBioCreator } from "./_components/link-in-bio-creator";

export default function LinkInBioPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Link-in-Bio Creator</h1>
        <p className="text-muted-foreground mt-2">
          Create a beautiful landing page with all your important links in one place. Perfect for social media profiles.
        </p>
      </div>
      <LinkInBioCreator />
    </div>
  );
}