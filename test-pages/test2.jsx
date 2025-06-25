import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Heart, Star, Play, Calendar, Mail, Phone, MapPin, Clock, Download, Share2, Filter, SortAsc, Grid, List, ChevronDown, X, Plus, Minus, Edit, Trash2, Settings, Bell, Home, Menu, ArrowRight, ArrowLeft, Eye, EyeOff, Lock, Unlock, Check, AlertCircle, Info, HelpCircle, Camera, Image, Video, Music, File, Folder, Save, Upload, Power, Wifi, Battery, Volume2, VolumeX, Bluetooth, Smartphone, Laptop, Monitor, Printer, Headphones, Mic, Speaker, Gamepad2, Zap, Shield, Globe, Database, Server, Cloud, Link, Unlink, Copy, Scissors, Paperclip, Tag, Bookmark, Flag, Award, Gift, Trophy, Medal, Crown, Diamond, Coffee, Pizza, Car, Plane, Train, Bike, Dumbbell, Sun, Moon, CloudRain, Wind, Thermometer, Umbrella, Mountain, Flower, Leaf, Bug, Fish, Dog, Cat, Bird, Rabbit, Turtle } from 'lucide-react';

export default function AccessibilityTestApp() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    newsletter: false,
    terms: false
  });

  const products = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, rating: 4.5, image: '/api/placeholder/200/200', category: 'Electronics' },
    { id: 2, name: 'Smart Watch', price: 299.99, rating: 4.8, image: '/api/placeholder/200/200', category: 'Electronics' },
    { id: 3, name: 'Coffee Maker', price: 79.99, rating: 4.2, image: '/api/placeholder/200/200', category: 'Home' },
    { id: 4, name: 'Gaming Mouse', price: 49.99, rating: 4.6, image: '/api/placeholder/200/200', category: 'Electronics' },
    { id: 5, name: 'Yoga Mat', price: 29.99, rating: 4.3, image: '/api/placeholder/200/200', category: 'Sports' },
    { id: 6, name: 'Desk Lamp', price: 39.99, rating: 4.4, image: '/api/placeholder/200/200', category: 'Home' }
  ];

  const slides = [
    { title: 'Summer Sale', subtitle: 'Up to 50% off on selected items', bg: 'bg-red-500' },
    { title: 'New Arrivals', subtitle: 'Check out our latest products', bg: 'bg-blue-500' },
    { title: 'Free Shipping', subtitle: 'On orders over $50', bg: 'bg-green-500' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/api/placeholder/40/40" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-blue-600">ShopEasy</h1>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full px-4 py-2 border rounded-lg pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              </div>
              
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600 cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-gray-600" />
                <span className="text-sm">{isLoggedIn ? 'John Doe' : 'Guest'}</span>
              </div>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-200"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <a href="#" className="py-4 px-2 hover:bg-blue-700">Home</a>
            <a href="#" className="py-4 px-2 hover:bg-blue-700">Electronics</a>
            <a href="#" className="py-4 px-2 hover:bg-blue-700">Fashion</a>
            <a href="#" className="py-4 px-2 hover:bg-blue-700">Home & Garden</a>
            <a href="#" className="py-4 px-2 hover:bg-blue-700">Sports</a>
            <a href="#" className="py-4 px-2 hover:bg-blue-700">Contact</a>
          </div>
        </div>
      </nav>

      <div className="relative h-64 overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className={`w-full h-full flex-shrink-0 ${slide.bg} flex items-center justify-center text-white`}>
              <div className="text-center">
                <h2 className="text-4xl font-bold">{slide.title}</h2>
                <p className="text-xl mt-2">{slide.subtitle}</p>
                <button className="mt-4 bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Electronics</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Home</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Sports</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Price Range</h4>
                <input type="range" min="0" max="500" className="w-full" />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>$0</span>
                  <span>$500</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input type="radio" name="rating" className="mr-2" />
                      <div className="flex">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {[...Array(5-rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                      <span className="ml-2">& up</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              
              <div className="flex items-center space-x-4">
                <select className="border rounded-lg px-3 py-2">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Customer Rating</option>
                </select>
                
                <div className="flex border rounded-lg">
                  <button className="p-2 hover:bg-gray-100">
                    <Grid className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img src={product.image} className="w-full h-48 object-cover" />
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                      Sale
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                <div>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <input 
                    type="tel" 
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <textarea 
                    placeholder="Your Message"
                    rows="5"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Subscribe to our newsletter</span>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Send Message
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Address</h4>
                  <p className="text-gray-600">123 Shopping Street, City, State 12345</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-gray-600">support@shopeasy.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Hours</h4>
                  <p className="text-gray-600">Mon - Fri: 9AM - 6PM</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ShopEasy</h3>
              <p className="text-gray-400">Your one-stop shop for everything you need.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white">About Us</a>
                <a href="#" className="block text-gray-400 hover:text-white">Contact</a>
                <a href="#" className="block text-gray-400 hover:text-white">FAQ</a>
                <a href="#" className="block text-gray-400 hover:text-white">Shipping</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white">Electronics</a>
                <a href="#" className="block text-gray-400 hover:text-white">Fashion</a>
                <a href="#" className="block text-gray-400 hover:text-white">Home</a>
                <a href="#" className="block text-gray-400 hover:text-white">Sports</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Globe className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Mail className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Phone className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2024 ShopEasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}