import { View } from "./View";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <View slug={slug} />;
}
