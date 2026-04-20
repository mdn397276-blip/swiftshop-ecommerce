/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Water Bottles', slug: 'water-bottles' },
  { id: '2', name: 'Gadgets', slug: 'gadgets' },
  { id: '3', name: 'Kids Toys', slug: 'kids-toys' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Arctic Flow Insulated Bottle',
    description: 'Keep your drinks cold for 24 hours with our triple-walled stainless steel bottle.',
    price: 34.00,
    image: 'https://picsum.photos/seed/bottle1/800/800',
    stock: 50,
    categoryId: '1',
  },
  {
    id: 'p2',
    name: 'Smart Hydration Tracker',
    description: 'A Bluetooth-enabled bottle that syncs with your phone to track daily intake.',
    price: 59.99,
    image: 'https://picsum.photos/seed/bottle2/800/800',
    stock: 15,
    categoryId: '1',
  },
  {
    id: 'p3',
    name: 'Nebula Noise-Cancelling Buds',
    description: 'Immersive sound with adaptive noise-cancelling technology.',
    price: 129.00,
    image: 'https://picsum.photos/seed/gadget1/800/800',
    stock: 30,
    categoryId: '2',
  },
  {
    id: 'p4',
    name: 'Nano Drone Pro',
    description: 'Ultra-lightweight drone with 4K camera and 20-minute flight time.',
    price: 199.00,
    image: 'https://picsum.photos/seed/gadget2/800/800',
    stock: 10,
    categoryId: '2',
  },
  {
    id: 'p5',
    name: 'Solar System Explorer Kit',
    description: 'Build and paint your own glowing solar system model.',
    price: 24.50,
    image: 'https://picsum.photos/seed/toy1/800/800',
    stock: 100,
    categoryId: '3',
  },
  {
    id: 'p6',
    name: 'Magnetic Building Tiles',
    description: '100-piece set of colorful magnetic tiles for creative building.',
    price: 45.00,
    image: 'https://picsum.photos/seed/toy2/800/800',
    stock: 45,
    categoryId: '3',
  },
];
