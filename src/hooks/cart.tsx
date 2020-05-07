import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@gomarketplace:2');
      if (response) {
        const toConvert = JSON.parse(response);
        setProducts([...toConvert]);
      }
      console.log(response);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function save(): Promise<void> {
      await AsyncStorage.setItem(
        '@gomarketplace:2',
        JSON.stringify([...products]),
      );
    }
    save();
  }, [products]);

  const increment = useCallback(
    async id => {
      const data = products.findIndex(item => item.id === id);
      if (data === -1) {
        return;
      }
      const newProduct = [...products];
      newProduct[data] = {
        ...newProduct[data],
        quantity: newProduct[data].quantity + 1,
      };
      setProducts([...newProduct]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const data = products.findIndex(item => item.id === id);
      if (data === -1) {
        return;
      }
      const newProduct = [...products];
      newProduct[data] = {
        ...newProduct[data],
        quantity: newProduct[data].quantity - 1,
      };
      setProducts([...newProduct]);
    },
    [products],
  );
  const addToCart = useCallback(
    async (product: Product) => {
      const { ...rest } = product;
      const data = products.find(item => item.id === rest.id);
      setProducts([...products, { ...rest }]);
      if (data) {
        await increment(data.id);
        return;
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
