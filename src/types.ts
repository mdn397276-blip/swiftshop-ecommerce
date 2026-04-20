/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'customer' | 'admin';
}

export interface CartItem extends Product {
  quantity: number;
}
