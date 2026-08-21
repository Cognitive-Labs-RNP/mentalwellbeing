import { Heart } from 'lucide-react';
import { useAppStore } from '../../store';
import { getConditionConfig } from '../../conditions';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
}

export function NavbarDynamicTab(): NavItemConfig | null {
  const activeCondition = useAppStore((state) => state.activeCondition);

  if (!activeCondition) return null;

  const config = getConditionConfig(activeCondition);

  return {
    id: `condition-${config.conditionId}`,
    label: config.name,
    icon: <Heart className="h-5 w-5" />,
    to: `/${config.conditionId}`,
  };
}
