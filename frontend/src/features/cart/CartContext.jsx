import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const STORAGE_KEY_ITEMS = 'himar_cart_items';
const STORAGE_KEY_NOTE = 'himar_cart_note';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_NOTE) || '';
    } catch {
      return '';
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTE, note);
    } catch {
      // ignore
    }
  }, [note]);

  const addToCart = (menu, variant = null, quantity = 1) => {
    setItems((prev) => {
      const variantName = variant?.name || null;
      const extraPrice = variant?.extra_price || 0;

      const existingIndex = prev.findIndex(
        (i) => i.menu_id === menu.id && (i.variant || null) === variantName
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const nextQty = Math.min(50, next[existingIndex].quantity + quantity);
        next[existingIndex] = { ...next[existingIndex], quantity: nextQty };
        toast.success(`Jumlah ${menu.name} diperbarui di keranjang`);
        return next;
      }

      toast.success(`${menu.name} ditambahkan ke keranjang`);
      return [
        ...prev,
        {
          menu_id: menu.id,
          name: menu.name,
          price: menu.price,
          variant: variantName,
          extra_price: extraPrice,
          quantity: Math.min(50, quantity),
          image_url: menu.image_url,
        },
      ];
    });
  };

  const updateQuantity = (menu_id, variant, delta) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.menu_id === menu_id && (item.variant || null) === (variant || null)) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: Math.min(50, nextQty) };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (menu_id, variant) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.menu_id === menu_id && (i.variant || null) === (variant || null))
      )
    );
    toast.success('Item dihapus dari keranjang');
  };

  const clearCart = () => {
    setItems([]);
    setNote('');
    try {
      localStorage.removeItem(STORAGE_KEY_ITEMS);
      localStorage.removeItem(STORAGE_KEY_NOTE);
    } catch {
      // ignore
    }
  };

  const totalQuantity = items.reduce((acc, cur) => acc + cur.quantity, 0);
  const estimatedTotal = items.reduce(
    (acc, cur) => acc + (cur.price + (cur.extra_price || 0)) * cur.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        note,
        setNote,
        isOpen,
        setIsOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalQuantity,
        estimatedTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
