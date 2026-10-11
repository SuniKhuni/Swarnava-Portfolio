// Re-mounts on every navigation. With reduced motion, routes fade in over 150 ms
// instead of playing the tape transition (§11); otherwise this wrapper does nothing.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
