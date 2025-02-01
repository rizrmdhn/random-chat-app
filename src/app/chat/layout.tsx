interface LayoutChatProps {
  children: React.ReactNode;
}

export default async function LayoutChat({
  children,
}: Readonly<LayoutChatProps>) {
  return children;
}
