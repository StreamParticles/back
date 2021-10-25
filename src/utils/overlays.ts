import {
  BaseVariationType,
  OverlayData,
  WidgetsKinds,
  WithVariationsWidget,
} from "@streamparticles/lib";

const defaultWidgetNameMapper = {
  [WidgetsKinds.ALERTS]: "Alerts set",
  [WidgetsKinds.DONATION_BAR]: "Donation bar",
  [WidgetsKinds.DONATIONS_LISTING]: "Donations Listings",
  [WidgetsKinds.CUSTOM_WIDGET]: "Custom Widget",
  [WidgetsKinds.NFTs]: "NFTs",
  [WidgetsKinds.PARTICLES_FALLS]: "Particles Falls",
};

export const defaultWidgetName = (
  overlay: OverlayData,
  widgetKind: WidgetsKinds,
  compelledName: string | null = null,
  copyIter = 0
): string => {
  const base =
    compelledName ||
    `${defaultWidgetNameMapper[widgetKind]} ${overlay.widgets.length}`;

  if (base.includes("copy")) {
    const str = base.split(" copy ");

    return `${str[0]} copy ${Number(str[1]) + 1}`;
  }

  const name = copyIter ? `${base} copy ${copyIter}` : base;

  return overlay.widgets.some((widget) => name === widget.name)
    ? defaultWidgetName(overlay, widgetKind, compelledName, copyIter + 1)
    : name;
};

export const defaultVariationName = (
  widget: WithVariationsWidget<{} & BaseVariationType>,
  compelledName: string | null = null,
  copyIter = 0
): string => {
  const base = compelledName || `Variation ${widget.variations.length}`;

  if (base.includes("copy")) {
    const str = base.split(" copy ");

    return `${str[0]} copy ${Number(str[1]) + 1}`;
  }

  const name = copyIter ? `${base} copy ${copyIter}` : `${base}`;

  return widget.variations.some((variation) => name === variation.name)
    ? defaultVariationName(widget, compelledName, copyIter + 1)
    : name;
};
