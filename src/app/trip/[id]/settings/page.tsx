import { SettingsForm } from "./settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SettingsForm groupId={id} />;
}
