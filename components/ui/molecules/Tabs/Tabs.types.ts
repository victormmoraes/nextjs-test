export interface Tab {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  selectedTab?: string;
  onTabChange?: (tabId: string) => void;
}
