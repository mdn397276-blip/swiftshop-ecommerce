from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from .models import Product, Category
from .cart import Cart

def product_list(request, category_slug=None):
    """
    Home page view: List all products or filter by category.
    """
    category = None
    categories = Category.objects.all()
    products = Product.objects.filter(stock__gt=0)
    
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)
    
    return render(request, 'shop/product/list.html', {
        'category': category,
        'categories': categories,
        'products': products
    })

def product_detail(request, id, slug):
    """
    Detail page for a specific product.
    """
    product = get_object_or_404(Product, id=id, slug=slug, stock__gt=0)
    return render(request, 'shop/product/detail.html', {'product': product})

@require_POST
def cart_add(request, product_id):
    """
    Action to add a product to the session cart.
    """
    cart = Cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart.add(product=product)
    return redirect('cart:cart_detail')

def cart_detail(request):
    """
    Cart Summary page view.
    """
    cart = Cart(request)
    return render(request, 'shop/cart/detail.html', {'cart': cart})

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .forms import UserRegistrationForm

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('shop:product_list')
    else:
        form = UserRegistrationForm()
    return render(request, 'registration/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('shop:product_list')
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})

def user_logout(request):
    logout(request)
    return redirect('shop:product_list')
