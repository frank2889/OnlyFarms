import type { ComponentType, SVGProps } from "react";
import type { CatalogItem, CategoryKey } from "@/lib/catalog";
import {
  AppleIcon,
  BeerIcon,
  BreadIcon,
  CarrotIcon,
  CheeseIcon,
  EggIcon,
  FlowerIcon,
  HoneyIcon,
  JarIcon,
  MeatIcon,
  MilkIcon,
  PotatoIcon,
  StoreIcon,
  WineIcon,
} from "@/components/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_ICONS: Record<CategoryKey, Icon> = {
  zuivel: MilkIcon,
  eieren: EggIcon,
  kaas: CheeseIcon,
  vlees: MeatIcon,
  groente: CarrotIcon,
  fruit: AppleIcon,
  aardappelen: PotatoIcon,
  brood: BreadIcon,
  zoet: HoneyIcon,
  dranken: BeerIcon,
  overig: StoreIcon,
};

const ITEM_ICONS: Record<string, Icon> = {
  wijn: WineIcon,
  jam: JarIcon,
  sap: JarIcon,
  bloemen: FlowerIcon,
  honing: HoneyIcon,
};

export function iconForItem(item: Pick<CatalogItem, "key" | "category">): Icon {
  return ITEM_ICONS[item.key] ?? CATEGORY_ICONS[item.category];
}

export function iconForCategory(key: CategoryKey): Icon {
  return CATEGORY_ICONS[key];
}
