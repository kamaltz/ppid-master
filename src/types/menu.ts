export interface DropdownItem {
  label: string;
  url: string;
}

export interface MenuItem {
  label: string;
  url: string;
  hasDropdown: boolean;
  dropdownItems: DropdownItem[];
}