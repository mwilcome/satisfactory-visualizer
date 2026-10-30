import { isBeltMk, type BeltMk } from "../data/catalog";
import {
  CHAINS,
  isChainId,
  isProductId,
  productOf,
  type ChainId,
  type ProductId,
} from "../data/chains";

/** First visit, and the Demo button: Cast Screws at Mk3. */
export const DEFAULT_CHAIN_ID: ChainId = "cast-screw";
export const DEFAULT_BELT_MK: BeltMk = 3;
export const STORAGE_KEY = "satisfactory-visualizer.v1";

export interface Selection {
  chainId: ChainId;
  mk: BeltMk;
  byProduct: Partial<Record<ProductId, ChainId>>;
}

export function defaultSelection(): Selection {
  return {
    chainId: DEFAULT_CHAIN_ID,
    mk: DEFAULT_BELT_MK,
    byProduct: { screws: DEFAULT_CHAIN_ID },
  };
}

/** Restore the last output and belt mark. Anything unreadable falls back to the demo. */
export function parseSelection(raw: string | null): Selection {
  const fallback = defaultSelection();
  if (!raw) return fallback;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!value || typeof value !== "object") return fallback;
  const record = value as { chainId?: unknown; mk?: unknown; byProduct?: unknown };
  if (!isChainId(record.chainId) || !isBeltMk(record.mk)) return fallback;
  const byProduct = sanitizeByProduct(record.byProduct);
  byProduct[productOf(record.chainId)] = record.chainId;
  return { chainId: record.chainId, mk: record.mk, byProduct };
}

export function serializeSelection(selection: Selection): string {
  return JSON.stringify(selection);
}

function sanitizeByProduct(value: unknown): Partial<Record<ProductId, ChainId>> {
  if (!value || typeof value !== "object") return {};
  const clean: Partial<Record<ProductId, ChainId>> = {};
  for (const [key, chainId] of Object.entries(value)) {
    if (!isProductId(key) || !isChainId(chainId)) continue;
    if (CHAINS[chainId].productId !== key) continue;
    clean[key] = chainId;
  }
  return clean;
}
