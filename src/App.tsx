/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X, 
  ShoppingBasket,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  User as UserIcon,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, PRODUCTS } from './constants';
import { Product, CartItem, User } from './types';

export default function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState<'shop' | 'admin' | 'summary' | 'checkout' | 'login' | 'register'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load cart from localStorage (Session simulation)
  useEffect(() => {
    const savedCart = localStorage.getItem('swiftshop_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('swiftshop_cart', JSON.stringify(cart));
  }, [cart]);

  // Filtered products logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !selectedCategoryId || product.categoryId === selectedCategoryId;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery, products]);

  const handleCreateProduct = (newProduct: Omit<Product, 'id'>) => {
    const productWithId = { ...newProduct, id: `p${products.length + 1}` };
    setProducts([...products, productWithId]);
    setView('shop');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleCheckout = (shippingDetails: any) => {
    // Decrease stock logic
    setProducts(prev => prev.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
      }
      return product;
    }));
    
    // Clear cart
    setCart([]);
    setView('shop');
    alert(`Acquisition successful for ${shippingDetails.fullName}! Your objects are being prepared for dispatch.`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-sans selection:bg-editorial-accent selection:text-white">
      {/* Navigation */}
      <nav className="px-6 md:px-12 py-8 flex justify-between items-end border-b border-editorial-text/10 sticky top-0 bg-editorial-bg/80 backdrop-blur-md z-40">
        <div className="text-3xl md:text-4xl font-serif tracking-tighter italic font-bold leading-none">SwiftShop</div>
        
        <div className="hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.25em] font-bold pb-1">
          <button 
            onClick={() => {
              setView('shop');
              setSelectedProduct(null);
              setSelectedCategoryId(null);
            }} 
            className={`transition-all ${view === 'shop' && !selectedProduct ? 'border-b border-editorial-text' : 'opacity-40 hover:opacity-100'}`}
          >
            Shop All
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`transition-all ${view === 'admin' ? 'border-b border-editorial-text' : 'opacity-40 hover:opacity-100'}`}
          >
            Dashboard
          </button>
          {currentUser ? (
            <div className="flex items-center gap-6">
              <span className="opacity-40 lowercase italic font-serif text-sm">Hello, {currentUser.username}</span>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setView('shop');
                }}
                className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2"
              >
                Logout <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setView('login')}
              className={`transition-all ${view === 'login' ? 'border-b border-editorial-text' : 'opacity-40 hover:opacity-100'}`}
            >
              Sign In
            </button>
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="relative hidden sm:block">
             <input 
              type="text" 
              placeholder="SEARCH" 
              className="bg-transparent border-b border-editorial-text/20 py-1 text-[10px] uppercase tracking-widest focus:outline-none focus:border-editorial-text w-32 md:w-48 placeholder:opacity-30"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setView('shop');
                setSelectedProduct(null);
              }}
            />
          </div>
          <button 
            onClick={() => setView('summary')}
            className="text-[10px] uppercase tracking-[0.25em] font-bold pb-1 flex items-center gap-2 group"
          >
            Cart <span className="opacity-40 group-hover:opacity-100">({cartCount.toString().padStart(2, '0')})</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
        {view === 'shop' && !selectedProduct ? (
          <>
            {/* Sidebar Categories */}
            <aside className="w-full lg:w-72 lg:border-r border-b lg:border-b-0 border-editorial-text/10 p-6 lg:p-12 flex flex-col gap-10">
              {/* ... category logic ... */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 mb-6">Categories</p>
                <ul className="space-y-4 font-serif text-2xl italic">
                  <li 
                    onClick={() => setSelectedCategoryId(null)}
                    className={`cursor-pointer transition-all hover:translate-x-1 ${!selectedCategoryId ? 'text-editorial-accent' : 'opacity-80 hover:opacity-100'}`}
                  >
                    All Objects
                  </li>
                  {CATEGORIES.map(cat => (
                    <li 
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`cursor-pointer transition-all hover:translate-x-1 ${selectedCategoryId === cat.id ? 'text-editorial-accent' : 'opacity-80 hover:opacity-100'}`}
                    >
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 lg:mt-auto">
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4">Newsletter</p>
                <div className="group flex items-center justify-between border-b border-editorial-text/20 py-2 cursor-pointer hover:border-editorial-text transition-colors">
                  <span className="text-xs opacity-50 italic font-serif group-hover:opacity-100 transition-opacity">Email address</span>
                  <span className="text-xs">→</span>
                </div>
              </div>
            </aside>

            {/* Hero & Featured Grid */}
            <section className="flex-1 flex flex-col overflow-hidden">
              {/* Hero Section */}
              {!selectedCategoryId && !searchQuery && (
                <div className="flex flex-col md:flex-row border-b border-editorial-text/10 min-h-[500px]">
                  <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-[0.3em] bg-editorial-text text-white px-2 py-1 self-start mb-10 font-bold">Featured Catalog</span>
                    <h1 className="text-6xl lg:text-8xl font-serif leading-[0.85] italic -tracking-[0.05em] mb-10">
                      Form Follows<br/><span className="text-editorial-accent">Function.</span>
                    </h1>
                    <p className="text-base md:text-lg leading-relaxed opacity-60 max-w-sm mb-12 font-serif italic">
                      A study in minimalism and structural integrity. Discover our latest series of curated essentials.
                    </p>
                    <button className="group border border-editorial-text w-max px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-editorial-text hover:text-white transition-all flex items-center gap-4">
                      Explore Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                  <div className="flex-1 bg-[#EAE8E2] border-t md:border-t-0 md:border-l border-editorial-text/10 relative overflow-hidden group">
                    <div className="absolute inset-0 p-12 lg:p-20">
                      <div className="w-full h-full bg-[#D9D7D1] shadow-2xl relative overflow-hidden flex items-center justify-center">
                        <img 
                          src="https://picsum.photos/seed/editorial-hero/1200/1200" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                          alt="Hero Product"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-editorial-text/10 mix-blend-multiply" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl md:text-[12rem] text-white/10 font-serif whitespace-nowrap select-none pointer-events-none italic">SERIES-01</div>
                      </div>
                    </div>
                    <div className="absolute bottom-10 right-10 text-right">
                      <p className="text-2xl lg:text-3xl font-serif italic mb-1 uppercase tracking-tighter">The Infinite Flask</p>
                      <p className="text-[10px] tracking-[0.4em] opacity-40 italic font-serif font-bold uppercase">Reserved — $89.00</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 flex-1">
                {filteredProducts.map((product, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-8 md:p-12 flex flex-col justify-between group cursor-pointer hover:bg-white transition-colors border-editorial-text/10 ${
                      index % 3 !== 2 ? 'xl:border-r' : ''
                    } border-b`}
                  >
                    <div className="flex justify-between items-start mb-12">
                      <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 transition-opacity">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">
                        {CATEGORIES.find(c => c.id === product.categoryId)?.name || 'Object'}
                      </span>
                    </div>

                    <div className="relative aspect-[4/5] mb-12 overflow-hidden bg-[#f0f0f0]">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-editorial-text/0 group-hover:bg-editorial-text/5 transition-all" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="absolute bottom-6 right-6 w-12 h-12 bg-white flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:bg-editorial-text hover:text-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-auto">
                      <h3 className="font-serif text-2xl lg:text-3xl italic mb-2 group-hover:text-editorial-accent transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-end border-t border-editorial-text/10 pt-4 mt-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black">
                          ${product.price.toFixed(2)}
                        </p>
                        <p className="text-[9px] uppercase tracking-[0.1em] opacity-40 font-bold">
                          {product.stock} units
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full p-24 text-center">
                    <h3 className="font-serif text-4xl italic opacity-30">Selection is void.</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] mt-4 opacity-40">Try a different search or category.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={addToCart} />
        ) : view === 'summary' ? (
          <CartSummary cart={cart} total={cartTotal} onUpdate={updateQuantity} onRemove={removeFromCart} onContinue={() => setView('shop')} onCheckout={() => setView('checkout')} />
        ) : view === 'checkout' ? (
          <CheckoutSection total={cartTotal} onComplete={handleCheckout} onCancel={() => setView('summary')} />
        ) : view === 'login' ? (
          <AuthSection mode="login" onAuth={(user) => { setCurrentUser(user); setView('shop'); }} onSwitch={() => setView('register')} />
        ) : view === 'register' ? (
          <AuthSection mode="register" onAuth={(user) => { setCurrentUser(user); setView('shop'); }} onSwitch={() => setView('login')} />
        ) : (
          <AdminPanel onCreateProduct={handleCreateProduct} onCancel={() => setView('shop')} />
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-editorial-text/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 40, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-editorial-bg z-50 shadow-2xl flex flex-col"
            >
              <div className="p-12 border-b border-editorial-text/10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-serif italic">Your Curations</h2>
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                    {cartCount} Items
                  </span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="group flex flex-col items-end gap-1"
                >
                  <X className="w-6 h-6 stroke-[1.5]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="font-serif text-2xl italic opacity-20">The archive is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-8 group">
                      <div className="w-32 h-40 bg-gray-100 flex-shrink-0 overflow-hidden relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-editorial-text/10 mix-blend-multiply opacity-50" />
                      </div>
                      <div className="flex-1 flex flex-col py-2">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif text-xl italic font-medium">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity font-bold"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 mb-auto">Cat. Object-00{item.id}</p>
                        
                        <div className="flex justify-between items-center mt-6">
                          <div className="flex items-center gap-4 border border-editorial-text/10 px-3 py-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-editorial-text/40 hover:text-editorial-text"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-editorial-text/40 hover:text-editorial-text"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-12 bg-white/30 backdrop-blur-md border-t border-editorial-text/5">
                <div className="flex justify-between items-end mb-10">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Investment Total</p>
                  <p className="text-4xl font-serif leading-none italic">${cartTotal.toFixed(2)}</p>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    setView('checkout');
                  }}
                  className="w-full bg-editorial-text text-white py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 disabled:bg-neutral-300 disabled:cursor-not-allowed group"
                >
                  Initiate Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-4 transition-all" />
                </button>
                <p className="text-[8px] uppercase tracking-widest text-center mt-6 opacity-30 italic font-bold">
                  Swift Delivery — Worldwide Archive Shipping
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating UI Cart Toggle (Mobile) */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed lg:hidden bottom-8 right-8 w-16 h-16 bg-editorial-text text-white rounded-full flex items-center justify-center z-40 shadow-2xl"
      >
        <ShoppingBasket className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-editorial-accent text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-4 border-editorial-bg">
            {cartCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}

function ProductDetail({ product, onBack, onAddToCart }: { product: Product, onBack: () => void, onAddToCart: (p: Product) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col md:flex-row bg-white"
    >
      <div className="flex-1 lg:flex-[1.5] bg-[#EAE8E2] border-r border-editorial-text/10 relative overflow-hidden flex items-center justify-center p-8 md:p-24">
        <button 
          onClick={onBack}
          className="absolute top-12 left-12 text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back
        </button>
        <div className="w-full max-w-2xl aspect-[4/5] shadow-2xl relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-editorial-text/10 mix-blend-multiply opacity-30" />
        </div>
      </div>

      <div className="flex-1 p-8 md:p-24 flex flex-col justify-center">
        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30 mb-8 border-b border-editorial-text/10 pb-4">
          Detail Archive / Obj-{product.id}
        </span>
        <h2 className="text-5xl md:text-7xl font-serif italic mb-6 leading-none tracking-tighter">
          {product.name}
        </h2>
        <p className="text-xl md:text-2xl font-serif italic opacity-60 mb-12 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-baseline gap-4 mb-20">
          <span className="text-4xl font-serif italic">${product.price.toFixed(2)}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Investment Piece</span>
        </div>

        <div className="flex flex-col gap-6">
          <button 
            onClick={() => onAddToCart(product)}
            className="w-full bg-editorial-text text-white py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-800 transition-all"
          >
            Add to Curation
          </button>
          <div className="flex justify-between items-center px-4 py-3 border border-editorial-text/10 rounded-lg">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">Inventory Status</span>
            <span className="text-[10px] font-black">{product.stock > 0 ? `${product.stock} Units Available` : 'Reserved'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AuthSection({ mode, onAuth, onSwitch }: { mode: 'login' | 'register', onAuth: (user: User) => void, onSwitch: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onAuth({
      id: 'u1',
      username: formData.username || formData.email.split('@')[0] || 'User',
      email: formData.email,
      role: 'customer'
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white/50 min-h-[calc(100vh-150px)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 border border-editorial-text/5 shadow-2xl"
      >
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-serif italic mb-2 tracking-tighter">
            {mode === 'login' ? 'Welcome Back.' : 'Join the Archive.'}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">
            {mode === 'login' ? 'Secure Authentication' : 'Create Access Profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Username</label>
              <input 
                required
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Email Address</label>
            <input 
              required
              type="email"
              className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-xl italic focus:outline-none focus:border-editorial-accent transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Security Code</label>
            <input 
              required
              type="password"
              className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-xl italic focus:outline-none focus:border-editorial-accent transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-editorial-text text-white py-6 text-[10px] uppercase tracking-[0.5em] font-black hover:bg-neutral-800 transition-all shadow-xl"
          >
            {mode === 'login' ? 'Enter Archive' : 'Establish Profile'}
          </button>
        </form>

        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
            {mode === 'login' ? "Haven't established a profile?" : "Already part of the archive?"}
          </p>
          <button 
            onClick={onSwitch}
            className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-editorial-text pb-1 hover:text-editorial-accent hover:border-editorial-accent transition-colors"
          >
            {mode === 'login' ? 'Register Now' : 'Sign In Here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminPanel({ onCreateProduct, onCancel }: { onCreateProduct: (p: Omit<Product, 'id'>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '1',
    stock: 0,
    image: 'https://picsum.photos/seed/new-object/800/800'
  });

  return (
    <div className="flex-1 p-8 md:p-24 max-w-4xl mx-auto w-full">
      <div className="mb-16 flex justify-between items-end border-b border-editorial-text/10 pb-12">
        <div>
          <h2 className="text-6xl font-serif italic mb-4 leading-none tracking-tighter">Archive<br/>Management.</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Administrator Portal</p>
        </div>
        <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest leading-none border-b border-editorial-text pb-1 mb-1">
          Exit Portal
        </button>
      </div>

      <form className="space-y-12" onSubmit={(e) => {
        e.preventDefault();
        onCreateProduct(formData);
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Object Name</label>
              <input 
                required
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Category Archive</label>
              <select 
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors cursor-pointer"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              >
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Price ($)</label>
              <input 
                required
                type="number"
                step="0.01"
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Initial Stock</label>
              <input 
                required
                type="number"
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Curation Background / Story</label>
          <textarea 
            required
            rows={4}
            className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-editorial-accent text-white py-8 text-[11px] uppercase tracking-[0.5em] font-black hover:bg-neutral-800 transition-all shadow-xl"
        >
          Add to Curated Collection
        </button>
      </form>
    </div>
  );
}

function CartSummary({ cart, total, onUpdate, onRemove, onContinue, onCheckout }: { 
  cart: CartItem[], 
  total: number, 
  onUpdate: (id: string, delta: number) => void, 
  onRemove: (id: string) => void,
  onContinue: () => void,
  onCheckout: () => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-8 md:p-24 max-w-6xl mx-auto w-full"
    >
      <div className="flex flex-col lg:flex-row gap-20">
        <div className="flex-[1.5]">
          <div className="mb-12 border-b border-editorial-text/10 pb-8 flex justify-between items-end">
            <div>
              <h2 className="text-6xl font-serif italic mb-2 tracking-tighter">Your Archive.</h2>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Selected Objects for Acquisition</p>
            </div>
            <button onClick={onContinue} className="text-[10px] font-black uppercase tracking-widest border-b border-editorial-text pb-1">
              Continue Selection
            </button>
          </div>

          <div className="space-y-12">
            {cart.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-editorial-text/10 rounded-3xl">
                <p className="font-serif text-2xl italic opacity-30">No objects curated yet.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-8 group">
                  <div className="w-full sm:w-48 aspect-[3/4] bg-[#EAE8E2] overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className="flex-1 flex flex-col pt-2">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-3xl font-serif italic">{item.name}</h3>
                      <p className="text-xl font-serif italic">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-serif italic opacity-50 max-w-lg mb-8">{item.description}</p>
                    
                    <div className="mt-auto flex justify-between items-center bg-white p-4 border border-editorial-text/5 shadow-sm">
                      <div className="flex items-center gap-6">
                        <span className="text-[9px] uppercase tracking-widest font-black opacity-30">Quantity</span>
                        <div className="flex items-center gap-4">
                          <button onClick={() => onUpdate(item.id, -1)} className="text-editorial-text/40 hover:text-editorial-text transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdate(item.id, 1)} className="text-editorial-text/40 hover:text-editorial-text transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <p className="text-lg font-serif italic font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-editorial-text/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white p-12 border border-editorial-text/5 shadow-2xl sticky top-32">
            <h3 className="text-2xl font-serif italic mb-8 pb-4 border-b border-editorial-text/10">Summary</h3>
            <div className="space-y-6 mb-12">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-40">
                <span>Object Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold opacity-40">
                <span>Shipping Archive</span>
                <span className="text-editorial-accent italic lowercase">Calculated at dispatch</span>
              </div>
              <div className="pt-6 border-t border-editorial-text/10 flex justify-between items-end">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">Investment Total</span>
                <span className="text-4xl font-serif italic leading-none">${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              disabled={cart.length === 0}
              onClick={onCheckout}
              className="w-full bg-editorial-text text-white py-6 text-[10px] uppercase tracking-[0.5em] font-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 disabled:bg-neutral-300 group"
            >
              Initiate Acquisition
              <ArrowRight className="w-4 h-4 group-hover:translate-x-4 transition-transform" />
            </button>
            <p className="text-[8px] uppercase tracking-[0.3em] text-center mt-6 opacity-30 italic font-bold">
              Secure Transaction — Certified Swift Delivery
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CheckoutSection({ total, onComplete, onCancel }: { total: number, onComplete: (details: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    cardNumber: '**** **** **** 4242',
    expiry: '12/28',
    cvv: '***'
  });

  return (
    <div className="flex-1 p-8 md:p-24 max-w-4xl mx-auto w-full">
      <div className="mb-16 flex justify-between items-end border-b border-editorial-text/10 pb-12">
        <div>
          <h2 className="text-6xl font-serif italic mb-4 leading-none tracking-tighter">Secure<br/>Acquisition.</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Finalize Investment</p>
        </div>
        <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest border-b border-editorial-text pb-1">
          Back to Archive
        </button>
      </div>

      <form className="space-y-16" onSubmit={(e) => {
        e.preventDefault();
        onComplete(formData);
      }}>
        <div className="space-y-12">
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold border-b border-editorial-text/5 pb-4">Shipping Protocol</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Legal Full Name</label>
              <input 
                required
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Correspondence Email</label>
              <input 
                required
                type="email"
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Destination Address</label>
              <input 
                required
                className="bg-transparent border-b border-editorial-text/10 py-3 font-serif text-2xl italic focus:outline-none focus:border-editorial-accent transition-colors"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <h3 className="text-sm uppercase tracking-[0.3em] font-bold border-b border-editorial-text/5 pb-4">Payment Registry</h3>
          <div className="bg-[#fcfcfc] p-10 border border-editorial-text/5 shadow-inner space-y-10">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Secured Card Information</label>
              <div className="flex items-center justify-between border-b border-editorial-text/10 py-3">
                <span className="font-mono text-xl tracking-widest text-editorial-text/40">{formData.cardNumber}</span>
                <span className="text-[10px] uppercase tracking-widest font-black opacity-30 italic">Mock Integration Active</span>
              </div>
            </div>
            <div className="flex gap-12">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">Expiry</label>
                <div className="border-b border-editorial-text/10 py-3 font-mono text-xl text-editorial-text/40">{formData.expiry}</div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">CVV</label>
                <div className="border-b border-editorial-text/10 py-3 font-mono text-xl text-editorial-text/40">{formData.cvv}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex justify-between items-end mb-10 border-t border-editorial-text/10 pt-10">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Archive Investment</p>
              <p className="text-[8px] uppercase tracking-widest opacity-20">Terms and protocol apply.</p>
            </div>
            <p className="text-6xl font-serif leading-none italic">${total.toFixed(2)}</p>
          </div>
          <button 
            type="submit"
            className="w-full bg-editorial-accent text-white py-8 text-[11px] uppercase tracking-[0.6em] font-black hover:bg-neutral-800 transition-all shadow-xl flex items-center justify-center gap-4"
          >
            Confirm Acquisition
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
