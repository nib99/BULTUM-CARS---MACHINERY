// Minimal select placeholder – install full shadcn select later with: npx shadcn@latest add select
export function Select({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
export function SelectTrigger({ children, className }: any) {
  return <button className={className}>{children}</button>;
}
export function SelectValue() {
  return null;
}
export function SelectContent({ children }: any) {
  return <div>{children}</div>;
}
export function SelectItem({ children, value }: any) {
  return <div data-value={value}>{children}</div>;
}
