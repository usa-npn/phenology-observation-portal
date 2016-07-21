export interface PartnerGroup {
  network_id: number;
  network_name: string;
  secondary_network: PartnerGroup[];
  tertiary_network: PartnerGroup[];
  quaternary_network: PartnerGroup[];
  selected: boolean;
  collapsed: boolean;
}
