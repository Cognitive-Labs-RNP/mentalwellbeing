import { Brain } from 'lucide-react';
import { useAppStore } from '../../store';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

export function NavbarDynamicTab(): NavItemConfig | null {
  const activeCondition = useAppStore((state) => state.activeCondition);

  if (!activeCondition) return null;

  return {
    id: `condition-${activeCondition.id}`,
    label: `${activeCondition.icon} ${activeCondition.name}`,
    icon: <Brain className="h-5 w-5" />,
    to: `/${activeCondition.id}`,
  };
}
