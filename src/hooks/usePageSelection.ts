import { useCallback } from "react";
import type { PdfPage } from "../types/storyboard";

type UpdatePages = (updater: (pages: PdfPage[]) => PdfPage[]) => void;

/**
 * Selection and ordering live apart from PDF loading.
 * The array order of `pages` IS the storyboard order.
 */
export function usePageSelection(pages: PdfPage[], updatePages: UpdatePages) {
  const selectedCount = pages.filter((page) => page.selected).length;
  const allSelected = pages.length > 0 && selectedCount === pages.length;
  const noneSelected = selectedCount === 0;

  const toggleSelected = useCallback(
    (pageNumber: number) => {
      updatePages((current) =>
        current.map((page) =>
          page.pageNumber === pageNumber
            ? { ...page, selected: !page.selected }
            : page,
        ),
      );
    },
    [updatePages],
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      updatePages((current) =>
        current.map((page) =>
          page.selected === selected ? page : { ...page, selected },
        ),
      );
    },
    [updatePages],
  );

  const selectAll = useCallback(() => setAllSelected(true), [setAllSelected]);
  const clearSelection = useCallback(
    () => setAllSelected(false),
    [setAllSelected],
  );

  /**
   * Moves a page by its source page number, not by a captured index,
   * so the handler stays correct after previous moves.
   */
  const movePage = useCallback(
    (pageNumber: number, offset: number) => {
      updatePages((current) => {
        const from = current.findIndex(
          (page) => page.pageNumber === pageNumber,
        );
        const to = from + offset;
        if (from < 0 || to < 0 || to >= current.length) return current;

        const next = [...current];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
    [updatePages],
  );

  return {
    selectedCount,
    allSelected,
    noneSelected,
    toggleSelected,
    selectAll,
    clearSelection,
    movePage,
  };
}
