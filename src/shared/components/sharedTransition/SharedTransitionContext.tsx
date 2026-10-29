import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CardLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SharedTransitionContextType {
  activeItem: any | null;
  sourceLayout: CardLayout | null;
  isOverlayVisible: boolean;
  openProduct: (item: any, layout: CardLayout) => void;
  hideProduct: () => void;
  showProduct: () => void;
  closeProduct: () => void;
}

const SharedTransitionContext = createContext<SharedTransitionContextType>({
  activeItem: null,
  sourceLayout: null,
  isOverlayVisible: false,
  openProduct: () => {},
  hideProduct: () => {},
  showProduct: () => {},
  closeProduct: () => {},
});

export const useSharedTransition = () => useContext(SharedTransitionContext);

interface SharedTransitionProviderProps {
  children: ReactNode;
}

export const SharedTransitionProvider = ({ children }: SharedTransitionProviderProps) => {
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [sourceLayout, setSourceLayout] = useState<CardLayout | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const openProduct = (item: any, layout: CardLayout) => {
    setActiveItem(item);
    setSourceLayout(layout);
    setIsOverlayVisible(true);
  };

  const hideProduct = () => {
    setIsOverlayVisible(false);
  };

  const showProduct = () => {
    if (activeItem && sourceLayout) {
      setIsOverlayVisible(true);
    }
  };

  const closeProduct = () => {
    setActiveItem(null);
    setSourceLayout(null);
    setIsOverlayVisible(false);
  };

  return (
    <SharedTransitionContext.Provider
      value={{
        activeItem,
        sourceLayout,
        isOverlayVisible,
        openProduct,
        hideProduct,
        showProduct,
        closeProduct,
      }}
    >
      {children}
    </SharedTransitionContext.Provider>
  );
};
