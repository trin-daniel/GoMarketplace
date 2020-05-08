import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';

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
      const response = await AsyncStorage.getItem('@gomarketplace');
      if (!response) {
        Alert.alert('Error founded', 'Not exist items in cart');
      } else {
        const parser = JSON.parse(response);
        console.log(parser);
        setProducts([...parser]);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function save(): Promise<void> {
      await AsyncStorage.setItem(
        '@gomarketplace',
        JSON.stringify([...products]),
      );
    }
    save();
  }, [products]);

  const addToCart = useCallback(
    async (product: Product) => {
      const { ...rest } = product;
      const findProductById = products.findIndex(item => item.id === rest.id);
      const dataProduct = { ...rest };
      if (findProductById === -1) {
        setProducts([...products, dataProduct]);
      } else {
        const updateProduct = [...products];
        updateProduct[findProductById] = {
          ...updateProduct[findProductById],
          quantity: updateProduct[findProductById].quantity + 1,
        };
        setProducts([...updateProduct]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async (id: string) => {
      const findById = products.findIndex(item => item.id === id);
      if (findById === -1) {
        return;
      }
      const el = [...products];
      el[findById] = {
        ...el[findById],
        quantity: el[findById].quantity + 1,
      };
      setProducts([...el]);
      // await AsyncStorage.setItem('@gomarketplace', JSON.stringify(el));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findById = products.findIndex(item => item.id === id);
      if (findById === -1) {
        return;
      }
      const el = [...products];
      if (el[findById].quantity === 0)
        return Alert.alert(
          'Operation is not permited',
          'not exist quantity less than zero',
        );
      el[findById] = {
        ...el[findById],
        quantity: el[findById].quantity - 1,
      };
      setProducts([...el]);
      // await AsyncStorage.setItem('@gomarketplace', JSON.stringify(el));
    },
    [products],
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
