import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  if (online) return null;
  return <div className="fixed inset-x-0 bottom-0 z-[80] flex items-center justify-center gap-2 border-t border-warning/30 bg-warning-soft px-4 py-2 text-xs text-warning-foreground"><WifiOff className="size-4"/>Offline — showing saved records. Connect to create or update records.</div>;
}